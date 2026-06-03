import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { getLang, getDictionary } from "@/lib/dict";
import LeggTilSpillerForm from "./LeggTilSpillerForm";
import SlettSpillerKnapp from "./SlettSpillerKnapp";

const POSITION_COLORS: Record<string, { color: string; bg: string }> = {
  GOALKEEPER: { color: "#F59E0B", bg: "#F59E0B/10" },
  DEFENDER:   { color: "#22C55E", bg: "#22C55E/10" },
  MIDFIELDER: { color: "#3B82F6", bg: "#3B82F6/10" },
  FORWARD:    { color: "#EF4444", bg: "#EF4444/10" },
  UNASSIGNED: { color: "#94A3B8", bg: "#1E2D3D" },
};

export default async function LagDetaljPage({ params }: { params: Promise<{ lagId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.teams;
  const dc = dict.common;

  const { lagId } = await params;
  const team = await prisma.team.findUnique({
    where: { id: lagId },
    include: { players: { where: { is_active: true }, orderBy: { last_name: "asc" } } },
  });

  if (!team || team.coach_id !== session.coachId) notFound();

  const stats = [
    { label: d.stats_players,    value: team.players.length },
    { label: d.stats_goalkeepers, value: team.players.filter(p => p.position === "GOALKEEPER").length },
    { label: d.stats_outfield,   value: team.players.filter(p => p.position !== "GOALKEEPER" && p.position !== "UNASSIGNED").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lag" className="w-9 h-9 rounded-xl bg-[#141D26] border border-[#2E4057] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22C55E]/40 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">{team.name}</h1>
          <p className="text-[#94A3B8] text-sm">{team.club_name} · {d.age_labels[team.age_group as keyof typeof d.age_labels]}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-[#141D26] border border-[#2E4057] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#F8FAFC]">{value}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <LeggTilSpillerForm
        teamId={team.id}
        dict={{ add_player: d.add_player, player_form_title: d.player_form_title, first_name: d.first_name, last_name: d.last_name, birth_year: d.birth_year, position: d.position, adding: d.adding, add_player_submit: d.add_player_submit, cancel: dc.cancel, error_generic: dc.error_generic, positions: d.positions }}
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
          {team.players.length} {team.players.length === 1 ? dc.player : dc.players}
        </p>
        {team.players.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#1E2D3D] border border-[#2E4057] flex items-center justify-center mx-auto mb-3">
              <UserRound className="h-6 w-6 text-[#94A3B8]" />
            </div>
            <p className="text-[#F8FAFC] text-sm">{d.no_players}</p>
          </div>
        ) : (
          team.players.map((player) => {
            const colors = POSITION_COLORS[player.position] ?? POSITION_COLORS.UNASSIGNED;
            const posLabel = d.positions[player.position as keyof typeof d.positions] ?? player.position;
            return (
              <div key={player.id} className="bg-[#141D26] border border-[#2E4057] rounded-xl p-3.5 flex items-center justify-between hover:border-[#22C55E]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: colors.bg }}>
                    <UserRound className="h-4 w-4" style={{ color: colors.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#F8FAFC] text-sm">{player.first_name} {player.last_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.color }}>{posLabel} · {player.birth_year}</p>
                  </div>
                </div>
                <SlettSpillerKnapp playerId={player.id} teamId={team.id} confirmText={d.remove_confirm} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
