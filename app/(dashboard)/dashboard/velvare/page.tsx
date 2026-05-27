import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import VelvareKlient from "./VelvareKlient";

function currentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export default async function VelvarePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const dw = dict.wellbeing;
  const dc = dict.common;

  const { week, year } = currentWeek();

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: { players: { where: { is_active: true }, orderBy: { last_name: "asc" } } },
    orderBy: { name: "asc" },
  });

  const playerIds = teams.flatMap((t) => t.players.map((p) => p.id));

  const reports = await prisma.wellbeingReport.findMany({
    where: { player_id: { in: playerIds }, week_number: week, year },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{dw.title}</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          {dc.week} {week}, {year} · {dw.subtitle_week}
        </p>
      </div>

      <VelvareKlient
        teams={teams as never}
        reports={reports as never}
        week={week}
        year={year}
        dict={dw}
      />
    </div>
  );
}
