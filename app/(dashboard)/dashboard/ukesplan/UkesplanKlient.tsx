"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Trophy } from "lucide-react";

const DAYS = [
  { key: "monday",    short: "Man", label: "Mandag" },
  { key: "tuesday",  short: "Tir", label: "Tirsdag" },
  { key: "wednesday",short: "Ons", label: "Onsdag" },
  { key: "thursday", short: "Tor", label: "Torsdag" },
  { key: "friday",   short: "Fre", label: "Fredag" },
  { key: "saturday", short: "Lør", label: "Lørdag" },
  { key: "sunday",   short: "Søn", label: "Søndag" },
];

const FOCUS_OPTIONS: { value: string; label: string; emoji: string; desc: string; bg: string; border: string; text: string }[] = [
  { value: "high_volume",  label: "Høy volum",    emoji: "💪", desc: "Lang økt, mye ballkontakt",     bg: "#EFF6FF", border: "#2563EB", text: "#1D4ED8" },
  { value: "sharpness",    label: "Skarphet",      emoji: "⚡", desc: "Kort og intens, kampforberedelse", bg: "#F5F3FF", border: "#6D28D9", text: "#5B21B6" },
  { value: "technical",    label: "Teknisk",       emoji: "🎯", desc: "Individuelle ferdigheter",       bg: "#F0FDF4", border: "#16A34A", text: "#15803D" },
  { value: "recovery",     label: "Restitusjon",   emoji: "🧘", desc: "Lett økt, fritt spill",         bg: "#FFFBEB", border: "#D97706", text: "#92400E" },
  { value: "match",        label: "Kamp",          emoji: "🏆", desc: "Kampdagen",                     bg: "#FEF2F2", border: "#DC2626", text: "#991B1B" },
  { value: "rest",         label: "Hvildag",       emoji: "😴", desc: "Ingen aktivitet",               bg: "#F8FAFC", border: "#E4E2F5", text: "#64748B" },
];

const FOCUS_MAP = Object.fromEntries(FOCUS_OPTIONS.map((f) => [f.value, f]));

interface DayPlan {
  focus: string;
  notes: string;
}

interface Team {
  id: string;
  name: string;
  club_name: string;
  age_group: string;
}

interface ExistingPlan {
  team_id: string;
  week_number: number;
  year: number;
  match_day: string | null;
  plan_data: Record<string, DayPlan>;
}

interface Props {
  teams: Team[];
  week: number;
  year: number;
  existingPlans: ExistingPlan[];
}

const AGE_SESSIONS: Record<string, { min: number; max: number; maxMin: number }> = {
  AGE_6_7:   { min: 1, max: 2, maxMin: 45  },
  AGE_8_9:   { min: 1, max: 2, maxMin: 60  },
  AGE_10_12: { min: 2, max: 3, maxMin: 75  },
  AGE_13_14: { min: 2, max: 3, maxMin: 90  },
  AGE_15_16: { min: 2, max: 4, maxMin: 90  },
  AGE_17_18: { min: 3, max: 5, maxMin: 100 },
};

function emptyWeek(): Record<string, DayPlan> {
  return Object.fromEntries(DAYS.map((d) => [d.key, { focus: "rest", notes: "" }]));
}

export default function UkesplanKlient({ teams, week, year, existingPlans }: Props) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0] ?? null);
  const [currentWeek, setCurrentWeek] = useState(week);
  const [currentYear, setCurrentYear] = useState(year);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingPlan = existingPlans.find(
    (p) => p.team_id === selectedTeam?.id && p.week_number === currentWeek && p.year === currentYear
  );

  const [days, setDays] = useState<Record<string, DayPlan>>(
    existingPlan?.plan_data ?? emptyWeek()
  );
  const [matchDay, setMatchDay] = useState(existingPlan?.match_day ?? "");

  function handleTeamChange(teamId: string) {
    const t = teams.find((t) => t.id === teamId) ?? null;
    setSelectedTeam(t);
    const plan = existingPlans.find(
      (p) => p.team_id === teamId && p.week_number === currentWeek && p.year === currentYear
    );
    setDays(plan?.plan_data ?? emptyWeek());
    setMatchDay(plan?.match_day ?? "");
    setSaved(false);
  }

  function updateDay(dayKey: string, field: keyof DayPlan, value: string) {
    setDays((prev) => ({ ...prev, [dayKey]: { ...prev[dayKey], [field]: value } }));
    setSaved(false);
    if (field === "focus" && value === "match") {
      setMatchDay(dayKey);
    }
  }

  function prevWeek() {
    if (currentWeek === 1) { setCurrentWeek(52); setCurrentYear((y) => y - 1); }
    else setCurrentWeek((w) => w - 1);
    setSaved(false);
  }

  function nextWeek() {
    if (currentWeek === 52) { setCurrentWeek(1); setCurrentYear((y) => y + 1); }
    else setCurrentWeek((w) => w + 1);
    setSaved(false);
  }

  const sessionRule = selectedTeam ? AGE_SESSIONS[selectedTeam.age_group] : null;
  const trainingDays = Object.values(days).filter((d) => d.focus !== "rest" && d.focus !== "match").length;
  const tooMany = sessionRule && trainingDays > sessionRule.max;
  const tooFew  = sessionRule && trainingDays < sessionRule.min;

  async function handleSave() {
    if (!selectedTeam) return;
    setSaving(true);
    await fetch("/api/ukesplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_id: selectedTeam.id,
        week_number: currentWeek,
        year: currentYear,
        match_day: matchDay || null,
        plan_data: days,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748B] text-sm">Ingen lag ennå. Opprett et lag under Lag & Spillere.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Lag-velger */}
      {teams.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTeamChange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                selectedTeam?.id === t.id
                  ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]"
                  : "border-[#E4E2F5] text-[#64748B] hover:border-[#6D28D9]/40"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Uke-navigering */}
      <div className="flex items-center justify-between bg-white border border-[#E4E2F5] rounded-2xl px-4 py-3">
        <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-[#F0EEFF] text-[#64748B] hover:text-[#6D28D9] transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-bold text-[#1A1A2E]">Uke {currentWeek}</p>
          <p className="text-xs text-[#94A3B8]">{currentYear}</p>
        </div>
        <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-[#F0EEFF] text-[#64748B] hover:text-[#6D28D9] transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* NFF-regel for lag */}
      {sessionRule && (
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
          tooMany ? "bg-[#FEF2F2] border-[#DC2626]/30" :
          tooFew  ? "bg-[#FFFBEB] border-[#D97706]/30" :
                    "bg-[#F0FDF4] border-[#16A34A]/30"
        }`}>
          <p className={`text-xs font-medium ${tooMany ? "text-[#991B1B]" : tooFew ? "text-[#92400E]" : "text-[#15803D]"}`}>
            {selectedTeam?.name}: {sessionRule.min}–{sessionRule.max} økter/uke · maks {sessionRule.maxMin} min
          </p>
          <Badge variant={tooMany ? "red" : tooFew ? "yellow" : "green"}>
            {trainingDays} av {sessionRule.max}
          </Badge>
        </div>
      )}

      {/* Dag-kort */}
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const day = days[key] ?? { focus: "rest", notes: "" };
          const focusCfg = FOCUS_MAP[day.focus] ?? FOCUS_MAP.rest;
          const isMatch = day.focus === "match";

          return (
            <div
              key={key}
              className="bg-white border rounded-2xl overflow-hidden transition-all"
              style={{ borderColor: day.focus !== "rest" ? focusCfg.border : "#E4E2F5" }}
            >
              {/* Dag-header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 shrink-0">
                  <p className="font-semibold text-sm text-[#1A1A2E]">{label}</p>
                </div>
                {isMatch && <Trophy className="h-3.5 w-3.5 text-[#DC2626] shrink-0" />}
                {/* Fokusvalg-rad */}
                <div className="flex gap-1.5 flex-wrap flex-1">
                  {FOCUS_OPTIONS.map(({ value, emoji, label: flabel }) => (
                    <button
                      key={value}
                      onClick={() => updateDay(key, "focus", value)}
                      title={flabel}
                      className={`h-8 px-2.5 rounded-lg text-sm font-medium transition-all border ${
                        day.focus === value
                          ? "text-white border-transparent"
                          : "bg-white border-[#E4E2F5] text-[#64748B] hover:border-[#6D28D9]/40"
                      }`}
                      style={day.focus === value ? { background: focusCfg.border } : {}}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notat-felt — kun vis hvis ikke hvildag */}
              {day.focus !== "rest" && (
                <div className="px-4 pb-3">
                  <input
                    value={day.notes}
                    onChange={(e) => updateDay(key, "notes", e.target.value)}
                    placeholder={`Notat til ${label.toLowerCase()}...`}
                    className="input-field text-xs py-2"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lagre */}
      <Button
        onClick={handleSave}
        disabled={saving || !selectedTeam}
        size="lg"
        className="w-full"
        variant={saved ? "secondary" : "default"}
      >
        {saving ? "Lagrer..." : saved ? "✓ Lagret" : (
          <><Save className="h-4 w-4" /> Lagre ukesplan</>
        )}
      </Button>
    </div>
  );
}
