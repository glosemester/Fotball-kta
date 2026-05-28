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
import { FootballLoader } from "@/components/FootballLoader";

const THEME_EMOJI: Record<string, string> = {
  pasning_mottak: "🎯", dribling_vendinger: "🌀", avslutninger: "🥅",
  forsvar: "🛡️", posisjonsspill: "♟️", pressing: "⚡",
  overganger: "↔️", keeperteknikk: "🧤", fritt_spill: "⚽",
};

const THEME_KEYS: SessionTheme[] = [
  "pasning_mottak", "dribling_vendinger", "avslutninger", "forsvar",
  "posisjonsspill", "pressing", "overganger", "keeperteknikk", "fritt_spill",
];

const GOAL_TYPE_KEYS = ["full", "small", "cone_goals", "none"] as const;
type GoalType = typeof GOAL_TYPE_KEYS[number];

interface AiExercise {
  phase: string; name: string; duration_minutes: number;
  description: string; setup: string; instructions: string[];
  coaching_points: string[]; variations: string[];
}

interface TeamOption { id: string; name: string; club_name: string; age_group: string; }

const AGE_GROUP_MAP: Record<string, AgeGroupKey> = {
  AGE_6_7: "6-7", AGE_8_9: "8-9", AGE_10_12: "10-12",
  AGE_13_14: "13-14", AGE_15_16: "15-16", AGE_17_18: "17-18",
};

interface TrainingDict {
  new_session_title: string; new_session_subtitle: string;
  step1_label: string; step2_label: string; step3_label: string;
  which_team: string; select_team: string; which_age: string;
  nff_rules: string; game_form: string; ball: string; max_duration: string; heading: string;
  heading_forbidden_alert: string; heading_forbidden_session: string;
  theme_title: string; theme_subtitle: string; next_step2: string;
  date: string; players_card: string; planned_count: string; actual_count: string;
  fewer_than_planned: string; more_than_planned: string; auto_adjusted: string;
  recommended_form: string; field_card: string; field_length: string; field_width: string;
  field_recommended: string; equipment_card: string; goals: string;
  goal_full: string; goal_small: string; goal_cones: string; goal_none: string;
  balls_count: string; cones_count: string; auto_adjustments: string; preview_next: string;
  session_structure: string; pedagogic_goals: string;
  ai_button: string; ai_regenerate: string; ai_loading: string; ai_adapting: string;
  ai_exercises: string; ai_setup: string; ai_execution: string; ai_coaching: string; ai_variations: string;
  save_session: string; saving_session: string;
  themes: Record<string, string>;
}

function todayISO() { return new Date().toISOString().split("T")[0]; }

export default function NyTreningsøktKlient({ dict, locale }: { dict: TrainingDict; locale: string }) {
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
  const [goalType, setGoalType] = useState<GoalType>("full");
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
    length_meters: fieldLength, width_meters: fieldWidth,
    is_full_size: fieldLength >= 90, has_goals: goalType !== "none", goal_type: goalType,
  };

  const equipment: Equipment = {
    balls_available: balls, cones_available: cones,
    bibs_available: 14, goals_available: goalType !== "none" ? 2 : 0, goal_size: goalType,
  };

  const constraints = ageGroup ? applyConstraints(ageGroup, playerCount, plannedCount, field, equipment) : null;
  const gameForm = ageGroup ? getRecommendedGameForm(ageGroup, playerCount) : null;
  const oddSolution = ageGroup ? getOddPlayerSolution(ageGroup, playerCount) : "";
  const headingForbidden = ageGroup ? isHeadingForbidden(ageGroup) : false;

  type RulesWithStructure = typeof rules & {
    session_structure?: {
      session_breakdown?: { phase: string; duration_minutes: number; description: string }[];
      ramp_breakdown?: { phase: string; duration_minutes: number; description: string }[];
      main_parts?: { phase: string; duration_minutes: number; description: string }[];
    };
  };

  function getPhases() {
    const sessionStructure = (rules as RulesWithStructure)?.session_structure;
    return sessionStructure?.session_breakdown ??
      (sessionStructure?.ramp_breakdown ?? []).concat(sessionStructure?.main_parts ?? []) ?? [
        { phase: "Oppvarming", duration_minutes: 15, description: "" },
        { phase: "Hoveddel", duration_minutes: 45, description: "" },
        { phase: "Fritt spill", duration_minutes: 15, description: "" },
      ];
  }

  async function generateAI() {
    if (!ageGroup || !theme || !rules) return;
    setAiLoading(true); setAiError(""); setAiExercises(null);
    const res = await fetch("/api/treninger/generer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age_group: ageGroup, theme, player_count: playerCount, field_length: fieldLength, field_width: fieldWidth, phases: getPhases() }),
    });
    const data = await res.json();
    if (!res.ok) { setAiError(data.error || "Noe gikk galt med AI-genereringen"); }
    else { setAiExercises(data.exercises ?? []); }
    setAiLoading(false);
  }

  async function handleSave() {
    if (!ageGroup || !theme) return;
    setSaving(true); setSaveError("");
    const res = await fetch("/api/treninger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_id: teamId || undefined, age_group: ageGroup, theme, date: sessionDate,
        duration_minutes: rules?.max_session_duration_minutes ?? 60,
        actual_player_count: playerCount, planned_player_count: plannedCount,
        field_length_meters: fieldLength, field_width_meters: fieldWidth,
        goal_type: goalType, balls_available: balls, cones_available: cones,
        phases: getPhases(),
        constraints_applied: constraints?.adjustments_made.map((a) => a.description) ?? [],
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error || "Noe gikk galt");
      setSaving(false); return;
    }
    router.push("/dashboard/treninger");
  }

  const GOAL_LABELS: Record<GoalType, string> = {
    full: dict.goal_full, small: dict.goal_small, cone_goals: dict.goal_cones, none: dict.goal_none,
  };

  const step1Valid = !!ageGroup && !!theme;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">{dict.new_session_title}</h1>
        <p className="text-[#94A3B8] mt-1 text-sm">{dict.new_session_subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? "bg-[#22C55E] text-white" : "bg-[#2E4057] text-[#94A3B8]"
            }`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-[#22C55E]" : "bg-[#2E4057]"}`} />}
          </div>
        ))}
        <span className="text-sm text-[#94A3B8] ml-2">
          {step === 1 ? dict.step1_label : step === 2 ? dict.step2_label : dict.step3_label}
        </span>
      </div>

      {/* STEG 1 */}
      {step === 1 && (
        <div className="space-y-5">
          {teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-[#22C55E]" />
                  {dict.which_team}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select value={teamId} onChange={(e) => handleTeamChange(e.target.value)} className="input-field">
                  <option value="">{dict.select_team}</option>
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
                <Users className="h-4 w-4 text-[#22C55E]" />
                {dict.which_age}
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
                        ? "border-[#22C55E] bg-[#1E2D3D] text-[#22C55E]"
                        : "border-[#2E4057] hover:border-[#22C55E]/40 text-[#F8FAFC]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {rules && (
            <Card className="border-[#22C55E]/20 bg-[#1E2D3D]">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider">{dict.nff_rules} {rules.label}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-[#F8FAFC]">
                  <div><span className="font-medium">{dict.game_form}:</span> {rules.recommended_game_form}</div>
                  <div><span className="font-medium">{dict.ball}:</span> str. {rules.ball_size}</div>
                  <div><span className="font-medium">{dict.max_duration}:</span> {rules.max_session_duration_minutes} min</div>
                  <div><span className="font-medium">{dict.heading}:</span> {rules.heading_label}</div>
                </div>
                {headingForbidden && (
                  <div className="flex items-center gap-2 mt-1 p-2 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/20">
                    <AlertTriangle className="h-4 w-4 text-[#EF4444] shrink-0" />
                    <span className="text-xs text-[#EF4444] font-medium">{dict.heading_forbidden_alert}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-[#22C55E]" />
                {dict.theme_title}
              </CardTitle>
              <CardDescription>{dict.theme_subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {THEME_KEYS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`rounded-xl border-2 p-3 text-sm text-left transition-all ${
                      theme === value
                        ? "border-[#22C55E] bg-[#1E2D3D] text-[#22C55E] font-semibold"
                        : "border-[#2E4057] hover:border-[#22C55E]/40 text-[#F8FAFC]"
                    }`}
                  >
                    <span className="mr-2">{THEME_EMOJI[value]}</span>{dict.themes[value] ?? value}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setStep(2)} disabled={!step1Valid} size="lg" className="w-full">
            {dict.next_step2}
          </Button>
        </div>
      )}

      {/* STEG 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">{dict.date}</CardTitle></CardHeader>
            <CardContent>
              <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="input-field" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#22C55E]" />
                {dict.players_card}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.planned_count}</label>
                  <input type="number" min={2} max={30} value={plannedCount} onChange={(e) => setPlannedCount(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.actual_count}</label>
                  <input type="number" min={2} max={30} value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              {playerCount !== plannedCount && (
                <div className="flex items-start gap-2 p-3 bg-[#FFFBEB] rounded-xl border border-[#D97706]/20">
                  <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#92400E]">
                    <span className="font-semibold">{Math.abs(plannedCount - playerCount)} {playerCount < plannedCount ? dict.fewer_than_planned : dict.more_than_planned}</span>
                    {" "}{dict.auto_adjusted}
                    {oddSolution && <p className="mt-1">{oddSolution}</p>}
                  </div>
                </div>
              )}
              {gameForm && (
                <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#16A34A]/20 text-sm text-[#166534]">
                  <span className="font-semibold">{dict.recommended_form}:</span> {gameForm.description}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{dict.field_card}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.field_length}</label>
                  <input type="number" min={10} max={110} value={fieldLength} onChange={(e) => setFieldLength(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.field_width}</label>
                  <input type="number" min={10} max={70} value={fieldWidth} onChange={(e) => setFieldWidth(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              {rules && (
                <p className="text-xs text-[#94A3B8]">
                  {dict.field_recommended}: {rules.field_dimensions.length_min}–{rules.field_dimensions.length_max}m × {rules.field_dimensions.width_min}–{rules.field_dimensions.width_max}m
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{dict.equipment_card}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">{dict.goals}</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPE_KEYS.map((value) => (
                    <button
                      key={value}
                      onClick={() => setGoalType(value)}
                      className={`rounded-xl border-2 p-2.5 text-sm transition-all ${
                        goalType === value
                          ? "border-[#22C55E] bg-[#1E2D3D] text-[#22C55E] font-semibold"
                          : "border-[#2E4057] hover:border-[#22C55E]/40 text-[#F8FAFC]"
                      }`}
                    >
                      {GOAL_LABELS[value]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.balls_count}</label>
                  <input type="number" min={1} max={30} value={balls} onChange={(e) => setBalls(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">{dict.cones_count}</label>
                  <input type="number" min={0} max={100} value={cones} onChange={(e) => setCones(Number(e.target.value))} className="input-field" />
                </div>
              </div>
            </CardContent>
          </Card>

          {constraints && constraints.adjustments_made.length > 0 && (
            <Card className="border-[#2563EB]/20 bg-[#EFF6FF]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#1D4ED8]">{dict.auto_adjustments}</CardTitle>
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
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← {dict.step1_label}</Button>
            <Button onClick={() => setStep(3)} size="lg" className="flex-1">{dict.preview_next}</Button>
          </div>
        </div>
      )}

      {/* STEG 3 */}
      {step === 3 && ageGroup && theme && rules && (
        <div className="space-y-5">
          <Card className="border-[#22C55E]/20 bg-[#1E2D3D]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#F8FAFC]">
                  {THEME_EMOJI[theme]}{" "}{dict.themes[theme] ?? theme}
                </CardTitle>
                <Badge variant="default">{rules.label}</Badge>
              </div>
              <CardDescription className="text-[#94A3B8]">
                {new Date(sessionDate).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{playerCount} · {fieldLength}m × {fieldWidth}m · {dict.max_duration} {rules.max_session_duration_minutes} min
              </CardDescription>
            </CardHeader>
          </Card>

          <SessionPreview ageGroup={ageGroup} theme={theme} headingForbidden={headingForbidden} rules={rules} dict={dict} />

          <div className="space-y-3">
            <Button type="button" variant="secondary" size="lg" className="w-full" onClick={generateAI} disabled={aiLoading}>
              <Sparkles className="h-4 w-4" />
              {aiLoading ? dict.ai_loading : aiExercises ? dict.ai_regenerate : dict.ai_button}
            </Button>

            {aiLoading && (
              <div className="flex justify-center py-8">
                <FootballLoader variant="bounce" text={`${dict.ai_adapting} ${playerCount}...`} size="lg" />
              </div>
            )}

            {aiError && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3">
                <p className="text-sm text-[#EF4444]">{aiError}</p>
              </div>
            )}

            {aiExercises && <AiExerciseList exercises={aiExercises} dict={dict} />}
          </div>

          {saveError && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3">
              <p className="text-sm text-[#EF4444]">{saveError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← {dict.step2_label}</Button>
            <Button size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? dict.saving_session : dict.save_session}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AiExerciseList({ exercises, dict }: { exercises: AiExercise[]; dict: TrainingDict }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">{dict.ai_exercises}</p>
      {exercises.map((ex, i) => (
        <div key={i} className="bg-white border border-[#2E4057] rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8F7FF] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                <span className="text-[10px] font-semibold text-[#22C55E] bg-[#1E2D3D] px-2 py-0.5 rounded-full">{ex.phase}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#F8FAFC] text-sm truncate">{ex.name}</p>
                <p className="text-xs text-[#94A3B8]">{ex.duration_minutes} min</p>
              </div>
            </div>
            {expanded === i ? <ChevronUp className="h-4 w-4 text-[#94A3B8] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8] shrink-0" />}
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#2E4057] pt-3">
              <p className="text-sm text-[#94A3B8]">{ex.description}</p>
              {ex.setup && (
                <div>
                  <p className="text-xs font-semibold text-[#F8FAFC] mb-1">{dict.ai_setup}</p>
                  <p className="text-xs text-[#94A3B8]">{ex.setup}</p>
                </div>
              )}
              {ex.instructions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#F8FAFC] mb-1">{dict.ai_execution}</p>
                  <ol className="space-y-1">
                    {ex.instructions.map((step, j) => (
                      <li key={j} className="text-xs text-[#94A3B8] flex gap-2">
                        <span className="text-[#22C55E] font-bold shrink-0">{j + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {ex.coaching_points?.length > 0 && (
                <div className="bg-[#1E2D3D] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#22C55E] mb-1.5">{dict.ai_coaching}</p>
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
                  <p className="text-xs font-semibold text-[#F8FAFC] mb-1">{dict.ai_variations}</p>
                  <ul className="space-y-1">
                    {ex.variations.map((v, j) => (
                      <li key={j} className="text-xs text-[#94A3B8] flex gap-1.5">
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
  ageGroup, theme, headingForbidden, rules, dict,
}: {
  ageGroup: AgeGroupKey; theme: SessionTheme; headingForbidden: boolean;
  rules: ReturnType<typeof getAgeGroupRules>; dict: TrainingDict;
}) {
  type RulesWithStructure = typeof rules & {
    session_structure?: {
      session_breakdown?: { phase: string; duration_minutes: number; description: string }[];
      ramp_breakdown?: { phase: string; duration_minutes: number; description: string }[];
      main_parts?: { phase: string; duration_minutes: number; description: string }[];
    };
  };

  const sessionStructure = (rules as RulesWithStructure).session_structure;
  const phases = sessionStructure?.session_breakdown ??
    (sessionStructure?.ramp_breakdown ?? []).concat(sessionStructure?.main_parts ?? []) ?? [
      { phase: "Oppvarming", duration_minutes: 15, description: "Lek med ball — aktiver kropp og sinn." },
      { phase: "Hoveddel", duration_minutes: 45, description: `Tema: ${theme}` },
      { phase: "Fritt spill", duration_minutes: 15, description: "Spillerne tester temaet fritt." },
    ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-[#F8FAFC] flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#22C55E]" />
        {dict.session_structure}
      </h3>
      {phases.map((phase, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="text-right shrink-0 w-12">
            <span className="text-xs font-semibold text-[#22C55E]">{phase.duration_minutes} min</span>
          </div>
          <div className="flex-1 border-l-2 border-[#2E4057] pl-4 pb-3">
            <p className="font-semibold text-sm text-[#F8FAFC]">{phase.phase}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{phase.description}</p>
          </div>
        </div>
      ))}
      {headingForbidden && (
        <div className="flex items-center gap-2 p-3 bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
          <AlertTriangle className="h-4 w-4 text-[#EF4444] shrink-0" />
          <p className="text-xs text-[#EF4444] font-medium">{dict.heading_forbidden_session}</p>
        </div>
      )}
      <div className="p-3 bg-white rounded-xl border border-[#2E4057]">
        <p className="text-xs font-semibold text-[#F8FAFC] mb-1.5">{dict.pedagogic_goals} {rules.label}:</p>
        <ul className="text-xs text-[#94A3B8] space-y-1">
          {(rules.technical_focus as string[]).slice(0, 3).map((focus, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#22C55E] shrink-0">•</span>
              {focus}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
