import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import InnstillingerKlient from "./InnstillingerKlient";

export default async function InnstillingerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.settings;

  const coach = await prisma.coach.findUnique({
    where: { id: session.coachId },
    select: { features: true, full_name: true, email: true, club_name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{d.title}</h1>
        <p className="text-[#64748B] mt-1 text-sm">{d.subtitle}</p>
      </div>

      <div className="bg-white border border-[#E4E2F5] rounded-2xl p-4 space-y-1">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">{d.account_title}</p>
        <p className="text-sm font-semibold text-[#1A1A2E]">{coach?.full_name}</p>
        <p className="text-xs text-[#64748B]">{coach?.email}</p>
        {coach?.club_name && <p className="text-xs text-[#94A3B8]">{coach.club_name}</p>}
      </div>

      <InnstillingerKlient
        features={coach?.features ?? []}
        dict={{ optional_modules: d.optional_modules, wellbeing_label: d.wellbeing_label, wellbeing_desc: d.wellbeing_desc }}
      />
    </div>
  );
}
