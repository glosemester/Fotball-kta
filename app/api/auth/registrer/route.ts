import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password, full_name, club_name } = await request.json();

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Manglende felt" }, { status: 400 });
  }

  const existing = await prisma.coach.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-posten er allerede registrert" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const coach = await prisma.coach.create({
    data: {
      email,
      password: hashed,
      full_name,
      club_name: club_name || null,
    },
  });

  const token = signToken({ coachId: coach.id, email: coach.email, fullName: coach.full_name });

  const response = NextResponse.json({ message: "Registrert" }, { status: 201 });
  response.cookies.set("fotball-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
