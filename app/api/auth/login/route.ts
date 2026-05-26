import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Manglende felt" }, { status: 400 });
  }

  const coach = await prisma.coach.findUnique({ where: { email } });
  if (!coach) {
    return NextResponse.json({ error: "Feil e-post eller passord" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, coach.password);
  if (!valid) {
    return NextResponse.json({ error: "Feil e-post eller passord" }, { status: 401 });
  }

  const token = signToken({ coachId: coach.id, email: coach.email, fullName: coach.full_name });

  const response = NextResponse.json({ message: "Logget inn" });
  response.cookies.set("fotball-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
