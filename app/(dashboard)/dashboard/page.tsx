import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import DashboardHomeClient from "./DashboardHomeClient";

function currentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);

  const { week, year } = currentWeek();

  // Hent lag
  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    orderBy: { name: "asc" },
  });

  // Hent ukens plan
  const existingPlans = await prisma.weeklyPlan.findMany({
    where: { team: { coach_id: session.coachId }, year, week_number: week },
  });

  // Beregn start og slutt for denne uken
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  const dayNum = d.getUTCDay() || 7; // 1 (mandag) til 7 (søndag)
  
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - dayNum + 1);
  
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  // Hent ukens kamper
  const matches = await prisma.match.findMany({
    where: { 
      coach_id: session.coachId, 
      date: { gte: monday, lte: sunday } 
    },
    select: { id: true, team_id: true, date: true, opponent: true },
  });

  return (
    <DashboardHomeClient
      fullName={session.fullName}
      teams={teams}
      existingPlans={existingPlans}
      matches={matches}
      week={week}
      dict={dict}
    />
  );
}
