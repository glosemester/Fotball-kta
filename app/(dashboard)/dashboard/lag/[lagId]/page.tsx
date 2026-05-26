import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, UserRound, Shield, Crosshair, Radius, Trophy } from "lucide-react";
import LeggTilSpillerForm from "./LeggTilSpillerForm";
import SlettSpillerKnapp from "./SlettSpillerKnapp";

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år", AGE_8_9: "8–9 år", AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år", AGE_15_16: "15–16 år", AGE_17_18: "17–18 år",
};

const POSITION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  GOALKEEPER: { label: "Keeper", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  DEFENDER: { label: "Forsvarer", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  MIDFIELDER: { label: "Midtbane", color: "#4F7EFF", bg: "rgba(79,126,255,0.12)" },
  FORWARD: { label: "Angriper", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  UNASSIGNED: { label: "Ikke satt", color: "#4E5A72", bg: "rgba(78,90,114,0.12)" },
};

export default async function LagDetaljPage({ params }: { params: Promise<{ lagId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { lagId } = await params;
  const team = await prisma.team.findUnique({
    where: { id: lagId },
    include: { players: { where: { is_active: true }, orderBy: { last_name: "asc" } } },
  });

  if (!team || team.coach_id !== session.coachId) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lag" className="w-9 h-9 rounded-xl bg-[#141929] border border-white/[0.07] flex items-center justify-center text-[#4E5A72] hover:text-white hover:border-white/20 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-[#94A3B8] text-sm">{team.club_name} · {AGE_LABELS[team.age_group]}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Spillere", value: team.players.length },
          { label: "Keepere", value: team.players.filter(p => p.position === "GOALKEEPER").length },
          { label: "Outfield", value: team.players.filter(p => p.position !== "GOALKEEPER" && p.position !== "UNASSIGNED").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#141929] border border-white/[0.07] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-[#4E5A72] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <LeggTilSpillerForm teamId={team.id} />

      {/* Spillerliste */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#4E5A72] uppercase tracking-widest px-1">
          {team.players.length} {team.players.length === 1 ? "spiller" : "spillere"}
        </p>
        {team.players.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#141929] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
              <UserRound className="h-6 w-6 text-[#4E5A72]" />
            </div>
            <p className="text-[#94A3B8] text-sm">Ingen spillere ennå</p>
          </div>
        ) : (
          team.players.map((player) => {
            const pos = POSITION_CONFIG[player.position] ?? POSITION_CONFIG.UNASSIGNED;
            return (
              <div key={player.id} className="bg-[#141929] border border-white/[0.07] rounded-xl p-3.5 flex items-center justify-between hover:border-white/[0.12] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: pos.bg }}>
                    <UserRound className="h-4 w-4" style={{ color: pos.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: pos.color }}>{pos.label} · {player.birth_year}</p>
                  </div>
                </div>
                <SlettSpillerKnapp playerId={player.id} teamId={team.id} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
