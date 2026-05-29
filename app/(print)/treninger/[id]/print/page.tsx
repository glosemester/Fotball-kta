import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PrintKnapp from "./PrintKnapp";

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

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
    include: {
      team: { select: { name: true, club_name: true } },
      coach: { select: { full_name: true } },
    },
  });

  if (!trening) notFound();

  const phases = (trening.phases as Phase[]) ?? [];
  const emoji = THEME_EMOJIS[trening.theme] ?? "⚽";
  const themeLabel = THEME_LABELS[trening.theme] ?? trening.theme;
  const ageLabel = AGE_LABELS[trening.age_group] ?? trening.age_group;
  const dateStr = new Date(trening.date).toLocaleDateString("nb-NO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          @page { margin: 18mm 15mm; size: A4; }
        }
      `}</style>

      {/* Kontrollknapper — skjules ved utskrift */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50 print:hidden">
        <Link
          href={`/dashboard/treninger/${id}`}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white text-black hover:bg-gray-50 transition-colors"
        >
          ← Tilbake
        </Link>
        <PrintKnapp />
      </div>

      <div className="max-w-2xl mx-auto p-10 font-[Arial,Helvetica,sans-serif]">

        {/* Header */}
        <div className="border-b-2 border-black pb-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">PitchPlan · Treningsøkt</p>
              <h1 className="text-3xl font-bold leading-tight">{emoji} {themeLabel}</h1>
              {trening.team && (
                <p className="text-gray-500 mt-1 text-sm">{trening.team.name} — {trening.team.club_name}</p>
              )}
            </div>
            <div className="text-right text-sm text-gray-600 shrink-0">
              <p className="font-semibold capitalize">{dateStr}</p>
              <p className="mt-0.5">{ageLabel}</p>
              <p>{trening.actual_player_count} spillere · {trening.duration_minutes} min</p>
              {trening.coach && <p className="mt-0.5 text-gray-400">{trening.coach.full_name}</p>}
            </div>
          </div>
        </div>

        {/* Bane og utstyr */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Bane</p>
            <p className="font-semibold">{trening.field_length_meters} × {trening.field_width_meters} m</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Baller</p>
            <p className="font-semibold">{trening.balls_available} stk</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Kjegler</p>
            <p className="font-semibold">{trening.cones_available} stk</p>
          </div>
        </div>

        {/* Automatiske tilpasninger */}
        {trening.constraints_applied.length > 0 && (
          <div className="mb-6 p-3 border border-gray-200 rounded-lg text-sm">
            <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wide">Automatiske tilpasninger</p>
            {trening.constraints_applied.map((c: string, i: number) => (
              <p key={i} className="text-gray-600">• {c}</p>
            ))}
          </div>
        )}

        {/* Øktstruktur / faser */}
        <div className="space-y-7">
          {phases.map((phase, i) => (
            <div key={i} className="border-l-4 border-black pl-5">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xl font-bold">{phase.phase}</span>
                <span className="text-sm text-gray-400 font-normal">{phase.duration_minutes} min</span>
              </div>
              {phase.description && (
                <p className="text-sm text-gray-500 mb-3 italic">{phase.description}</p>
              )}

              {phase.exercise && (
                <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                  <div>
                    <p className="font-bold text-base">⚽ {phase.exercise.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{phase.exercise.description}</p>
                  </div>

                  {phase.exercise.setup && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Oppsett</p>
                      <p className="text-sm text-gray-700">{phase.exercise.setup}</p>
                    </div>
                  )}

                  {phase.exercise.instructions?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Gjennomføring</p>
                      <ol className="space-y-1">
                        {phase.exercise.instructions.map((step, j) => (
                          <li key={j} className="text-sm text-gray-700 flex gap-2">
                            <span className="font-bold shrink-0 text-black">{j + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {phase.exercise.coaching_points?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Trenerpunkter</p>
                      <ul className="space-y-0.5">
                        {phase.exercise.coaching_points.map((pt, j) => (
                          <li key={j} className="text-sm text-gray-700 flex gap-1.5">
                            <span className="shrink-0">•</span>{pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.exercise.variations?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Variasjoner</p>
                      <ul className="space-y-0.5">
                        {phase.exercise.variations.map((v, j) => (
                          <li key={j} className="text-sm text-gray-500 flex gap-1.5">
                            <span className="shrink-0">→</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-300 flex justify-between">
          <span>pitchplan.no</span>
          <span>Generert {new Date().toLocaleDateString("nb-NO")}</span>
        </div>
      </div>
    </div>
  );
}
