import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { getLang, getDictionary } from "@/lib/dict";
import OpprettLagForm from "./OpprettLagForm";

export default async function LagPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.teams;

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: { _count: { select: { players: { where: { is_active: true } } } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#FFFFFF]">{d.title}</h1>
        <p className="text-[#8E8E93] mt-1 text-sm">{d.subtitle}</p>
      </div>

      <OpprettLagForm dict={{ create_button: d.create_button, form_title: d.form_title, team_name: d.team_name, team_name_placeholder: d.team_name_placeholder, club_name: d.club_name, club_name_placeholder: d.club_name_placeholder, age_group: d.age_group, creating: d.creating, create_team: d.create_team, cancel: dict.common.cancel, error_generic: dict.common.error_generic, age_labels: d.age_labels }} />

      {teams.length === 0 ? (
        <div className="text-center py-16 w-full">
          <div className="w-16 h-16 rounded-3xl bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-[#8E8E93]" />
          </div>
          <p className="text-[#FFFFFF] text-sm">{d.no_teams}</p>
          <p className="text-[#8E8E93] text-xs mt-1">{d.no_teams_hint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/lag/${team.id}`} className="group block">
              <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl p-4 flex items-center justify-between hover:border-[#0A84FF]/40 hover:bg-[#2C2C2E] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-[#0A84FF]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#FFFFFF] text-sm">{team.name}</p>
                    <p className="text-xs text-[#8E8E93] mt-0.5">
                      {team.club_name} · {d.age_labels[team.age_group as keyof typeof d.age_labels]} · {team._count.players} {d.players_count}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8E8E93] group-hover:text-[#0A84FF] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
