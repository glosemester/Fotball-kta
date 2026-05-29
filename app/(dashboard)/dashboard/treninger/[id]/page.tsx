import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Ruler, Target, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TreningStatusKnapp from "./TreningStatusKnapp";

const THEME_EMOJIS: Record<string, string> = {
  PASNING_MOTTAK: "🎯", DRIBLING_VENDINGER: "🌀", AVSLUTNINGER: "🥅",
  FORSVAR: "🛡️", POSISJONSSPILL: "♟️", PRESSING: "⚡",
  OVERGANGER: "↔️", KEEPERTEKNIKK: "🧤", FRITT_SPILL: "⚽",
};

const THEME_LABELS: Record<string, string> = {
  PASNING_MOTTAK: "Pasning & Mottak", DRIBLING_VENDINGER: "Dribling & Vendinger",
  AVSLUTNINGER: "Avslutninger", FORSVAR: "Forsvar", POSISJONSSPILL: "Posisjonsspill",
  PRESSING: "Pressing & Gjenvinning", OVERGANGER: "Overganger",
  KEEPERTEKNIKK: "Keeperteknikk", FRITT_SPILL: "Fritt Spill",
};

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år", AGE_8_9: "8–9 år", AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år", AGE_15_16: "15–16 år", AGE_17_18: "17–18 år",
};

interface Phase {
  phase: string;
  duration_minutes: number;
  description?: string;
  exercise?: {
    name: string;
    description: string;
    setup: string;
    instructions: string[];
    coaching_points: string[];
    variations: string[];
  };
}

export default async function TreningDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
    include: { team: { select: { name: true, club_name: true } } },
  });

  if (!trening) notFound();

  const phases = (trening.phases as Phase[]) ?? [];
  const hasExercises = phases.some((p) => p.exercise);

  const STATUS_BADGE: Record<string, { label: string; variant: "green" | "yellow" | "secondary" }> = {
    DRAFT:     { label: "Utkast",       variant: "secondary" },
    ACTIVE:    { label: "Aktiv",        variant: "yellow" },
    COMPLETED: { label: "Gjennomført",  variant: "green" },
  };

  const statusInfo = STATUS_BADGE[trening.status] ?? STATUS_BADGE.DRAFT;
  const emoji = THEME_EMOJIS[trening.theme] ?? "⚽";
  const themeLabel = THEME_LABELS[trening.theme] ?? trening.theme;
  const ageLabel = AGE_LABELS[trening.age_group] ?? trening.age_group;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/dashboard/treninger" className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Tilbake til treninger
      </Link>

      <div className="bg-[#141D26] border border-[#2E4057] rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1E2D3D] border border-[#2E4057] flex items-center justify-center text-2xl shrink-0">
              {emoji}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F8FAFC]">{themeLabel}</h1>
              {trening.team && (
                <p className="text-sm text-[#94A3B8]">{trening.team.name} — {trening.team.club_name}</p>
              )}
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Calendar className="h-4 w-4 text-[#22C55E]" />
            {new Date(trening.date).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Users className="h-4 w-4 text-[#22C55E]" />
            {trening.actual_player_count} spillere
          </div>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Ruler className="h-4 w-4 text-[#22C55E]" />
            {trening.field_length_meters}×{trening.field_width_meters}m
          </div>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Clock className="h-4 w-4 text-[#22C55E]" />
            {trening.duration_minutes} min
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-[#22C55E]" />
          <span className="text-[#94A3B8]">Aldersgruppe:</span>
          <span className="font-medium text-[#F8FAFC]">{ageLabel}</span>
        </div>

        {trening.constraints_applied.length > 0 && (
          <div className="bg-[#1E2D3D] border border-[#3B82F6]/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-[#3B82F6]">Automatiske tilpasninger:</p>
            {trening.constraints_applied.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-[#94A3B8]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#3B82F6]" />
                {c}
              </div>
            ))}
          </div>
        )}

        {trening.status !== "COMPLETED" && (
          <TreningStatusKnapp id={trening.id} currentStatus={trening.status} />
        )}
      </div>

      <div className="bg-[#141D26] border border-[#2E4057] rounded-2xl p-5">
        <h2 className="font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#22C55E]" />
          Øktstruktur
        </h2>

        {phases.length === 0 ? (
          <p className="text-sm text-[#94A3B8]">Ingen faser lagret.</p>
        ) : (
          <div className="space-y-4">
            {phases.map((phase, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-right shrink-0 w-14">
                  <span className="text-xs font-bold text-[#22C55E]">{phase.duration_minutes} min</span>
                </div>
                <div className="flex-1 border-l-2 border-[#2E4057] pl-4 pb-4">
                  <p className="font-semibold text-sm text-[#F8FAFC]">{phase.phase}</p>
                  {phase.description && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{phase.description}</p>
                  )}

                  {phase.exercise && (
                    <div className="mt-3 bg-[#1E2D3D] border border-[#2E4057] rounded-xl p-3 space-y-3">
                      <div>
                        <p className="font-semibold text-sm text-[#F8FAFC]">⚽ {phase.exercise.name}</p>
                        <p className="text-xs text-[#94A3B8] mt-1">{phase.exercise.description}</p>
                      </div>

                      {phase.exercise.setup && (
                        <div>
                          <p className="text-xs font-semibold text-[#F8FAFC] mb-1">Oppsett</p>
                          <p className="text-xs text-[#94A3B8]">{phase.exercise.setup}</p>
                        </div>
                      )}

                      {phase.exercise.instructions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#F8FAFC] mb-1">Gjennomføring</p>
                          <ol className="space-y-1">
                            {phase.exercise.instructions.map((step, j) => (
                              <li key={j} className="text-xs text-[#94A3B8] flex gap-2">
                                <span className="text-[#22C55E] font-bold shrink-0">{j + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {phase.exercise.coaching_points?.length > 0 && (
                        <div className="bg-[#141D26] rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-[#22C55E] mb-1.5">Trenerpunkter</p>
                          <ul className="space-y-1">
                            {phase.exercise.coaching_points.map((pt, j) => (
                              <li key={j} className="text-xs text-[#94A3B8] flex gap-1.5">
                                <span className="shrink-0 text-[#22C55E]">•</span>{pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.exercise.variations?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#F8FAFC] mb-1">Variasjoner</p>
                          <ul className="space-y-1">
                            {phase.exercise.variations.map((v, j) => (
                              <li key={j} className="text-xs text-[#94A3B8] flex gap-1.5">
                                <span className="text-[#22C55E] shrink-0">→</span>{v}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasExercises && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-[#F97316] shrink-0 mt-0.5" />
            <p className="text-xs text-[#F97316]">
              Denne økten ble lagret uten AI-øvelser. Opprett en ny økt og generer øvelser før du lagrer for å se dem her.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/treninger">
          <Button variant="outline" size="sm">Tilbake</Button>
        </Link>
      </div>
    </div>
  );
}
