import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Dumbbell, ChevronRight, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLang, getDictionary } from "@/lib/dict";
import TreningListeKlient from "./TreningListeKlient";

export default async function TreningerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.training;

  const dateLocale = lang === "en" ? "en-GB" : lang === "sv" ? "sv-SE" : lang === "da" ? "da-DK" : "nb-NO";

  const sessions = await prisma.trainingSession.findMany({
    where: { coach_id: session.coachId },
    include: { team: { select: { name: true } } },
    orderBy: { date: "asc" },
  });

        <TreningListeKlient 
          initialSessions={sessions} 
          dict={dict} 
          dateLocale={dateLocale} 
          d={d} 
        />
}
