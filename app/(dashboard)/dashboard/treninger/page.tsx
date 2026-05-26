import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Dumbbell, ChevronRight, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const THEME_LABELS: Record<string, { label: string; emoji: string }> = {
  PASNING_MOTTAK:      { label: "Pasning & Mottak",       emoji: "🎯" },
  DRIBLING_VENDINGER:  { label: "Dribling & Vendinger",   emoji: "🌀" },
  AVSLUTNINGER:        { label: "Avslutninger",           emoji: "🥅" },
  FORSVAR:             { label: "Forsvar",                emoji: "🛡️" },
  POSISJONSSPILL:      { label: "Posisjonsspill",         emoji: "♟️" },
  PRESSING:            { label: "Pressing & Gjenvinning", emoji: "⚡" },
  OVERGANGER:          { label: "Overganger",             emoji: "↔️" },
  KEEPERTEKNIKK:       { label: "Keeperteknikk",          emoji: "🧤" },
  FRITT_SPILL:         { label: "Fritt Spill",            emoji: "⚽" },
};

const STATUS_BADGE: Record<string, { label: string; variant: "green" | "yellow" | "secondary" }> = {
  DRAFT:     { label: "Utkast",    variant: "secondary" },
  ACTIVE:    { label: "Aktiv",     variant: "yellow" },
  COMPLETED: { label: "Fullført",  variant: "green" },
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("nb-NO", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default async function TreningerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sessions = await prisma.trainingSession.findMany({
    where: { coach_id: session.coachId },
    include: { team: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Treningsøkter</h1>
          <p className="text-[#64748B] mt-1 text-sm">
            {sessions.length === 0 ? "Ingen økter ennå" : `${sessions.length} økt${sessions.length !== 1 ? "er" : ""} totalt`}
          </p>
        </div>
        <Link href="/dashboard/treninger/ny">
          <Button>
            <Plus className="h-4 w-4" />
            Ny økt
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E2F5] flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-7 w-7 text-[#94A3B8]" />
          </div>
          <p className="text-[#64748B] text-sm font-medium">Ingen treningsøkter ennå</p>
          <p className="text-[#94A3B8] text-xs mt-1 mb-6">Planlegg din første økt</p>
          <Link href="/dashboard/treninger/ny">
            <Button>
              <Plus className="h-4 w-4" />
              Planlegg treningsøkt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const themeInfo = THEME_LABELS[s.theme] ?? { label: s.theme, emoji: "⚽" };
            const statusInfo = STATUS_BADGE[s.status] ?? STATUS_BADGE.DRAFT;
            return (
              <div
                key={s.id}
                className="bg-white border border-[#E4E2F5] rounded-2xl p-4 flex items-center justify-between hover:border-[#6D28D9]/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0 text-xl">
                    {themeInfo.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{themeInfo.label}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(s.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <Users className="h-3 w-3" />
                        {s.actual_player_count} spillere
                      </span>
                      {s.team && (
                        <span className="text-xs text-[#94A3B8] hidden sm:inline">{s.team.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
