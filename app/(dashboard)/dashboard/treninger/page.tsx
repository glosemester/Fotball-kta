import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Dumbbell, ChevronRight, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLang, getDictionary } from "@/lib/dict";

const THEME_EMOJIS: Record<string, string> = {
  PASNING_MOTTAK: "🎯", DRIBLING_VENDINGER: "🌀", AVSLUTNINGER: "🥅",
  FORSVAR: "🛡️", POSISJONSSPILL: "♟️", PRESSING: "⚡",
  OVERGANGER: "↔️", KEEPERTEKNIKK: "🧤", FRITT_SPILL: "⚽",
};

const THEME_KEYS: Record<string, string> = {
  PASNING_MOTTAK: "pasning_mottak", DRIBLING_VENDINGER: "dribling_vendinger",
  AVSLUTNINGER: "avslutningar", FORSVAR: "forsvar", POSISJONSSPILL: "posisjonsspill",
  PRESSING: "pressing", OVERGANGER: "overganger", KEEPERTEKNIKK: "keeperteknikk",
  FRITT_SPILL: "fritt_spill",
};

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
    orderBy: { date: "desc" },
  });

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(dateLocale, {
      weekday: "short", day: "numeric", month: "short",
    });
  }

  const STATUS_BADGE: Record<string, { label: string; variant: "green" | "yellow" | "secondary" }> = {
    DRAFT:     { label: d.status_draft,     variant: "secondary" },
    ACTIVE:    { label: d.status_active,    variant: "yellow" },
    COMPLETED: { label: d.status_completed, variant: "green" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{d.title}</h1>
          <p className="text-[#64748B] mt-1 text-sm">
            {sessions.length === 0
              ? d.no_sessions
              : `${sessions.length} ${sessions.length !== 1 ? d.sessions_total_plural : d.sessions_total}`}
          </p>
        </div>
        <Link href="/dashboard/treninger/ny">
          <Button>
            <Plus className="h-4 w-4" />
            {d.new_session}
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E2F5] flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-7 w-7 text-[#94A3B8]" />
          </div>
          <p className="text-[#64748B] text-sm font-medium">{d.no_sessions}</p>
          <p className="text-[#94A3B8] text-xs mt-1 mb-6">{d.no_sessions_hint}</p>
          <Link href="/dashboard/treninger/ny">
            <Button>
              <Plus className="h-4 w-4" />
              {d.plan_session}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const themeKey = THEME_KEYS[s.theme];
            const themeLabel = themeKey ? (d.themes as Record<string, string>)[themeKey] ?? s.theme : s.theme;
            const emoji = THEME_EMOJIS[s.theme] ?? "⚽";
            const statusInfo = STATUS_BADGE[s.status] ?? STATUS_BADGE.DRAFT;
            return (
              <div
                key={s.id}
                className="bg-white border border-[#E4E2F5] rounded-2xl p-4 flex items-center justify-between hover:border-[#6D28D9]/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0 text-xl">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{themeLabel}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(s.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <Users className="h-3 w-3" />
                        {s.actual_player_count} {dict.common.players}
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
