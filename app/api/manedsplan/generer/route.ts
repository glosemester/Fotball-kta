import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDatesForMonthByWeekdays(year: number, month: number, weekdays: number[]): Date[] {
  const dates = [];
  // month is 1-indexed (1 = Jan), so we use month - 1 for Date constructor
  const date = new Date(year, month - 1, 1);
  
  while (date.getMonth() === month - 1) {
    if (weekdays.includes(date.getDay())) {
      dates.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

    const body = await req.json();
    const { team_id, theme, month, year, weekdays } = body;

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

    if (!team_id || !theme || !month || !year || !weekdays || weekdays.length === 0) {
      return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: { id: team_id, coach_id: session.coachId }
    });

    if (!team) {
      return NextResponse.json({ error: "Finner ikke laget" }, { status: 404 });
    }

    const datesToSchedule = getDatesForMonthByWeekdays(year, month, weekdays);

    const sessionsToCreate = datesToSchedule.map(date => ({
      team_id: team.id,
      coach_id: session.coachId,
      title: "Trening (Månedsplan)",
      date,
      age_group: team.age_group,
      theme: THEME_MAP[theme] as any || theme,
      duration_minutes: 60,
      actual_player_count: 12,
      planned_player_count: 14,
      field_length_meters: 60,
      field_width_meters: 40,
      status: "DRAFT" as const,
      phases: [],
      constraints_applied: []
    }));

    await prisma.trainingSession.createMany({
      data: sessionsToCreate
    });

    return NextResponse.json({ ok: true, createdCount: sessionsToCreate.length });
  } catch (error: any) {
    console.error("Månedsplan error:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
