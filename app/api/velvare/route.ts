import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function currentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const url = new URL(req.url);
  const { week, year } = currentWeek();
  const weekNum = Number(url.searchParams.get("week") ?? week);
  const yearNum = Number(url.searchParams.get("year") ?? year);

  // Get all player IDs belonging to this coach's teams
  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: {
      players: {
        where: { is_active: true },
        orderBy: { last_name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const playerIds = teams.flatMap((t) => t.players.map((p) => p.id));

  const reports = await prisma.wellbeingReport.findMany({
    where: {
      player_id: { in: playerIds },
      week_number: weekNum,
      year: yearNum,
    },
  });

  return NextResponse.json({ teams, reports, week: weekNum, year: yearNum });
}

const STATUS_MAP: Record<string, string> = {
  green: "GREEN",
  yellow: "YELLOW",
  red: "RED",
};

const REPORTER_MAP: Record<string, string> = {
  coach: "COACH",
  player: "PLAYER",
  parent: "PARENT",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { player_id, status, symptoms, note, reported_by } = await req.json();
  if (!player_id || !status) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  // Verify player belongs to this coach
  const player = await prisma.player.findFirst({
    where: { id: player_id, team: { coach_id: session.coachId } },
  });
  if (!player) return NextResponse.json({ error: "Spiller ikke funnet" }, { status: 404 });

  const { week, year } = currentWeek();

  const report = await prisma.wellbeingReport.upsert({
    where: { player_id_week_number_year: { player_id, week_number: week, year } },
    update: {
      status: STATUS_MAP[status] as never,
      symptoms: symptoms ?? [],
      note: note ?? null,
      reported_by: (REPORTER_MAP[reported_by ?? "coach"] ?? "COACH") as never,
    },
    create: {
      player_id,
      status: STATUS_MAP[status] as never,
      symptoms: symptoms ?? [],
      note: note ?? null,
      week_number: week,
      year,
      reported_by: (REPORTER_MAP[reported_by ?? "coach"] ?? "COACH") as never,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
