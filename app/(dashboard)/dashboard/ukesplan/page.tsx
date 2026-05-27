import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import UkesplanKlient from "./UkesplanKlient";

function currentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export default async function UkesplanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.weekplan;

  const { week, year } = currentWeek();

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    orderBy: { name: "asc" },
  });

  const existingPlans = await prisma.weeklyPlan.findMany({
    where: { team: { coach_id: session.coachId }, year },
    orderBy: { week_number: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{d.title}</h1>
        <p className="text-[#64748B] mt-1 text-sm">{d.subtitle}</p>
      </div>

      <UkesplanKlient
        teams={teams as never}
        week={week}
        year={year}
        existingPlans={existingPlans as never}
        dict={d}
        weekLabel={dict.common.week}
      />
    </div>
  );
}
