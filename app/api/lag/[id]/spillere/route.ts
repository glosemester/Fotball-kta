import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team || team.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  const players = await prisma.player.findMany({
    where: { team_id: id, is_active: true },
    orderBy: { last_name: "asc" },
  });

  return NextResponse.json(players);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team || team.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  const { first_name, last_name, birth_year, position } = await request.json();

  if (!first_name || !last_name || !birth_year) {
    return NextResponse.json({ error: "Manglende felt" }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      first_name,
      last_name,
      birth_year: Number(birth_year),
      position: position || "UNASSIGNED",
      team_id: id,
    },
  });

  return NextResponse.json(player, { status: 201 });
}
