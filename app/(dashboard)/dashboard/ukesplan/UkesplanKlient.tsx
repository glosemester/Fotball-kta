"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Trophy, TrendingUp, Zap, Target, BatteryCharging, Moon } from "lucide-react";

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const FOCUS_STYLE: Record<string, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  high_volume: { icon: TrendingUp, bg: "#1E2D3D", border: "#3B82F6", text: "#60A5FA" },
  sharpness:   { icon: Zap, bg: "#1E2D3D", border: "#A855F7", text: "#C084FC" },
  technical:   { icon: Target, bg: "#1E2D3D", border: "#22C55E", text: "#4ADE80" },
  recovery:    { icon: BatteryCharging, bg: "#1E2D3D", border: "#F59E0B", text: "#FBBF24" },
  match:       { icon: Trophy, bg: "#1E2D3D", border: "#EF4444", text: "#F87171" },
  rest:        { icon: Moon, bg: "#0A0F14", border: "#2E4057", text: "#94A3B8" },
};

const FOCUS_KEYS = ["high_volume", "sharpness", "technical", "recovery", "match", "rest"];

// Hjelpefunksjon for å finne mandag i en bestemt uke
function getDateOfISOWeek(w: number, y: number) {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

interface DayPlan { focus: string; notes: string; }
interface Team { id: string; name: string; club_name: string; age_group: string; }
interface ExistingPlan {
  team_id: string; week_number: number; year: number;
  match_day: string | null; plan_data: Record<string, DayPlan>;
}
interface Match {
  id: string; team_id: string | null; date: Date | string; opponent: string;
}

interface WeekplanDict {
  no_teams: string; save_button: string; saved: string;
  note_placeholder: string; sessions_rule: string; of: string;
  days: Record<string, string>;
  focus: Record<string, string>;
  focus_desc: Record<string, string>;
}

interface Props {
  teams: Team[];
  matches: Match[];
  week: number;
  year: number;
  existingPlans: ExistingPlan[];
  dict: WeekplanDict;
  weekLabel: string;
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
  return Object.fromEntries(DAY_KEYS.map((k) => [k, { focus: "rest", notes: "" }]));
}

export default function UkesplanKlient({ teams, matches, week, year, existingPlans, dict, weekLabel }: Props) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0] ?? null);
  const [currentWeek, setCurrentWeek] = useState(week);
  const [currentYear, setCurrentYear] = useState(year);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Bygg en standard uke, eller hent eksisterende data
  function buildWeekData(teamId: string | null, w: number, y: number) {
    const existing = existingPlans.find((p) => p.team_id === teamId && p.week_number === w && p.year === y);
    const baseDays = existing?.plan_data ?? emptyWeek();
    let matchDayStr = existing?.match_day ?? "";

    // Hvis det ikke var kamp satt manuelt, se om vi finner en importert kamp i databasen
    if (!existing && teamId) {
      const mon = getDateOfISOWeek(w, y);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      
      const weeklyMatches = matches.filter(m => {
        if (m.team_id && m.team_id !== teamId) return false;
        const md = new Date(m.date);
        return md >= mon && md <= sun;
      });

      if (weeklyMatches.length > 0) {
        // Legg til første funnet kamp
        const md = new Date(weeklyMatches[0].date);
        const dayIndex = (md.getDay() + 6) % 7; // 0=mandag, 6=søndag
        const dayKey = DAY_KEYS[dayIndex];
        baseDays[dayKey] = { focus: "match", notes: `Kamp mot ${weeklyMatches[0].opponent}` };
        matchDayStr = dayKey;
      }
    }
    return { days: baseDays, matchDay: matchDayStr };
  }

  const initialData = buildWeekData(teams[0]?.id ?? null, week, year);
  const [days, setDays] = useState<Record<string, DayPlan>>(initialData.days);
  const [matchDay, setMatchDay] = useState(initialData.matchDay);

  function handleTeamChange(teamId: string) {
    const t = teams.find((t) => t.id === teamId) ?? null;
    setSelectedTeam(t);
    const data = buildWeekData(teamId, currentWeek, currentYear);
    setDays(data.days);
    setMatchDay(data.matchDay);
    setSaved(false);
  }

  function updateDay(dayKey: string, field: keyof DayPlan, value: string) {
    setDays((prev) => ({ ...prev, [dayKey]: { ...prev[dayKey], [field]: value } }));
    setSaved(false);
    if (field === "focus" && value === "match") setMatchDay(dayKey);
  }

  function prevWeek() {
    let nextW = currentWeek, nextY = currentYear;
    if (currentWeek === 1) { nextW = 52; nextY = currentYear - 1; }
    else nextW = currentWeek - 1;
    setCurrentWeek(nextW); setCurrentYear(nextY);
    const data = buildWeekData(selectedTeam?.id ?? null, nextW, nextY);
    setDays(data.days); setMatchDay(data.matchDay);
    setSaved(false);
  }

  function nextWeek() {
    let nextW = currentWeek, nextY = currentYear;
    if (currentWeek === 52) { nextW = 1; nextY = currentYear + 1; }
    else nextW = currentWeek + 1;
    setCurrentWeek(nextW); setCurrentYear(nextY);
    const data = buildWeekData(selectedTeam?.id ?? null, nextW, nextY);
    setDays(data.days); setMatchDay(data.matchDay);
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
    setSaving(false); setSaved(true);
    router.refresh();
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748B] text-sm">{dict.no_teams}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {teams.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTeamChange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                selectedTeam?.id === t.id
                  ? "border-[#22C55E] bg-[#1E2D3D] text-[#22C55E]"
                  : "border-[#2E4057] text-[#94A3B8] hover:border-[#22C55E]/40"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between bg-[#141D26] border border-[#2E4057] rounded-2xl px-4 py-3">
        <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-[#1E2D3D] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-bold text-[#F8FAFC]">{weekLabel} {currentWeek}</p>
          <p className="text-xs text-[#94A3B8]">{currentYear}</p>
        </div>
        <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-[#1E2D3D] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {sessionRule && (
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
          tooMany ? "bg-[#EF4444]/10 border-[#EF4444]/30" :
          tooFew  ? "bg-[#F59E0B]/10 border-[#F59E0B]/30" :
                    "bg-[#22C55E]/10 border-[#22C55E]/30"
        }`}>
          <p className={`text-xs font-medium ${tooMany ? "text-[#EF4444]" : tooFew ? "text-[#F59E0B]" : "text-[#22C55E]"}`}>
            {selectedTeam?.name}: {sessionRule.min}–{sessionRule.max} {dict.sessions_rule} {sessionRule.maxMin} min
          </p>
          <Badge variant={tooMany ? "red" : tooFew ? "yellow" : "green"}>
            {trainingDays} {dict.of} {sessionRule.max}
          </Badge>
        </div>
      )}

      <div className="space-y-2">
        {DAY_KEYS.map((key) => {
          const dayLabel = dict.days[key] ?? key;
          const day = days[key] ?? { focus: "rest", notes: "" };
          const focusCfg = FOCUS_STYLE[day.focus] ?? FOCUS_STYLE.rest;
          const isMatch = day.focus === "match";

          return (
            <div
              key={key}
              className="bg-[#141D26] border rounded-2xl overflow-hidden transition-all"
              style={{ borderColor: day.focus !== "rest" ? focusCfg.border : "#2E4057" }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 shrink-0">
                  <p className="font-semibold text-sm text-[#F8FAFC]">{dayLabel}</p>
                </div>
                {isMatch && <Trophy className="h-3.5 w-3.5 text-[#EF4444] shrink-0" />}
                <div className="flex gap-1.5 flex-wrap flex-1">
                  {FOCUS_KEYS.map((fKey) => {
                    const fStyle = FOCUS_STYLE[fKey];
                    const Icon = fStyle.icon;
                    return (
                      <button
                        key={fKey}
                        onClick={() => updateDay(key, "focus", fKey)}
                        title={dict.focus[fKey] ?? fKey}
                        className={`h-8 px-2.5 rounded-lg transition-all border flex items-center justify-center ${
                          day.focus === fKey
                            ? "text-white border-transparent"
                            : "bg-[#141D26] border-[#2E4057] text-[#94A3B8] hover:border-[#22C55E]/40 hover:text-[#F8FAFC]"
                        }`}
                        style={day.focus === fKey ? { background: focusCfg.border } : {}}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {day.focus !== "rest" && (
                <div className="px-4 pb-3">
                  <input
                    value={day.notes}
                    onChange={(e) => updateDay(key, "notes", e.target.value)}
                    placeholder={`${dict.note_placeholder} ${dayLabel.toLowerCase()}...`}
                    className="input-field text-xs py-2"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !selectedTeam}
        size="lg"
        className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white"
        variant={saved ? "secondary" : "default"}
      >
        {saving ? "..." : saved ? dict.saved : (
          <><Save className="h-4 w-4 mr-2" /> {dict.save_button}</>
        )}
      </Button>
    </div>
  );
}
