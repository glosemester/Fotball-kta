import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { coach_id: session.coachId },
    include: { team: { select: { id: true, name: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, opponent, is_home, location, competition, notes, team_id } = body;

  if (!date || !opponent) {
    return NextResponse.json({ error: "Dato og motstander er påkrevd" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      coach_id: session.coachId,
      team_id: team_id || null,
      date: new Date(date),
      opponent,
      is_home: is_home ?? true,
      location: location || null,
      competition: competition || null,
      notes: notes || null,
    },
    include: { team: { select: { id: true, name: true } } },
  });

  return NextResponse.json(match, { status: 201 });
}
