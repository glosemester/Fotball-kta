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
  const teamId = url.searchParams.get("team_id");

  const where = teamId
    ? { team_id: teamId, week_number: weekNum, year: yearNum }
    : { team: { coach_id: session.coachId }, week_number: weekNum, year: yearNum };

  const plans = await prisma.weeklyPlan.findMany({
    where: where as never,
    include: { team: { select: { name: true, age_group: true } } },
  });

  return NextResponse.json({ plans, week: weekNum, year: yearNum });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { team_id, week_number, year, match_day, plan_data } = await req.json();

  if (!team_id || !week_number || !year) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  const team = await prisma.team.findFirst({
    where: { id: team_id, coach_id: session.coachId },
  });
  if (!team) return NextResponse.json({ error: "Lag ikke funnet" }, { status: 404 });

  const plan = await prisma.weeklyPlan.upsert({
    where: { team_id_week_number_year: { team_id, week_number, year } },
    update: { match_day: match_day ?? null, plan_data: plan_data ?? {} },
    create: { team_id, week_number, year, match_day: match_day ?? null, plan_data: plan_data ?? {} },
  });

  return NextResponse.json(plan, { status: 201 });
}
