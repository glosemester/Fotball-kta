import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const sessions = await prisma.trainingSession.findMany({
    where: { coach_id: session.coachId },
    include: { team: { select: { name: true, club_name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(sessions);
}

const THEME_MAP: Record<string, string> = {
  pasning_mottak: "PASNING_MOTTAK",
  dribling_vendinger: "DRIBLING_VENDINGER",
  avslutninger: "AVSLUTNINGER",
  forsvar: "FORSVAR",
  posisjonsspill: "POSISJONSSPILL",
  pressing: "PRESSING",
  overganger: "OVERGANGER",
  keeperteknikk: "KEEPERTEKNIKK",
  fritt_spill: "FRITT_SPILL",
};

const AGE_MAP: Record<string, string> = {
  "6-7": "AGE_6_7",
  "8-9": "AGE_8_9",
  "10-12": "AGE_10_12",
  "13-14": "AGE_13_14",
  "15-16": "AGE_15_16",
  "17-18": "AGE_17_18",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const body = await req.json();
  const {
    team_id,
    age_group,
    theme,
    duration_minutes,
    actual_player_count,
    planned_player_count,
    field_length_meters,
    field_width_meters,
    goal_type,
    balls_available,
    cones_available,
    phases,
    constraints_applied,
    date,
    title,
  } = body;

  if (!team_id || !age_group || !theme) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  // Verify team belongs to this coach
  const team = await prisma.team.findFirst({
    where: { id: team_id, coach_id: session.coachId },
  });
  if (!team) return NextResponse.json({ error: "Lag ikke funnet" }, { status: 404 });

  const trainingSession = await prisma.trainingSession.create({
    data: {
      team_id,
      coach_id: session.coachId,
      title: title || `${theme} - ${new Date(date).toLocaleDateString("nb-NO")}`,
      date: new Date(date),
      age_group: AGE_MAP[age_group] as never,
      theme: THEME_MAP[theme] as never,
      duration_minutes: duration_minutes ?? 60,
      actual_player_count: actual_player_count ?? 0,
      planned_player_count: planned_player_count ?? 0,
      field_length_meters: field_length_meters ?? 60,
      field_width_meters: field_width_meters ?? 40,
      has_full_goals: goal_type === "full",
      balls_available: balls_available ?? 10,
      cones_available: cones_available ?? 20,
      phases: phases ?? [],
      constraints_applied: constraints_applied ?? [],
      status: "DRAFT",
    },
  });

  return NextResponse.json(trainingSession, { status: 201 });
}
