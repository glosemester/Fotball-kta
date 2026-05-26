"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllAgeGroups, getAgeGroupRules, isHeadingForbidden } from "@/lib/rules-engine";
import { applyConstraints, getRecommendedGameForm, getOddPlayerSolution } from "@/lib/constraints-engine";
import type { AgeGroupKey, SessionTheme, FieldSize, Equipment } from "@/types";
import { AlertTriangle, CheckCircle2, Users, Clock, Target, Dumbbell, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const THEMES: { value: SessionTheme; label: string; emoji: string }[] = [
  { value: "pasning_mottak",     label: "Pasning & Mottak",       emoji: "🎯" },
  { value: "dribling_vendinger", label: "Dribling & Vendinger",   emoji: "🌀" },
  { value: "avslutninger",       label: "Avslutninger",           emoji: "🥅" },
  { value: "forsvar",            label: "Forsvar",                emoji: "🛡️" },
  { value: "posisjonsspill",     label: "Posisjonsspill",         emoji: "♟️" },
  { value: "pressing",           label: "Pressing & Gjenvinning", emoji: "⚡" },
  { value: "overganger",         label: "Overganger",             emoji: "↔️" },
  { value: "keeperteknikk",      label: "Keeperteknikk",          emoji: "🧤" },
  { value: "fritt_spill",        label: "Fritt Spill",            emoji: "⚽" },
];

const GOAL_TYPES: { value: "full" | "small" | "cone_goals" | "none"; label: string }[] = [
  { value: "full",       label: "Fulle mål" },
  { value: "small",      label: "Små mål" },
  { value: "cone_goals", label: "Kjegleporter" },
  { value: "none",       label: "Ingen mål" },
];

interface AiExercise {
  phase: string;
  name: string;
  duration_minutes: number;
  description: string;
  setup: string;
  instructions: string[];
  coaching_points: string[];
  variations: string[];
}

interface TeamOption {
  id: string;
  name: string;
  club_name: string;
  age_group: string;
}

const AGE_GROUP_MAP: Record<string, AgeGroupKey> = {
  AGE_6_7: "6-7", AGE_8_9: "8-9", AGE_10_12: "10-12",
  AGE_13_14: "13-14", AGE_15_16: "15-16", AGE_17_18: "17-18",
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function NyTreningsøktPage() {
  const router = useRouter();
  const ageGroups = getAllAgeGroups();

  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamId, setTeamId] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroupKey | null>(null);
  const [theme, setTheme] = useState<SessionTheme | null>(null);
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [playerCount, setPlayerCount] = useState(12);
  const [plannedCount, setPlannedCount] = useState(14);
  const [fieldLength, setFieldLength] = useState(60);
  const [fieldWidth, setFieldWidth] = useState(40);
  const [goalType, setGoalType] = useState<"full" | "small" | "cone_goals" | "none">("full");
  const [balls, setBalls] = useState(10);
  const [cones, setCones] = useState(20);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [aiExercises, setAiExercises] = useState<AiExercise[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetch("/api/lag")
      .then((r) => r.json())
      .then((data: TeamOption[]) => {
        setTeams(data);
        if (data.length === 1) {
          setTeamId(data[0].id);
          const mapped = AGE_GROUP_MAP[data[0].age_group];
          if (mapped) setAgeGroup(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // When team changes, pre-fill age group
  function handleTeamChange(id: string) {
    setTeamId(id);
    const team = teams.find((t) => t.id === id);
    if (team) {
      const mapped = AGE_GROUP_MAP[team.age_group];
      if (mapped) setAgeGroup(mapped);
    }
  }

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

  async function generateAI() {
    if (!ageGroup || !theme || !rules) return;
    setAiLoading(true);
    setAiError("");
    setAiExercises(null);

    const sessionStructure = (rules as { session_structure?: { session_breakdown?: { phase: string; duration_minutes: number; description: string }[]; ramp_breakdown?: { phase: string; duration_minutes: number; description: string }[]; main_parts?: { phase: string; duration_minutes: number; description: string }[] } })?.session_structure;
    const phases = sessionStructure?.session_breakdown ??
      (sessionStructure?.ramp_breakdown ?? []).concat(sessionStructure?.main_parts ?? []) ?? [
        { phase: "Oppvarming", duration_minutes: 15, description: "" },
        { phase: "Hoveddel", duration_minutes: 45, description: "" },
        { phase: "Fritt spill", duration_minutes: 15, description: "" },
      ];

    const res = await fetch("/api/treninger/generer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_group: ageGroup,
        theme,
        player_count: playerCount,
        field_length: fieldLength,
        field_width: fieldWidth,
        phases,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setAiError(data.error || "Noe gikk galt med AI-genereringen");
    } else {
      setAiExercises(data.exercises ?? []);
    }
    setAiLoading(false);
  }

  async function handleSave() {
    if (!ageGroup || !theme) return;
    setSaving(true);
    setSaveError("");

    const sessionStructure = (rules as { session_structure?: { session_breakdown?: unknown[]; ramp_breakdown?: unknown[]; main_parts?: unknown[] } })?.session_structure;
    const phases = sessionStructure?.session_breakdown ??
      (sessionStructure?.ramp_breakdown ?? []).concat(sessionStructure?.main_parts ?? []);

    const res = await fetch("/api/treninger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_id: teamId || undefined,
        age_group: ageGroup,
        theme,
        date: sessionDate,
        duration_minutes: rules?.max_session_duration_minutes ?? 60,
        actual_player_count: playerCount,
        planned_player_count: plannedCount,
        field_length_meters: fieldLength,
        field_width_meters: fieldWidth,
        goal_type: goalType,
        balls_available: balls,
        cones_available: cones,
        phases,
        constraints_applied: constraints?.adjustments_made.map((a) => a.description) ?? [],
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error || "Noe gikk galt");
      setSaving(false);
      return;
    }

    router.push("/dashboard/treninger");
  }

  const step1Valid = !!ageGroup && !!theme;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Ny treningsøkt</h1>
        <p className="text-[#64748B] mt-1 text-sm">Fyll inn informasjon — appen tilpasser øvelsene automatisk.</p>
      </div>

      {/* Steg-indikator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? "bg-[#6D28D9] text-white" : "bg-[#E4E2F5] text-[#94A3B8]"
            }`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-[#6D28D9]" : "bg-[#E4E2F5]"}`} />}
          </div>
        ))}
        <span className="text-sm text-[#64748B] ml-2">
          {step === 1 ? "Aldersgruppe & Tema" : step === 2 ? "Praktiske rammer" : "Forhåndsvisning"}
        </span>
      </div>

      {/* STEG 1 */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Lag-velger */}
          {teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-[#6D28D9]" />
                  Hvilket lag?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select value={teamId} onChange={(e) => handleTeamChange(e.target.value)} className="input-field">
                  <option value="">Velg lag (valgfritt)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.club_name}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#6D28D9]" />
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
                        ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                        : "border-[#E4E2F5] hover:border-[#6D28D9]/40 text-[#1A1A2E]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {rules && (
            <Card className="border-[#6D28D9]/20 bg-[#F5F3FF]">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-[#6D28D9] uppercase tracking-wider">NFF-retningslinjer for {rules.label}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-[#1A1A2E]">
                  <div><span className="font-medium">Spillform:</span> {rules.recommended_game_form}</div>
                  <div><span className="font-medium">Ball:</span> str. {rules.ball_size}</div>
                  <div><span className="font-medium">Maks varighet:</span> {rules.max_session_duration_minutes} min</div>
                  <div><span className="font-medium">Heading:</span> {rules.heading_label}</div>
                </div>
                {headingForbidden && (
                  <div className="flex items-center gap-2 mt-1 p-2 bg-[#FEF2F2] rounded-lg border border-[#DC2626]/20">
                    <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0" />
                    <span className="text-xs text-[#DC2626] font-medium">Heading absolutt forbudt for denne aldersgruppen.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-[#6D28D9]" />
                Kveldens tema?
              </CardTitle>
              <CardDescription>Velg ett fokusområde</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`rounded-xl border-2 p-3 text-sm text-left transition-all ${
                      theme === value
                        ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9] font-semibold"
                        : "border-[#E4E2F5] hover:border-[#6D28D9]/40 text-[#1A1A2E]"
                    }`}
                  >
                    <span className="mr-2">{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setStep(2)} disabled={!step1Valid} size="lg" className="w-full">
            Neste: Praktiske rammer →
          </Button>
        </div>
      )}

      {/* STEG 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dato</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="input-field"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#6D28D9]" />
                Spillere
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Planlagt antall</label>
                  <input type="number" min={2} max={30} value={plannedCount} onChange={(e) => setPlannedCount(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Faktisk oppmøte</label>
                  <input type="number" min={2} max={30} value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              {playerCount !== plannedCount && (
                <div className="flex items-start gap-2 p-3 bg-[#FFFBEB] rounded-xl border border-[#D97706]/20">
                  <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#92400E]">
                    <span className="font-semibold">{Math.abs(plannedCount - playerCount)} {playerCount < plannedCount ? "færre" : "flere"} enn planlagt.</span>
                    {" "}Øvelsene tilpasses automatisk.
                    {oddSolution && <p className="mt-1">{oddSolution}</p>}
                  </div>
                </div>
              )}
              {gameForm && (
                <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#16A34A]/20 text-sm text-[#166534]">
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
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Lengde (m)</label>
                  <input type="number" min={10} max={110} value={fieldLength} onChange={(e) => setFieldLength(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Bredde (m)</label>
                  <input type="number" min={10} max={70} value={fieldWidth} onChange={(e) => setFieldWidth(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              {rules && (
                <p className="text-xs text-[#94A3B8]">
                  Anbefalt: {rules.field_dimensions.length_min}–{rules.field_dimensions.length_max}m × {rules.field_dimensions.width_min}–{rules.field_dimensions.width_max}m
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
                <label className="block text-sm font-medium text-[#64748B] mb-2">Mål</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setGoalType(value)}
                      className={`rounded-xl border-2 p-2.5 text-sm transition-all ${
                        goalType === value
                          ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9] font-semibold"
                          : "border-[#E4E2F5] hover:border-[#6D28D9]/40 text-[#1A1A2E]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Antall baller</label>
                  <input type="number" min={1} max={30} value={balls} onChange={(e) => setBalls(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1">Antall kjegler</label>
                  <input type="number" min={0} max={100} value={cones} onChange={(e) => setCones(Number(e.target.value))} className="input-field" />
                </div>
              </div>
            </CardContent>
          </Card>

          {constraints && constraints.adjustments_made.length > 0 && (
            <Card className="border-[#2563EB]/20 bg-[#EFF6FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#1D4ED8]">Automatiske tilpasninger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {constraints.adjustments_made.map((adj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#1D4ED8]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#2563EB]" />
                    <span>{adj.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Tilbake</Button>
            <Button onClick={() => setStep(3)} size="lg" className="flex-1">Forhåndsvis økt →</Button>
          </div>
        </div>
      )}

      {/* STEG 3 */}
      {step === 3 && ageGroup && theme && rules && (
        <div className="space-y-5">
          <Card className="border-[#6D28D9]/20 bg-[#F5F3FF]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1A1A2E]">
                  {THEMES.find((t) => t.value === theme)?.emoji}{" "}
                  {THEMES.find((t) => t.value === theme)?.label}
                </CardTitle>
                <Badge variant="default">{rules.label}</Badge>
              </div>
              <CardDescription className="text-[#64748B]">
                {new Date(sessionDate).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{playerCount} spillere · {fieldLength}m × {fieldWidth}m · Maks {rules.max_session_duration_minutes} min
              </CardDescription>
            </CardHeader>
          </Card>

          <SessionPreview ageGroup={ageGroup} theme={theme} headingForbidden={headingForbidden} rules={rules} />

          {/* AI-øvelser */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={generateAI}
              disabled={aiLoading}
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? "Genererer øvelser..." : aiExercises ? "Generer på nytt ✨" : "Generer øvelser med AI ✨"}
            </Button>

            {aiLoading && (
              <div className="text-center py-8 space-y-2">
                <div className="w-8 h-8 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#94A3B8]">Claude tilpasser øvelsene til {playerCount} spillere...</p>
              </div>
            )}

            {aiError && (
              <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-4 py-3">
                <p className="text-sm text-[#DC2626]">{aiError}</p>
              </div>
            )}

            {aiExercises && <AiExerciseList exercises={aiExercises} />}
          </div>

          {saveError && (
            <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-4 py-3">
              <p className="text-sm text-[#DC2626]">{saveError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Tilbake</Button>
            <Button size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Lagrer..." : "Lagre økt ✓"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AiExerciseList({ exercises }: { exercises: AiExercise[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
        AI-genererte øvelser
      </p>
      {exercises.map((ex, i) => (
        <div key={i} className="bg-white border border-[#E4E2F5] rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8F7FF] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                <span className="text-[10px] font-semibold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                  {ex.phase}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A2E] text-sm truncate">{ex.name}</p>
                <p className="text-xs text-[#94A3B8]">{ex.duration_minutes} min</p>
              </div>
            </div>
            {expanded === i
              ? <ChevronUp className="h-4 w-4 text-[#94A3B8] shrink-0" />
              : <ChevronDown className="h-4 w-4 text-[#94A3B8] shrink-0" />}
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#E4E2F5] pt-3">
              <p className="text-sm text-[#64748B]">{ex.description}</p>

              {ex.setup && (
                <div>
                  <p className="text-xs font-semibold text-[#1A1A2E] mb-1">Oppsett</p>
                  <p className="text-xs text-[#64748B]">{ex.setup}</p>
                </div>
              )}

              {ex.instructions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#1A1A2E] mb-1">Gjennomføring</p>
                  <ol className="space-y-1">
                    {ex.instructions.map((step, j) => (
                      <li key={j} className="text-xs text-[#64748B] flex gap-2">
                        <span className="text-[#6D28D9] font-bold shrink-0">{j + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {ex.coaching_points?.length > 0 && (
                <div className="bg-[#F5F3FF] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#6D28D9] mb-1.5">Trenerblikk</p>
                  <ul className="space-y-1">
                    {ex.coaching_points.map((pt, j) => (
                      <li key={j} className="text-xs text-[#5B21B6] flex gap-1.5">
                        <span className="shrink-0">•</span>{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ex.variations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#1A1A2E] mb-1">Varianter</p>
                  <ul className="space-y-1">
                    {ex.variations.map((v, j) => (
                      <li key={j} className="text-xs text-[#64748B] flex gap-1.5">
                        <span className="text-[#16A34A] shrink-0">→</span>{v}
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
  );
}

function SessionPreview({
  ageGroup,
  theme,
  headingForbidden,
  rules,
}: {
  ageGroup: AgeGroupKey;
  theme: SessionTheme;
  headingForbidden: boolean;
  rules: ReturnType<typeof getAgeGroupRules>;
}) {
  const sessionStructure = (rules as { session_structure?: { session_breakdown?: { phase: string; duration_minutes: number; description: string }[]; ramp_breakdown?: { phase: string; duration_minutes: number; description: string }[]; main_parts?: { phase: string; duration_minutes: number; description: string }[] } }).session_structure;

  const phases = sessionStructure?.session_breakdown ??
    (sessionStructure?.ramp_breakdown ?? []).concat(sessionStructure?.main_parts ?? []) ?? [
      { phase: "Oppvarming", duration_minutes: 15, description: "Lek med ball — aktiver kropp og sinn." },
      { phase: "Hoveddel", duration_minutes: 45, description: `Tema: ${theme}` },
      { phase: "Fritt spill", duration_minutes: 15, description: "Spillerne tester temaet fritt." },
    ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#6D28D9]" />
        Øktstruktur
      </h3>
      {phases.map((phase, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="text-right shrink-0 w-12">
            <span className="text-xs font-semibold text-[#6D28D9]">{phase.duration_minutes} min</span>
          </div>
          <div className="flex-1 border-l-2 border-[#E4E2F5] pl-4 pb-3">
            <p className="font-semibold text-sm text-[#1A1A2E]">{phase.phase}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{phase.description}</p>
          </div>
        </div>
      ))}

      {headingForbidden && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] rounded-xl border border-[#DC2626]/20">
          <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0" />
          <p className="text-xs text-[#DC2626] font-medium">Absolutt headingsforbud — ingen øvelse skal inneholde heading.</p>
        </div>
      )}

      <div className="p-3 bg-white rounded-xl border border-[#E4E2F5]">
        <p className="text-xs font-semibold text-[#1A1A2E] mb-1.5">Pedagogiske mål for {rules.label}:</p>
        <ul className="text-xs text-[#64748B] space-y-1">
          {(rules.technical_focus as string[]).slice(0, 3).map((focus, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#6D28D9] shrink-0">•</span>
              {focus}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
