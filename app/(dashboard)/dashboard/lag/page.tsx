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
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{d.title}</h1>
        <p className="text-[#64748B] mt-1 text-sm">{d.subtitle}</p>
      </div>

      <OpprettLagForm dict={{ create_button: d.create_button, form_title: d.form_title, team_name: d.team_name, team_name_placeholder: d.team_name_placeholder, club_name: d.club_name, club_name_placeholder: d.club_name_placeholder, age_group: d.age_group, creating: d.creating, create_team: d.create_team, cancel: dict.common.cancel, error_generic: dict.common.error_generic, age_labels: d.age_labels }} />

      <div className="space-y-2">
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E2F5] flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] text-sm">{d.no_teams}</p>
            <p className="text-[#94A3B8] text-xs mt-1">{d.no_teams_hint}</p>
          </div>
        ) : (
          teams.map((team) => (
            <Link key={team.id} href={`/dashboard/lag/${team.id}`} className="group block">
              <div className="bg-white border border-[#E4E2F5] rounded-2xl p-4 flex items-center justify-between hover:border-[#6D28D9]/30 hover:shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-[#6D28D9]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{team.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {team.club_name} · {d.age_labels[team.age_group as keyof typeof d.age_labels]} · {team._count.players} {d.players_count}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#6D28D9] transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
