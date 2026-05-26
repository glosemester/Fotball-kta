import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import LeggTilSpillerForm from "./LeggTilSpillerForm";
import SlettSpillerKnapp from "./SlettSpillerKnapp";

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år", AGE_8_9: "8–9 år", AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år", AGE_15_16: "15–16 år", AGE_17_18: "17–18 år",
};

const POSITION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  GOALKEEPER: { label: "Keeper", color: "#D97706", bg: "#FFFBEB" },
  DEFENDER: { label: "Forsvarer", color: "#16A34A", bg: "#F0FDF4" },
  MIDFIELDER: { label: "Midtbane", color: "#2563EB", bg: "#EFF6FF" },
  FORWARD: { label: "Angriper", color: "#DC2626", bg: "#FEF2F2" },
  UNASSIGNED: { label: "Ikke satt", color: "#94A3B8", bg: "#F8FAFC" },
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
        <Link href="/dashboard/lag" className="w-9 h-9 rounded-xl bg-white border border-[#E4E2F5] flex items-center justify-center text-[#94A3B8] hover:text-[#1A1A2E] hover:border-[#6D28D9]/30 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{team.name}</h1>
          <p className="text-[#64748B] text-sm">{team.club_name} · {AGE_LABELS[team.age_group]}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Spillere", value: team.players.length },
          { label: "Keepere", value: team.players.filter(p => p.position === "GOALKEEPER").length },
          { label: "Outfield", value: team.players.filter(p => p.position !== "GOALKEEPER" && p.position !== "UNASSIGNED").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E4E2F5] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <LeggTilSpillerForm teamId={team.id} />

      {/* Spillerliste */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
          {team.players.length} {team.players.length === 1 ? "spiller" : "spillere"}
        </p>
        {team.players.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E4E2F5] flex items-center justify-center mx-auto mb-3">
              <UserRound className="h-6 w-6 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] text-sm">Ingen spillere ennå</p>
          </div>
        ) : (
          team.players.map((player) => {
            const pos = POSITION_CONFIG[player.position] ?? POSITION_CONFIG.UNASSIGNED;
            return (
              <div key={player.id} className="bg-white border border-[#E4E2F5] rounded-xl p-3.5 flex items-center justify-between hover:border-[#6D28D9]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: pos.bg }}>
                    <UserRound className="h-4 w-4" style={{ color: pos.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">
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
