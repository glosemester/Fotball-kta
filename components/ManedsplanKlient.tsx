"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, CalendarDays, CheckCircle2, AlertTriangle } from "lucide-react";
import type { SessionTheme } from "@/types";

interface TeamOption { id: string; name: string; club_name: string; age_group: string; }

const THEME_EMOJI: Record<string, string> = {
  pasning_mottak: "🎯", dribling_vendinger: "🌀", avslutninger: "🥅",
  forsvar: "🛡️", posisjonsspill: "♟️", pressing: "⚡",
  overganger: "↔️", keeperteknikk: "🧤", fritt_spill: "⚽",
};

const THEME_KEYS: SessionTheme[] = [
  "pasning_mottak", "dribling_vendinger", "avslutninger", "forsvar",
  "posisjonsspill", "pressing", "overganger", "keeperteknikk", "fritt_spill",
];

const WEEKDAYS = [
  { id: 1, label: "Mandag" },
  { id: 2, label: "Tirsdag" },
  { id: 3, label: "Onsdag" },
  { id: 4, label: "Torsdag" },
  { id: 5, label: "Fredag" },
  { id: 6, label: "Lørdag" },
  { id: 0, label: "Søndag" },
];

export default function ManedsplanKlient() {
  const router = useRouter();
  
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamId, setTeamId] = useState("");
  const [theme, setTheme] = useState<SessionTheme | null>(null);
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const [selectedMonth, setSelectedMonth] = useState(nextMonth.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(nextMonth.getFullYear());
  
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/lag")
      .then((r) => r.json())
      .then((data: TeamOption[]) => {
        setTeams(data);
        if (data.length === 1) {
          setTeamId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function toggleDay(day: number) {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  }

  async function handleGenerate() {
    if (!teamId || !theme || selectedDays.length === 0) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/manedsplan/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          theme,
          month: selectedMonth,
          year: selectedYear,
          weekdays: selectedDays
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kunne ikke opprette månedsplan");
      }

      router.push("/dashboard/treninger");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  const isFormValid = teamId !== "" && theme !== null && selectedDays.length > 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#FFFFFF]">Generer Månedsplan</h1>
        <p className="text-[#8E8E93] mt-1 text-sm">Sett opp treningstidene deres, så oppretter vi en plan for hele måneden basert på hovedtemaet du velger.</p>
      </div>

      <div className="space-y-5">
        {teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3B82F6]" />
                Hvilket lag?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="input-field">
                <option value="">Velg lag</option>
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
              <CalendarDays className="h-4 w-4 text-[#3B82F6]" />
              Velg Måned og Treningsdager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-1">Måned</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="input-field">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('no-NB', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8E8E93] mb-1">År</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="input-field">
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-2">Hvilke dager trener dere normalt?</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`rounded-2xl border-2 px-3 py-2 text-sm transition-all ${
                      selectedDays.includes(day.id)
                        ? "border-[#3B82F6] bg-[#2C2C2E] text-[#3B82F6] font-semibold"
                        : "border-[#38383A] hover:border-[#3B82F6]/40 text-[#FFFFFF]"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-[#3B82F6]" />
              Hva er månedens fokus?
            </CardTitle>
            <CardDescription>Velg et hovedtema for måneden. Alle treninger i denne måneden vil få dette temaet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {THEME_KEYS.map((value) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`rounded-2xl border-2 p-3 text-sm text-left transition-all ${
                    theme === value
                      ? "border-[#3B82F6] bg-[#2C2C2E] text-[#3B82F6] font-semibold"
                      : "border-[#38383A] hover:border-[#3B82F6]/40 text-[#FFFFFF]"
                  }`}
                >
                  <span className="mr-2">{THEME_EMOJI[value]}</span>
                  <span className="capitalize">{value.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-[#EF4444]/10 rounded-2xl border border-[#EF4444]/20">
            <AlertTriangle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
            <p className="text-xs text-[#EF4444]">{error}</p>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={!isFormValid || loading} size="lg" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
          {loading ? "Oppretter Månedsplan..." : "Generer Treninger"}
        </Button>
      </div>
    </div>
  );
}
