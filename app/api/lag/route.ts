import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: { _count: { select: { players: { where: { is_active: true } } } } },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(teams);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { name, club_name, age_group } = await request.json();

  if (!name || !club_name || !age_group) {
    return NextResponse.json({ error: "Manglende felt" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: { name, club_name, age_group, coach_id: session.coachId },
  });

  return NextResponse.json(team, { status: 201 });
}
