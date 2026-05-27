"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trophy, Dumbbell, ChevronLeft, ChevronRight, X, Users } from "lucide-react";

interface Player { id: string; first_name: string; last_name: string; position: string; }
interface Team { id: string; name: string; players: Player[]; }
interface Match {
  id: string; date: string; opponent: string; is_home: boolean;
  location?: string | null; competition?: string | null; notes?: string | null;
  player_ids: string[]; team?: { id: string; name: string } | null;
}
interface Session { id: string; date: string; title: string; theme: string; }

interface CalendarDict {
  title: string; subtitle: string; add_match: string; import_csv: string;
  today: string; home: string; away: string; players_selected: string;
  opponent: string; date: string; time: string; location: string;
  competition: string; notes: string; team: string; save: string; cancel: string;
  delete: string; confirm_delete: string; select_players: string;
  csv_help: string; csv_my_team: string; csv_team: string; importing: string;
  import_success: string; no_events: string; training: string; match: string;
}
interface TeamsDict { positions: Record<string, string>; }

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from Monday of current week
  const start = new Date(today);
  const dow = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setDate(start.getDate() - dow);
  // Show 5 weeks (35 days)
  const days: Date[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export default function KalenderKlient({ teams, matches: initialMatches, sessions, dict, teamsDict }: {
  teams: Team[]; matches: Match[]; sessions: Session[];
  dict: CalendarDict; teamsDict: TeamsDict;
}) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Form state
  const [fDate, setFDate]         = useState("");
  const [fTime, setFTime]         = useState("18:00");
  const [fOpponent, setFOpponent] = useState("");
  const [fIsHome, setFIsHome]     = useState(true);
  const [fLocation, setFLocation] = useState("");
  const [fComp, setFComp]         = useState("");
  const [fNotes, setFNotes]       = useState("");
  const [fTeamId, setFTeamId]     = useState(teams[0]?.id ?? "");
  const [fPlayers, setFPlayers]   = useState<string[]>([]);
  const [saving, setSaving]       = useState(false);

  // CSV state
  const [csvMyTeam, setCsvMyTeam] = useState("");
  const [csvTeamId, setCsvTeamId] = useState(teams[0]?.id ?? "");
  const [csvContent, setCsvContent] = useState("");
  const [csvStatus, setCsvStatus] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const calDays = buildCalendarDays();
  const offsetDays = calDays.map((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + weekOffset * 7); return nd; });

  const matchByDate: Record<string, Match[]> = {};
  for (const m of matches) {
    const key = toDateKey(new Date(m.date));
    (matchByDate[key] ??= []).push(m);
  }
  const sessionByDate: Record<string, Session[]> = {};
  for (const s of sessions) {
    const key = toDateKey(new Date(s.date));
    (sessionByDate[key] ??= []).push(s);
  }

  function openAdd(dateKey?: string) {
    setEditingMatch(null);
    setFDate(dateKey ?? toDateKey(today));
    setFTime("18:00"); setFOpponent(""); setFIsHome(true);
    setFLocation(""); setFComp(""); setFNotes("");
    setFTeamId(teams[0]?.id ?? ""); setFPlayers([]);
    setShowAddMatch(true);
  }

  function openEdit(m: Match) {
    const d = new Date(m.date);
    setEditingMatch(m);
    setFDate(toDateKey(d));
    setFTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setFOpponent(m.opponent); setFIsHome(m.is_home);
    setFLocation(m.location ?? ""); setFComp(m.competition ?? "");
    setFNotes(m.notes ?? ""); setFTeamId(m.team?.id ?? teams[0]?.id ?? "");
    setFPlayers(m.player_ids); setShowAddMatch(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      date: new Date(`${fDate}T${fTime}`).toISOString(),
      opponent: fOpponent, is_home: fIsHome,
      location: fLocation || null, competition: fComp || null,
      notes: fNotes || null, team_id: fTeamId || null, player_ids: fPlayers,
    };
    if (editingMatch) {
      const res = await fetch(`/api/kamper/${editingMatch.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const updated = await res.json();
      setMatches((prev) => prev.map((m) => m.id === editingMatch.id ? updated : m));
    } else {
      const res = await fetch("/api/kamper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created = await res.json();
      setMatches((prev) => [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
    setSaving(false); setShowAddMatch(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(dict.confirm_delete)) return;
    await fetch(`/api/kamper/${id}`, { method: "DELETE" });
    setMatches((prev) => prev.filter((m) => m.id !== id));
    setShowAddMatch(false);
  }

  async function handleCsvImport() {
    if (!csvContent) return;
    setCsvLoading(true); setCsvStatus("");
    const res = await fetch("/api/kamper/import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvContent, team_id: csvTeamId || null, my_team_name: csvMyTeam }),
    });
    const data = await res.json();
    if (res.ok) {
      setCsvStatus(`${dict.import_success}: ${data.created} kamper`);
      router.refresh();
    } else {
      setCsvStatus(data.error ?? "Feil");
    }
    setCsvLoading(false);
  }

  const selectedTeamForForm = teams.find((t) => t.id === fTeamId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg border border-[#E4E2F5] hover:bg-[#F0EEFF] text-[#64748B]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E4E2F5] hover:bg-[#F0EEFF] text-[#64748B]">
            {dict.today}
          </button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg border border-[#E4E2F5] hover:bg-[#F0EEFF] text-[#64748B]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCsvModal(true)}>
            <Upload className="h-4 w-4" /> {dict.import_csv}
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4" /> {dict.add_match}
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-[#E4E2F5] rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#E4E2F5]">
          {DAY_LABELS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {offsetDays.map((day, i) => {
            const key = toDateKey(day);
            const isToday = key === toDateKey(today);
            const isPast = day < today;
            const dayMatches = matchByDate[key] ?? [];
            const daySessions = sessionByDate[key] ?? [];
            const isSelected = selectedDay === key;

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={`min-h-[72px] p-1.5 border-b border-r border-[#E4E2F5] cursor-pointer transition-colors
                  ${isSelected ? "bg-[#F5F3FF]" : isPast ? "bg-[#FAFAFA]" : "hover:bg-[#F8F7FF]"}
                  ${i % 7 === 6 ? "border-r-0" : ""}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                    ${isToday ? "bg-[#6D28D9] text-white" : isPast ? "text-[#CBD5E1]" : "text-[#1A1A2E]"}`}>
                    {day.getDate()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openAdd(key); }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded text-[#94A3B8] hover:text-[#6D28D9] hover:bg-[#F0EEFF]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {dayMatches.map((m) => (
                    <button
                      key={m.id}
                      onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                      className="w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded bg-[#FEF2F2] border border-[#DC2626]/20 text-[#991B1B] truncate flex items-center gap-0.5"
                    >
                      <Trophy className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{m.is_home ? "" : "@"}{m.opponent}</span>
                    </button>
                  ))}
                  {daySessions.map((s) => (
                    <div key={s.id} className="w-full text-[10px] leading-tight px-1 py-0.5 rounded bg-[#EFF6FF] border border-[#2563EB]/20 text-[#1D4ED8] truncate flex items-center gap-0.5">
                      <Dumbbell className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FEF2F2] border border-[#DC2626]/20" />
          {dict.match}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#EFF6FF] border border-[#2563EB]/20" />
          {dict.training}
        </div>
      </div>

      {/* Add/Edit match modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E4E2F5]">
              <h3 className="font-semibold text-[#1A1A2E]">{editingMatch ? dict.match : dict.add_match}</h3>
              <button onClick={() => setShowAddMatch(false)} className="text-[#94A3B8] hover:text-[#1A1A2E]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.date}</label>
                  <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.time}</label>
                  <input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Opponent */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">{dict.opponent}</label>
                <input value={fOpponent} onChange={(e) => setFOpponent(e.target.value)} placeholder="Motstander" className="input-field" />
              </div>

              {/* Home/Away */}
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button key={String(val)} onClick={() => setFIsHome(val)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${fIsHome === val ? "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]" : "border-[#E4E2F5] text-[#64748B]"}`}>
                    {val ? `🏠 ${dict.home}` : `✈️ ${dict.away}`}
                  </button>
                ))}
              </div>

              {/* Location + Competition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.location}</label>
                  <input value={fLocation} onChange={(e) => setFLocation(e.target.value)} className="input-field text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.competition}</label>
                  <input value={fComp} onChange={(e) => setFComp(e.target.value)} className="input-field text-xs" />
                </div>
              </div>

              {/* Team */}
              {teams.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.team}</label>
                  <select value={fTeamId} onChange={(e) => { setFTeamId(e.target.value); setFPlayers([]); }} className="input-field">
                    <option value="">—</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Player selection */}
              {selectedTeamForForm && selectedTeamForForm.players.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#64748B] flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {dict.select_players}
                    </label>
                    <span className="text-xs text-[#6D28D9]">{fPlayers.length} {dict.players_selected}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                    {selectedTeamForForm.players.map((p) => (
                      <label key={p.id} className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer text-xs transition-colors
                        ${fPlayers.includes(p.id) ? "border-[#6D28D9] bg-[#F5F3FF]" : "border-[#E4E2F5] hover:bg-[#F8F7FF]"}`}>
                        <input type="checkbox" checked={fPlayers.includes(p.id)}
                          onChange={() => setFPlayers((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])}
                          className="accent-[#6D28D9]" />
                        <span className="text-[#1A1A2E] font-medium truncate">{p.first_name} {p.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">{dict.notes}</label>
                <textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} rows={2} className="input-field resize-none text-xs" />
              </div>

              <div className="flex gap-2 pt-1">
                {editingMatch && (
                  <Button variant="outline" onClick={() => handleDelete(editingMatch.id)} className="text-[#DC2626] border-[#DC2626]/20 hover:bg-[#FEF2F2]">
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!fOpponent || saving} className="flex-1">
                  {saving ? "..." : dict.save}
                </Button>
                <Button variant="outline" onClick={() => setShowAddMatch(false)}>{dict.cancel}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV import modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#E4E2F5]">
              <h3 className="font-semibold text-[#1A1A2E]">{dict.import_csv}</h3>
              <button onClick={() => { setShowCsvModal(false); setCsvContent(""); setCsvStatus(""); }} className="text-[#94A3B8] hover:text-[#1A1A2E]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#64748B]">{dict.csv_help}</p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">{dict.csv_my_team}</label>
                <input value={csvMyTeam} onChange={(e) => setCsvMyTeam(e.target.value)} placeholder="f.eks. Rosenborg" className="input-field text-xs" />
              </div>

              {teams.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#64748B]">{dict.csv_team}</label>
                  <select value={csvTeamId} onChange={(e) => setCsvTeamId(e.target.value)} className="input-field">
                    <option value="">—</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64748B]">CSV-fil</label>
                <input
                  ref={fileInputRef} type="file" accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setCsvContent(ev.target?.result as string);
                    reader.readAsText(file, "utf-8");
                  }}
                  className="input-field text-xs"
                />
              </div>

              {csvStatus && (
                <p className={`text-xs ${csvStatus.startsWith(dict.import_success) ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{csvStatus}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button onClick={handleCsvImport} disabled={!csvContent || csvLoading} className="flex-1">
                  {csvLoading ? dict.importing : dict.import_csv}
                </Button>
                <Button variant="outline" onClick={() => { setShowCsvModal(false); setCsvContent(""); setCsvStatus(""); }}>{dict.cancel}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
