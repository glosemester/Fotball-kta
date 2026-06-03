import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
  });
  if (!trening) return NextResponse.json({ error: "Treningsøkt ikke funnet" }, { status: 404 });

  await prisma.trainingSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
  });
  if (!trening) return NextResponse.json({ error: "Treningsøkt ikke funnet" }, { status: 404 });

  const updated = await prisma.trainingSession.update({
    where: { id },
    data: {
      team_id: body.team_id,
      age_group: AGE_MAP[body.age_group] as any || body.age_group,
      theme: THEME_MAP[body.theme] as any || body.theme,
      date: new Date(body.date),
      duration_minutes: body.duration_minutes,
      actual_player_count: body.actual_player_count,
      planned_player_count: body.planned_player_count,
      field_length_meters: body.field_length_meters,
      field_width_meters: body.field_width_meters,
      has_full_goals: body.goal_type === "full",
      balls_available: body.balls_available,
      cones_available: body.cones_available,
      phases: body.phases,
      constraints_applied: body.constraints_applied,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(updated);
}
