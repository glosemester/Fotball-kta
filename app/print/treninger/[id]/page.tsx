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
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans print:p-0">
      <PrintKlient fallbackUrl={`/dashboard/treninger/${id}`} />

      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">{themeLabel}</h1>
          <p className="text-gray-600 mt-1">
            {trening.team ? `${trening.team.name} — ${trening.team.club_name}` : "Ingen lag valgt"}
          </p>
        </div>
        <div className="text-right text-sm text-gray-600 space-y-1">
          <p><strong>Dato:</strong> {new Date(trening.date).toLocaleDateString("nb-NO")}</p>
          <p><strong>Spillere:</strong> {trening.actual_player_count} (Planlagt: {trening.planned_player_count})</p>
          <p><strong>Bane:</strong> {trening.field_length_meters}x{trening.field_width_meters}m</p>
          <p><strong>Varighet:</strong> {trening.duration_minutes} min</p>
        </div>
      </header>

      {/* Constraints & Auto-Adjustments */}
      {trening.constraints_applied.length > 0 && (
        <div className="mb-8 p-4 bg-gray-100 border border-gray-300 rounded-lg break-inside-avoid">
          <h2 className="font-bold text-sm uppercase mb-2">Automatiske Tilpasninger</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {trening.constraints_applied.map((c: string, i: number) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Phases / Exercises */}
      <div className="space-y-8">
        {phases.map((phase, i) => (
          <div key={i} className="break-inside-avoid border-l-4 border-black pl-4">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-xl font-bold">{phase.phase}</h2>
              <span className="text-sm font-semibold text-gray-500">({phase.duration_minutes} min)</span>
            </div>
            
            {phase.description && !phase.exercise && (
              <p className="text-gray-700">{phase.description}</p>
            )}

            {phase.exercise && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{phase.exercise.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{phase.exercise.description}</p>
                </div>

                {phase.exercise.setup && (
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Oppsett</h4>
                    <p className="text-sm mt-1">{phase.exercise.setup}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {phase.exercise.instructions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">Gjennomføring</h4>
                      <ol className="list-decimal pl-4 text-sm space-y-1">
                        {phase.exercise.instructions.map((step, j) => (
                          <li key={j}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="space-y-4">
                    {phase.exercise.coaching_points?.length > 0 && (
                      <div className="bg-gray-100 p-3 rounded">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">Coaching-poeng</h4>
                        <ul className="list-disc pl-4 text-sm space-y-1 font-medium">
                          {phase.exercise.coaching_points.map((pt, j) => (
                            <li key={j}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.exercise.variations?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-2">Variasjoner</h4>
                        <ul className="text-sm space-y-1">
                          {phase.exercise.variations.map((v, j) => (
                            <li key={j}>→ {v}</li>
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
      <footer className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
        Generert med PitchPlan — AI-drevet Treningsplanlegging
      </footer>
    </div>
  );
}
