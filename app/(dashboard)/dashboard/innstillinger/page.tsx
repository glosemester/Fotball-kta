import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InnstillingerKlient from "./InnstillingerKlient";

export default async function InnstillingerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const coach = await prisma.coach.findUnique({
    where: { id: session.coachId },
    select: { features: true, full_name: true, email: true, club_name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Innstillinger</h1>
        <p className="text-[#64748B] mt-1 text-sm">Tilpass appen til ditt behov</p>
      </div>

      <div className="bg-white border border-[#E4E2F5] rounded-2xl p-4 space-y-1">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">Din konto</p>
        <p className="text-sm font-semibold text-[#1A1A2E]">{coach?.full_name}</p>
        <p className="text-xs text-[#64748B]">{coach?.email}</p>
        {coach?.club_name && <p className="text-xs text-[#94A3B8]">{coach.club_name}</p>}
      </div>

      <InnstillingerKlient features={coach?.features ?? []} />
    </div>
  );
}
