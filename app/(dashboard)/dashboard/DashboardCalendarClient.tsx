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
  const [previewMatches, setPreviewMatches] = useState<any[]>([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<Set<string>>(new Set());
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
      body: JSON.stringify({ action: "preview", csv: csvContent, team_id: csvTeamId || null, my_team_name: csvMyTeam }),
    });
    const data = await res.json();
    if (res.ok) {
      setPreviewMatches(data.matches || []);
      setSelectedPreviewIds(new Set((data.matches || []).map((m: any) => m.id)));
    } else {
      setCsvStatus(data.error ?? "Feil");
    }
    setCsvLoading(false);
  }

  async function handleCsvCommit() {
    const toCommit = previewMatches.filter(m => selectedPreviewIds.has(m.id));
    if (toCommit.length === 0) return;
    setCsvLoading(true); setCsvStatus("");
    const res = await fetch("/api/kamper/import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "commit", matches: toCommit, team_id: csvTeamId || null }),
    });
    const data = await res.json();
    if (res.ok) {
      setCsvStatus(`${dict.import_success}: ${data.created} kamper`);
      setTimeout(() => {
        setShowCsvModal(false); setCsvContent(""); setPreviewMatches([]);
        router.refresh();
      }, 1500);
    } else {
      setCsvStatus(data.error ?? "Feil");
    }
    setCsvLoading(false);
  }

  const selectedTeamForForm = teams.find((t) => t.id === fTeamId);

  const middleDay = offsetDays[17] || new Date();
  const displayMonth = middleDay.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
  const capitalizedMonth = displayMonth.charAt(0).toUpperCase() + displayMonth.slice(1);
  const todayStr = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const capitalizedToday = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <div className="space-y-6">
      {/* Header med Måned og Dagens dato */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#FFFFFF] tracking-tight">{capitalizedMonth}</h1>
          <p className="text-[#8E8E93] mt-1 text-sm font-medium">{dict.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8E8E93] uppercase tracking-wider font-semibold mb-1">I dag</p>
          <p className="text-[#FFFFFF] text-sm font-medium bg-[#1C1C1E] border border-[#38383A] px-3 py-1.5 rounded-lg">
            {capitalizedToday}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-[#1C1C1E] p-2 rounded-2xl border border-[#38383A]">
        <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-xl border border-transparent hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#FFFFFF] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
            <button onClick={() => setWeekOffset(0)} className="text-sm font-semibold px-4 py-2 rounded-xl border border-transparent hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#FFFFFF] transition-colors">
            {dict.today}
          </button>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-xl border border-transparent hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#FFFFFF] transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 pr-1">
          <Button variant="secondary" className="rounded-xl text-sm font-medium" onClick={() => setShowCsvModal(true)}>
            <Upload className="h-4 w-4 mr-2" /> {dict.import_csv}
          </Button>
          <Button className="rounded-xl text-sm font-medium bg-[#0A84FF] hover:bg-[#007AFF] text-white" onClick={() => openAdd()}>
            <Plus className="h-4 w-4 mr-2" /> {dict.add_match}
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl overflow-hidden">
        {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#38383A]">
          {DAY_LABELS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">
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
                className={`min-h-[72px] p-1.5 border-b border-r border-[#38383A] cursor-pointer transition-colors
                  ${isSelected ? "bg-[#2C2C2E]" : isPast ? "bg-[#000000]" : "hover:bg-[#2C2C2E]"}
                  ${i % 7 === 6 ? "border-r-0" : ""}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                    ${isToday ? "bg-[#0A84FF] text-white" : isPast ? "text-[#475569]" : "text-[#FFFFFF]"}`}>
                    {day.getDate()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openAdd(key); }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded text-[#8E8E93] hover:text-[#0A84FF] hover:bg-[#2C2C2E]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {dayMatches.map((m) => (
                    <button
                      key={m.id}
                      onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                      className="w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] truncate flex items-center gap-0.5"
                    >
                      <Trophy className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{m.is_home ? "" : "@"}{m.opponent}</span>
                    </button>
                  ))}
                  {daySessions.map((s) => (
                    <div key={s.id} className="w-full text-[10px] leading-tight px-1 py-0.5 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] truncate flex items-center gap-0.5">
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
      <div className="flex gap-4 text-xs text-[#8E8E93]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#EF4444]/10 border border-[#EF4444]/20" />
          {dict.match}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20" />
          {dict.training}
        </div>
      </div>

      {/* Add/Edit match modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1C1C1E] rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[#38383A]">
            <div className="flex items-center justify-between p-4 border-b border-[#38383A]">
              <h3 className="font-semibold text-[#FFFFFF]">{editingMatch ? dict.match : dict.add_match}</h3>
              <button onClick={() => setShowAddMatch(false)} className="text-[#8E8E93] hover:text-[#FFFFFF]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#8E8E93]">{dict.date}</label>
                  <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#8E8E93]">{dict.time}</label>
                  <input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Opponent */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#8E8E93]">{dict.opponent}</label>
                <input value={fOpponent} onChange={(e) => setFOpponent(e.target.value)} placeholder="Motstander" className="input-field" />
              </div>

              {/* Home/Away */}
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button key={String(val)} onClick={() => setFIsHome(val)}
                    className={`flex-1 py-2 rounded-2xl border-2 text-sm font-medium transition-all ${fIsHome === val ? "border-[#0A84FF] bg-[#2C2C2E] text-[#0A84FF]" : "border-[#38383A] text-[#8E8E93] hover:border-[#0A84FF]/40"}`}>
                    {val ? `🏠 ${dict.home}` : `✈️ ${dict.away}`}
                  </button>
                ))}
              </div>

              {/* Location + Competition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#8E8E93]">{dict.location}</label>
                  <input value={fLocation} onChange={(e) => setFLocation(e.target.value)} className="input-field text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#8E8E93]">{dict.competition}</label>
                  <input value={fComp} onChange={(e) => setFComp(e.target.value)} className="input-field text-xs" />
                </div>
              </div>

              {/* Team */}
              {teams.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#8E8E93]">{dict.team}</label>
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
                    <label className="text-xs font-medium text-[#8E8E93] flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {dict.select_players}
                    </label>
                    <span className="text-xs text-[#0A84FF]">{fPlayers.length} {dict.players_selected}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedTeamForForm.players.map((p) => (
                      <label key={p.id} className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer text-xs transition-colors
                        ${fPlayers.includes(p.id) ? "border-[#0A84FF] bg-[#2C2C2E]" : "border-[#38383A] hover:bg-[#2C2C2E]"}`}>
                        <input type="checkbox" checked={fPlayers.includes(p.id)}
                          onChange={() => setFPlayers((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])}
                          className="accent-[#0A84FF]" />
                        <span className="text-[#FFFFFF] font-medium truncate">{p.first_name} {p.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#8E8E93]">{dict.notes}</label>
                <textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} rows={2} className="input-field resize-none text-xs" />
              </div>

              <div className="flex gap-2 pt-1">
                {editingMatch && (
                  <Button variant="outline" onClick={() => handleDelete(editingMatch.id)} className="text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444]/10">
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!fOpponent || saving} className="flex-1 bg-[#0A84FF] hover:bg-[#007AFF] text-white">
                  {saving ? "..." : dict.save}
                </Button>
                <Button variant="outline" onClick={() => setShowAddMatch(false)} className="text-[#8E8E93]">{dict.cancel}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV import modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1C1C1E] rounded-3xl w-full max-w-md border border-[#38383A]">
            <div className="flex items-center justify-between p-4 border-b border-[#38383A]">
              <h3 className="font-semibold text-[#FFFFFF]">{dict.import_csv}</h3>
              <button onClick={() => { setShowCsvModal(false); setCsvContent(""); setCsvStatus(""); setPreviewMatches([]); }} className="text-[#8E8E93] hover:text-[#FFFFFF]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {previewMatches.length === 0 ? (
                <>
                  <p className="text-xs text-[#8E8E93]">
                    Lim inn kalender-lenken fra fotball.no (f.eks. https://www.fotball.no/footballapi/Calendar/GetCalendar?teamId=...)
                    <br /><br />
                    Systemet vil hente kampene slik at du kan velge hvilke du vil lagre.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#8E8E93]">{dict.csv_my_team}</label>
                    <input value={csvMyTeam} onChange={(e) => setCsvMyTeam(e.target.value)} placeholder="f.eks. Rosenborg" className="input-field text-xs" />
                  </div>

                  {teams.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#8E8E93]">{dict.csv_team}</label>
                      <select value={csvTeamId} onChange={(e) => setCsvTeamId(e.target.value)} className="input-field">
                        <option value="">—</option>
                        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#8E8E93]">NFF Kalender-lenke</label>
                    <input
                      type="text"
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      placeholder="https://www.fotball.no/..."
                      className="input-field text-xs text-[#8E8E93]"
                    />
                  </div>

                  {csvStatus && (
                    <p className={`text-xs ${csvStatus.includes(dict.import_success) ? "text-[#0A84FF]" : "text-[#EF4444]"}`}>{csvStatus}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleCsvImport} disabled={!csvContent || csvLoading} className="flex-1 bg-[#0A84FF] hover:bg-[#007AFF] text-white">
                      {csvLoading ? dict.importing : "Forhåndsvis kamper"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowCsvModal(false); setCsvContent(""); setCsvStatus(""); setPreviewMatches([]); }} className="text-[#8E8E93]">{dict.cancel}</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-[#FFFFFF] mb-2">Velg kamper å importere ({selectedPreviewIds.size} av {previewMatches.length} valgt)</p>
                  <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
                    {previewMatches.map((m) => (
                      <label key={m.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${selectedPreviewIds.has(m.id) ? "bg-[#2C2C2E] border-[#0A84FF]" : "border-[#38383A] hover:bg-[#2C2C2E]"}`}>
                        <input
                          type="checkbox"
                          checked={selectedPreviewIds.has(m.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedPreviewIds);
                            if (e.target.checked) newSet.add(m.id);
                            else newSet.delete(m.id);
                            setSelectedPreviewIds(newSet);
                          }}
                          className="accent-[#0A84FF]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#FFFFFF] truncate">{m.is_home ? "" : "@"}{m.opponent}</p>
                          <p className="text-[10px] text-[#8E8E93]">
                            {new Date(m.date).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" })} 
                            {m.competition && ` • ${m.competition}`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {csvStatus && (
                    <p className={`text-xs ${csvStatus.includes(dict.import_success) ? "text-[#0A84FF]" : "text-[#EF4444]"}`}>{csvStatus}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleCsvCommit} disabled={selectedPreviewIds.size === 0 || csvLoading} className="flex-1 bg-[#0A84FF] hover:bg-[#007AFF] text-white">
                      {csvLoading ? dict.importing : `Lagre ${selectedPreviewIds.size} kamper`}
                    </Button>
                    <Button variant="outline" onClick={() => setPreviewMatches([])} className="text-[#8E8E93]">Tilbake</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
