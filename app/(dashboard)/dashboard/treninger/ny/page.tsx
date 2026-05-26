"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllAgeGroups, getAgeGroupRules, isHeadingForbidden } from "@/lib/rules-engine";
import { applyConstraints, getRecommendedGameForm, getOddPlayerSolution } from "@/lib/constraints-engine";
import type { AgeGroupKey, SessionTheme, FieldSize, Equipment } from "@/types";
import { AlertTriangle, CheckCircle2, Users, Clock, Target } from "lucide-react";

const THEMES: { value: SessionTheme; label: string; emoji: string }[] = [
  { value: "pasning_mottak", label: "Pasning & Mottak", emoji: "🎯" },
  { value: "dribling_vendinger", label: "Dribling & Vendinger", emoji: "🌀" },
  { value: "avslutninger", label: "Avslutninger", emoji: "🥅" },
  { value: "forsvar", label: "Forsvar", emoji: "🛡️" },
  { value: "posisjonsspill", label: "Posisjonsspill", emoji: "♟️" },
  { value: "pressing", label: "Pressing & Gjenvinning", emoji: "⚡" },
  { value: "overganger", label: "Overganger", emoji: "↔️" },
  { value: "keeperteknikk", label: "Keeperteknikk", emoji: "🧤" },
  { value: "fritt_spill", label: "Fritt Spill", emoji: "⚽" },
];

const GOAL_TYPES: { value: "full" | "small" | "cone_goals" | "none"; label: string }[] = [
  { value: "full", label: "Fulle mål" },
  { value: "small", label: "Små mål" },
  { value: "cone_goals", label: "Kjegleporter" },
  { value: "none", label: "Ingen mål" },
];

export default function NyTreningsøktPage() {
  const ageGroups = getAllAgeGroups();

  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState<AgeGroupKey | null>(null);
  const [theme, setTheme] = useState<SessionTheme | null>(null);
  const [playerCount, setPlayerCount] = useState(12);
  const [plannedCount, setPlannedCount] = useState(14);
  const [fieldLength, setFieldLength] = useState(60);
  const [fieldWidth, setFieldWidth] = useState(40);
  const [goalType, setGoalType] = useState<"full" | "small" | "cone_goals" | "none">("full");
  const [balls, setBalls] = useState(10);
  const [cones, setCones] = useState(20);

  const rules = ageGroup ? getAgeGroupRules(ageGroup) : null;

  const field: FieldSize = {
    length_meters: fieldLength,
    width_meters: fieldWidth,
    is_full_size: fieldLength >= 90,
    has_goals: goalType !== "none",
    goal_type: goalType,
  };

  const equipment: Equipment = {
    balls_available: balls,
    cones_available: cones,
    bibs_available: 14,
    goals_available: goalType !== "none" ? 2 : 0,
    goal_size: goalType,
  };

  const constraints = ageGroup
    ? applyConstraints(ageGroup, playerCount, plannedCount, field, equipment)
    : null;

  const gameForm = ageGroup ? getRecommendedGameForm(ageGroup, playerCount) : null;
  const oddSolution = ageGroup ? getOddPlayerSolution(ageGroup, playerCount) : "";
  const headingForbidden = ageGroup ? isHeadingForbidden(ageGroup) : false;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ny treningsøkt</h1>
        <p className="text-gray-500 mt-1">Fyll inn informasjon — appen tilpasser øvelsene automatisk.</p>
      </div>

      {/* Steg-indikator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? "bg-green-700 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-green-700" : "bg-gray-200"}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {step === 1 ? "Aldersgruppe & Tema" : step === 2 ? "Praktiske rammer" : "Forhåndsvisning"}
        </span>
      </div>

      {/* STEG 1: Aldersgruppe og tema */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-green-700" />
                Hvilken aldersgruppe?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ageGroups.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAgeGroup(key)}
                    className={`rounded-xl border-2 p-3 text-sm font-semibold text-left transition-all ${
                      ageGroup === key
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-gray-200 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {rules && (
            <Card className="border-green-100 bg-green-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">NFF-retningslinjer for {rules.label}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-900">
                  <div><span className="font-medium">Spillform:</span> {rules.recommended_game_form}</div>
                  <div><span className="font-medium">Ballstørrelse:</span> {rules.ball_size}</div>
                  <div><span className="font-medium">Varighet:</span> maks {rules.max_session_duration_minutes} min</div>
                  <div><span className="font-medium">Heading:</span> {rules.heading_label}</div>
                </div>
                {headingForbidden && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs text-red-700 font-medium">Heading er absolutt forbudt for denne aldersgruppen.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-green-700" />
                Kveldens tema?
              </CardTitle>
              <CardDescription>Velg ett fokusområde for treningsøkten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {THEMES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`rounded-xl border-2 p-3 text-sm text-left transition-all ${
                      theme === value
                        ? "border-green-600 bg-green-50 text-green-800 font-semibold"
                        : "border-gray-200 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <span className="text-lg mr-2">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setStep(2)}
            disabled={!ageGroup || !theme}
            size="lg"
            className="w-full"
          >
            Neste: Praktiske rammer →
          </Button>
        </div>
      )}

      {/* STEG 2: Praktiske rammer */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-green-700" />
                Spillere
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planlagt antall
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={plannedCount}
                    onChange={(e) => setPlannedCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faktisk oppmøte
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {playerCount !== plannedCount && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <span className="font-semibold">{Math.abs(plannedCount - playerCount)} {playerCount < plannedCount ? "færre" : "flere"} enn planlagt.</span>
                    {" "}Øvelsene tilpasses automatisk.
                    {oddSolution && <p className="mt-1">{oddSolution}</p>}
                  </div>
                </div>
              )}
              {gameForm && (
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  <span className="font-semibold">Anbefalt spillform:</span> {gameForm.description}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lengde (meter)</label>
                  <input
                    type="number"
                    min={10}
                    max={110}
                    value={fieldLength}
                    onChange={(e) => setFieldLength(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bredde (meter)</label>
                  <input
                    type="number"
                    min={10}
                    max={70}
                    value={fieldWidth}
                    onChange={(e) => setFieldWidth(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              {rules && (
                <p className="text-xs text-gray-500">
                  Anbefalt for {rules.label}: {rules.field_dimensions.length_min}–{rules.field_dimensions.length_max}m
                  x {rules.field_dimensions.width_min}–{rules.field_dimensions.width_max}m
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Utstyr</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mål</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setGoalType(value)}
                      className={`rounded-lg border-2 p-2 text-sm transition-all ${
                        goalType === value ? "border-green-600 bg-green-50 font-semibold" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antall baller</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={balls}
                    onChange={(e) => setBalls(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antall kjegler</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cones}
                    onChange={(e) => setCones(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tilpasninger som vil bli gjort */}
          {constraints && constraints.adjustments_made.length > 0 && (
            <Card className="border-blue-100 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800">Automatiske tilpasninger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {constraints.adjustments_made.map((adj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-blue-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                    <span>{adj.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Tilbake
            </Button>
            <Button onClick={() => setStep(3)} size="lg" className="flex-1">
              Forhåndsvis økt →
            </Button>
          </div>
        </div>
      )}

      {/* STEG 3: Forhåndsvisning */}
      {step === 3 && ageGroup && theme && rules && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-900">
                  {THEMES.find((t) => t.value === theme)?.emoji}{" "}
                  {THEMES.find((t) => t.value === theme)?.label}
                </CardTitle>
                <Badge variant="green">{rules.label}</Badge>
              </div>
              <CardDescription className="text-green-700">
                {playerCount} spillere · {fieldLength}m x {fieldWidth}m · Maks {rules.max_session_duration_minutes} min
              </CardDescription>
            </CardHeader>
          </Card>

          <SessionPreview
            ageGroup={ageGroup}
            theme={theme}
            playerCount={playerCount}
            headingForbidden={headingForbidden}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              ← Tilbake
            </Button>
            <Button size="lg" className="flex-1">
              Lagre og start økt ✓
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionPreview({
  ageGroup,
  theme,
  playerCount,
  headingForbidden,
}: {
  ageGroup: AgeGroupKey;
  theme: SessionTheme;
  playerCount: number;
  headingForbidden: boolean;
}) {
  const rules = getAgeGroupRules(ageGroup);
  const sessionStructure = (rules as { session_structure?: { session_breakdown?: { phase: string; duration_minutes: number; description: string }[]; ramp_breakdown?: { phase: string; duration_minutes: number; description: string }[]; main_parts?: { phase: string; duration_minutes: number; description: string }[] } }).session_structure;

  const phases = sessionStructure?.session_breakdown ??
    sessionStructure?.ramp_breakdown?.concat(sessionStructure?.main_parts ?? []) ?? [
      { phase: "Oppvarming", duration_minutes: 15, description: "Lek med ball — aktiver kropp og sinn." },
      { phase: "Hoveddel", duration_minutes: 45, description: `Tema: ${THEMES.find((t) => t.value === theme)?.label}` },
      { phase: "Avslutning — Fritt spill", duration_minutes: 15, description: "Spillerne tester kveldens tema fritt uten instruksjon." },
    ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="h-4 w-4 text-green-700" />
        Øktstruktur
      </h3>
      {phases.map((phase, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="text-right shrink-0 w-12">
            <span className="text-xs font-semibold text-green-700">{phase.duration_minutes} min</span>
          </div>
          <div className="flex-1 border-l-2 border-green-200 pl-4 pb-4">
            <p className="font-semibold text-sm text-gray-900">{phase.phase}</p>
            <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
          </div>
        </div>
      ))}

      {headingForbidden && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            Husk: Absolutt headingsforbud for denne aldersgruppen. Ingen øvelse skal inneholde heading.
          </p>
        </div>
      )}

      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-1">Pedagogiske mål for {rules.label}:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {(rules.technical_focus as string[]).slice(0, 3).map((focus, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-green-600 shrink-0">•</span>
              {focus}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
