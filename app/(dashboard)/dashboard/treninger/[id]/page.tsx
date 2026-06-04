import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Ruler, Target, Clock, AlertTriangle, CheckCircle2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TreningStatusKnapp from "./TreningStatusKnapp";
import SlettTreningKnapp from "./SlettTreningKnapp";
import { getLang, getDictionary } from "@/lib/dict";

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
    rules: string[];
    instructions: string[];
    coaching_points: string[];
    variations: string[];
  };
}

export default async function TreningDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.training;
  const common = dict.common;

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
    include: { team: { select: { name: true, club_name: true } } },
  });

  if (!trening) notFound();

  const phases = (trening.phases as unknown as Phase[]) ?? [];
  const hasExercises = phases.some((p) => p.exercise);

  const STATUS_BADGE: Record<string, { label: string; variant: "green" | "yellow" | "secondary" }> = {
    DRAFT:     { label: d.status_draft,       variant: "secondary" },
    ACTIVE:    { label: d.status_active,        variant: "yellow" },
    COMPLETED: { label: d.status_completed,  variant: "green" },
  };

  const statusInfo = STATUS_BADGE[trening.status] ?? STATUS_BADGE.DRAFT;
  const emoji = THEME_EMOJIS[trening.theme] ?? "⚽";
  const themeLabel = THEME_LABELS[trening.theme] ?? trening.theme;
  const ageLabel = AGE_LABELS[trening.age_group] ?? trening.age_group;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/dashboard/treninger" className="inline-flex items-center gap-1.5 text-sm text-[#8E8E93] hover:text-[#FFFFFF] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {d.back_to_sessions}
      </Link>

      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center text-2xl shrink-0">
              {emoji}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#FFFFFF]">{themeLabel}</h1>
              {trening.team && (
                <p className="text-sm text-[#8E8E93]">{trening.team.name} — {trening.team.club_name}</p>
              )}
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
            <Calendar className="h-4 w-4 text-[#0A84FF]" />
            {new Date(trening.date).toLocaleDateString(lang === "en" ? "en-GB" : lang === "sv" ? "sv-SE" : lang === "da" ? "da-DK" : "nb-NO", { weekday: "short", day: "numeric", month: "short" })}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
            <Users className="h-4 w-4 text-[#0A84FF]" />
            {trening.actual_player_count} {common.players}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
            <Ruler className="h-4 w-4 text-[#0A84FF]" />
            {trening.field_length_meters}×{trening.field_width_meters}m
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
            <Clock className="h-4 w-4 text-[#0A84FF]" />
            {trening.duration_minutes} {common.min}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-[#0A84FF]" />
           <span className="text-[#8E8E93]">{d.age_group_label}</span>
          <span className="font-medium text-[#FFFFFF]">{ageLabel}</span>
        </div>

        {trening.constraints_applied.length > 0 && (
          <div className="bg-[#2C2C2E] border border-[#3B82F6]/30 rounded-2xl p-3 space-y-1">
            <p className="text-xs font-semibold text-[#3B82F6]">{d.auto_adjustments_label}</p>
            {trening.constraints_applied.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-[#8E8E93]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#3B82F6]" />
                {c}
              </div>
            ))}
          </div>
        )}

        <TreningStatusKnapp id={trening.id} currentStatus={trening.status} d={d} />
      </div>

      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl p-5">
        <h2 className="font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0A84FF]" />
          {d.session_structure_heading}
        </h2>

        {phases.length === 0 ? (
          <p className="text-sm text-[#8E8E93]">{d.no_phases}</p>
        ) : (
          <div className="space-y-4">
            {phases.map((phase, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-right shrink-0 w-14">
                  <span className="text-xs font-semibold text-[#0A84FF]">{phase.duration_minutes} min</span>
                </div>
                <div className="flex-1 border-l-2 border-[#38383A] pl-4 pb-4">
                  <p className="font-semibold text-sm text-[#FFFFFF]">{phase.phase}</p>
                  {phase.description && (
                    <p className="text-xs text-[#8E8E93] mt-0.5">{phase.description}</p>
                  )}

                  {phase.exercise && (
                    <div className="mt-3 bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-3 space-y-3">
                      <div>
                        <p className="font-semibold text-sm text-[#FFFFFF]">⚽ {phase.exercise.name}</p>
                        <p className="text-xs text-[#8E8E93] mt-1">{phase.exercise.description}</p>
                      </div>

                      {phase.exercise.setup && (
                        <div>
                          <p className="text-xs font-semibold text-[#FFFFFF] mb-1">{d.detail_setup}</p>
                          <p className="text-xs text-[#8E8E93] mb-2">{phase.exercise.setup}</p>
                        </div>
                      )}

                      {phase.exercise.rules?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#FFFFFF] mb-1">Regler</p>
                          <ul className="space-y-1 mb-2">
                            {phase.exercise.rules.map((rule, j) => (
                              <li key={j} className="text-xs text-[#8E8E93] flex gap-2">
                                <span className="text-[#F59E0B] font-semibold shrink-0">!</span>
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.exercise.instructions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#FFFFFF] mb-1">{d.detail_execution}</p>
                          <ol className="space-y-1">
                            {phase.exercise.instructions.map((step, j) => (
                              <li key={j} className="text-xs text-[#8E8E93] flex gap-2">
                                <span className="text-[#0A84FF] font-semibold shrink-0">{j + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {phase.exercise.coaching_points?.length > 0 && (
                        <div className="bg-[#1C1C1E] rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-[#0A84FF] mb-1.5">{d.detail_coaching_points}</p>
                          <ul className="space-y-1">
                            {phase.exercise.coaching_points.map((pt, j) => (
                              <li key={j} className="text-xs text-[#8E8E93] flex gap-1.5">
                                <span className="shrink-0 text-[#0A84FF]">•</span>{pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.exercise.variations?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#FFFFFF] mb-1">{d.detail_variations}</p>
                          <ul className="space-y-1">
                            {phase.exercise.variations.map((v, j) => (
                              <li key={j} className="text-xs text-[#8E8E93] flex gap-1.5">
                                <span className="text-[#0A84FF] shrink-0">→</span>{v}
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
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#2C2C2E] border border-[#F97316]/30 rounded-2xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#F97316] shrink-0 mt-0.5" />
              <p className="text-sm text-[#FFFFFF]">
                {d.no_exercises_warning ?? "Denne økten har ingen øvelser enda."}
              </p>
            </div>
            <Link href={`/dashboard/treninger/${trening.id}/rediger`}>
              <Button className="shrink-0 bg-[#F97316] hover:bg-[#EA580C] text-white">
                Ferdigstill & Generer
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <SlettTreningKnapp id={trening.id} d={d} common={common} />
        <Link href={`/print/treninger/${trening.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            {d.save_as_pdf}
          </Button>
        </Link>
      </div>
    </div>
  );
}
