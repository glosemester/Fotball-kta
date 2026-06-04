import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintKlient from "./PrintKlient";

const THEME_LABELS: Record<string, string> = {
  PASNING_MOTTAK: "Pasning & Mottak", DRIBLING_VENDINGER: "Dribling & Vendinger",
  AVSLUTNINGER: "Avslutninger", FORSVAR: "Forsvar", POSISJONSSPILL: "Posisjonsspill",
  PRESSING: "Pressing & Gjenvinning", OVERGANGER: "Overganger",
  KEEPERTEKNIKK: "Keeperteknikk", FRITT_SPILL: "Fritt Spill",
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

export default async function PrintTreningPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
    include: { team: { select: { name: true, club_name: true } } },
  });

  if (!trening) notFound();

  const phases = (trening.phases as unknown as Phase[]) ?? [];
  const themeLabel = THEME_LABELS[trening.theme] ?? trening.theme;

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <PrintKlient fallbackUrl={`/dashboard/treninger/${id}`} />

      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 10mm; size: A4; }
          .page-break { page-break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none min-h-[297mm]">
        {/* Modern Full-Width Header */}
        <header className="bg-[#1C1C1E] text-white px-8 py-6 rounded-t-xl print:rounded-none flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[#0A84FF] text-xs font-bold tracking-widest uppercase mb-1">PitchPlan — Treningsplanlegger</span>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase leading-none">{themeLabel}</h1>
            <p className="text-gray-300 mt-2 font-medium">
              {trening.team ? `${trening.team.name} — ${trening.team.club_name}` : "Ingen lag valgt"}
            </p>
          </div>
          <div className="text-right text-sm text-gray-300 space-y-0.5 bg-black/20 p-3 rounded-lg border border-white/10">
            <p><span className="text-gray-400">Dato:</span> <strong className="text-white">{new Date(trening.date).toLocaleDateString("nb-NO")}</strong></p>
            <p><span className="text-gray-400">Tid:</span> <strong className="text-white">{trening.duration_minutes} min</strong></p>
            <p><span className="text-gray-400">Spillere:</span> <strong className="text-white">{trening.actual_player_count} (Planlagt {trening.planned_player_count})</strong></p>
            <p><span className="text-gray-400">Bane:</span> <strong className="text-white">{trening.field_length_meters}x{trening.field_width_meters}m</strong></p>
          </div>
        </header>

        <div className="p-8">
          {/* Constraints & Auto-Adjustments */}
          {trening.constraints_applied.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-300 rounded-r-lg page-break">
              <h2 className="font-bold text-xs uppercase text-gray-500 mb-2 tracking-wider">Automatiske Tilpasninger for økten</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {trening.constraints_applied.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Phases / Exercises */}
          <div className="space-y-8">
            {phases.map((phase, i) => (
              <div key={i} className="page-break">
                {/* Phase Header */}
                <div className="flex items-center gap-3 border-b-2 border-[#1C1C1E] pb-2 mb-4">
                  <div className="bg-[#1C1C1E] text-white px-3 py-1 rounded-md text-sm font-bold tracking-widest uppercase">
                    {phase.phase}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">⏱ {phase.duration_minutes} min</span>
                </div>
                
                {phase.description && !phase.exercise && (
                  <p className="text-gray-700 text-sm pl-2 border-l-2 border-gray-200">{phase.description}</p>
                )}

                {phase.exercise && (
                  <div className="pl-2">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-[#1C1C1E]">{phase.exercise.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 italic">{phase.exercise.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left Column (Setup & Instructions) */}
                      <div className="md:col-span-7 space-y-4">
                        {phase.exercise.setup && (
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1">Oppsett</h4>
                            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">{phase.exercise.setup}</p>
                          </div>
                        )}

                        {phase.exercise.instructions?.length > 0 && (
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Gjennomføring</h4>
                            <ol className="list-decimal pl-4 text-sm text-gray-800 space-y-1.5 marker:font-semibold marker:text-gray-400">
                              {phase.exercise.instructions.map((step, j) => (
                                <li key={j} className="pl-1">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      {/* Right Column (Coaching Points & Variations) */}
                      <div className="md:col-span-5 space-y-4">
                        {phase.exercise.coaching_points?.length > 0 && (
                          <div className="bg-[#0A84FF]/10 border-l-4 border-[#0A84FF] p-3 rounded-r-lg">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A84FF] mb-2 flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                              Trenerpunkter
                            </h4>
                            <ul className="list-disc pl-4 text-sm text-gray-800 space-y-1.5 font-medium marker:text-[#0A84FF]">
                              {phase.exercise.coaching_points.map((pt, j) => (
                                <li key={j} className="pl-1">{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {phase.exercise.variations?.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Variasjoner</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {phase.exercise.variations.map((v, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-gray-400">→</span> <span>{v}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer / Watermark */}
          <footer className="mt-12 pt-6 border-t-2 border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase font-bold tracking-wider">
            <span>Generert med PitchPlan — Treningsplanlegger</span>
            <span>Side 1 av 1</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
