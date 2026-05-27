import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import KalenderKlient from "./KalenderKlient";

export default async function KalenderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);

  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 60);

  const [teams, matches, sessions] = await Promise.all([
    prisma.team.findMany({
      where: { coach_id: session.coachId, is_active: true },
      include: { players: { where: { is_active: true }, orderBy: { last_name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.match.findMany({
      where: { coach_id: session.coachId, date: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1) } },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.trainingSession.findMany({
      where: { coach_id: session.coachId, date: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1) } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{dict.calendar.title}</h1>
        <p className="text-[#64748B] mt-1 text-sm">{dict.calendar.subtitle}</p>
      </div>
      <KalenderKlient
        teams={teams as never}
        matches={matches as never}
        sessions={sessions as never}
        dict={dict.calendar}
        teamsDict={dict.teams}
      />
    </div>
  );
}
