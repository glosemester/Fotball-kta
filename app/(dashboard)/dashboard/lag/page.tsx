import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import OpprettLagForm from "./OpprettLagForm";

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år", AGE_8_9: "8–9 år", AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år", AGE_15_16: "15–16 år", AGE_17_18: "17–18 år",
};

export default async function LagPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: { _count: { select: { players: { where: { is_active: true } } } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Lag & Spillere</h1>
        <p className="text-[#64748B] mt-1 text-sm">Administrer dine lag og spillere.</p>
      </div>

      <OpprettLagForm />

      <div className="space-y-2">
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E2F5] flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] text-sm">Ingen lag ennå</p>
            <p className="text-[#94A3B8] text-xs mt-1">Opprett ditt første lag ovenfor</p>
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
                      {team.club_name} · {AGE_LABELS[team.age_group]} · {team._count.players} spillere
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
