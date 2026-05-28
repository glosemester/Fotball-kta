import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google", req.url));
  }

  // Validate state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  redirectUri,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=token", req.url));
  }

  const { access_token } = await tokenRes.json();

  // Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/login?error=userinfo", req.url));
  }

  const { id: googleId, email, name } = await userRes.json() as {
    id: string; email: string; name: string;
  };

  // Find or create coach
  let coach = await prisma.coach.findFirst({
    where: { OR: [{ google_id: googleId }, { email }] },
  });

  if (!coach) {
    coach = await prisma.coach.create({
      data: { email, full_name: name, google_id: googleId },
    });
  } else if (!coach.google_id) {
    coach = await prisma.coach.update({
      where: { id: coach.id },
      data: { google_id: googleId },
    });
  }

  const token = signToken({ coachId: coach.id, email: coach.email, fullName: coach.full_name });

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("fotball-token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.delete("oauth_state");
  return res;
}
