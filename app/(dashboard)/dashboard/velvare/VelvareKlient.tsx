"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WellbeingStatus, WellbeingSymptom } from "@/types";

interface Player { id: string; first_name: string; last_name: string; position: string; }
interface Team { id: string; name: string; players: Player[]; }
interface Report { player_id: string; status: "GREEN" | "YELLOW" | "RED"; symptoms: string[]; note: string | null; }

type WellbeingDict = {
  count_green: string; count_yellow: string; count_red: string; count_missing: string;
  alert_needs_followup: string; not_registered: string; how_is: string; this_week: string;
  symptoms_optional: string; extra_info: string; register_button: string; registered: string;
  no_players: string; no_players_hint: string; no_active_players: string;
  statuses: Record<string, string>; symptoms: Record<string, string>;
  saving?: string;
};

interface Props { teams: Team[]; reports: Report[]; week: number; year: number; dict: WellbeingDict; }

const STATUS_STYLE = {
  GREEN:  { emoji: "🟢", bg: "#F0FDF4", border: "#16A34A", text: "#15803D" },
  YELLOW: { emoji: "🟡", bg: "#FFFBEB", border: "#D97706", text: "#92400E" },
  RED:    { emoji: "🔴", bg: "#FEF2F2", border: "#DC2626", text: "#991B1B" },
};

const SYMPTOM_STATUS: Record<string, string[]> = {
  general_fatigue: ["yellow","red"], muscle_soreness: ["yellow","red"],
  growing_pains: ["yellow","red"], schlatter: ["red"], severs: ["red"],
  sleep_issues: ["yellow"], low_motivation: ["yellow"],
};
const SYMPTOM_KEYS = Object.keys(SYMPTOM_STATUS);

function PlayerCard({ player, report, dict, onSaved }: {
  player: Player; report: Report | undefined; dict: WellbeingDict; onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<WellbeingStatus | null>(null);
  const [symptoms, setSymptoms] = useState<WellbeingSymptom[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const style = report ? STATUS_STYLE[report.status] : null;
  const statusLabel = report ? dict.statuses[report.status] : null;
  const visibleSymptoms = status ? SYMPTOM_KEYS.filter((k) => SYMPTOM_STATUS[k].includes(status)) : [];

  function toggleSymptom(key: WellbeingSymptom) {
    setSymptoms((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  }

  async function handleSave() {
    if (!status) return;
    setSaving(true);
    await fetch("/api/velvare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: player.id, status, symptoms, note: note || undefined, reported_by: "coach" }),
    });
    setSaving(false); setDone(true); setOpen(false); onSaved();
  }

  return (
    <div className="bg-white border border-[#E4E2F5] rounded-xl overflow-hidden">
      <button
        onClick={() => { setOpen((o) => !o); setDone(false); setStatus(null); setSymptoms([]); setNote(""); }}
        className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8F7FF] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0">
            <UserRound className="h-4 w-4 text-[#6D28D9]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A2E] text-sm">{player.first_name} {player.last_name}</p>
            {style && statusLabel ? (
              <p className="text-xs mt-0.5" style={{ color: style.text }}>{style.emoji} {statusLabel}</p>
            ) : (
              <p className="text-xs text-[#94A3B8] mt-0.5">{dict.not_registered}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {style && statusLabel && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border" style={{ background: style.bg, borderColor: style.border, color: style.text }}>
              {style.emoji} {statusLabel}
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-[#94A3B8]" /> : <ChevronDown className="h-4 w-4 text-[#94A3B8]" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#E4E2F5] p-4 space-y-4 bg-[#FAFAFA]">
          {done ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-sm font-semibold text-[#16A34A]">{dict.registered}</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-[#1A1A2E]">
                {dict.how_is} {player.first_name} {dict.this_week}
              </p>
              <div className="space-y-2">
                {(["green","yellow","red"] as WellbeingStatus[]).map((s) => {
                  const st = STATUS_STYLE[s.toUpperCase() as keyof typeof STATUS_STYLE];
                  const isSelected = status === s;
                  return (
                    <button key={s} onClick={() => { setStatus(s); setSymptoms([]); }}
                      className="w-full text-left rounded-xl border-2 p-3 transition-all"
                      style={{ background: isSelected ? st.bg : "#FFFFFF", borderColor: isSelected ? st.border : "#E4E2F5" }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{st.emoji}</span>
                        <p className="font-semibold text-sm" style={{ color: isSelected ? st.text : "#1A1A2E" }}>
                          {dict.statuses[s.toUpperCase()]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {visibleSymptoms.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#64748B]">{dict.symptoms_optional}</p>
                  {visibleSymptoms.map((key) => (
                    <label key={key} className="flex items-center gap-2.5 rounded-lg border border-[#E4E2F5] bg-white p-2.5 cursor-pointer hover:bg-[#F8F7FF]">
                      <input type="checkbox" checked={symptoms.includes(key as WellbeingSymptom)}
                        onChange={() => toggleSymptom(key as WellbeingSymptom)} className="h-4 w-4 accent-[#6D28D9]" />
                      <span className="text-xs text-[#1A1A2E]">{dict.symptoms[key] ?? key}</span>
                    </label>
                  ))}
                </div>
              )}

              {status && status !== "green" && (
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder={dict.extra_info} rows={2} className="input-field resize-none text-xs" />
              )}

              <Button onClick={handleSave} disabled={!status || saving} className="w-full" size="lg">
                {saving ? (dict.saving ?? "...") : dict.register_button}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function VelvareKlient({ teams, reports, week, year, dict }: Props) {
  const router = useRouter();
  const reportMap = Object.fromEntries(reports.map((r) => [r.player_id, r]));
  const allPlayers = teams.flatMap((t) => t.players);
  const countGreen   = reports.filter((r) => r.status === "GREEN").length;
  const countYellow  = reports.filter((r) => r.status === "YELLOW").length;
  const countRed     = reports.filter((r) => r.status === "RED").length;
  const countMissing = allPlayers.length - reports.length;

  const redYellowPlayers = reports
    .filter((r) => r.status === "RED" || r.status === "YELLOW")
    .map((r) => { const p = allPlayers.find((p) => p.id === r.player_id); return p ? { ...p, report: r } : null; })
    .filter(Boolean) as (Player & { report: Report })[];

  const counts = [
    { label: dict.count_green,   count: countGreen,   bg: "#F0FDF4", text: "#15803D", border: "#16A34A" },
    { label: dict.count_yellow,  count: countYellow,  bg: "#FFFBEB", text: "#92400E", border: "#D97706" },
    { label: dict.count_red,     count: countRed,     bg: "#FEF2F2", text: "#991B1B", border: "#DC2626" },
    { label: dict.count_missing, count: countMissing, bg: "#F8FAFC", text: "#64748B", border: "#E4E2F5" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {counts.map(({ label, count, bg, text, border }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: bg, borderColor: border }}>
            <p className="text-xl font-bold" style={{ color: text }}>{count}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: text }}>{label}</p>
          </div>
        ))}
      </div>

      {redYellowPlayers.length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#92400E]">
              {redYellowPlayers.length} {dict.alert_needs_followup}
            </p>
          </div>
          <div className="space-y-1 pl-6">
            {redYellowPlayers.map(({ id, first_name, last_name, report }) => (
              <p key={id} className="text-xs text-[#92400E]">
                {STATUS_STYLE[report.status].emoji} {first_name} {last_name}
                {report.note && <span className="text-[#D97706]"> — {report.note}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {teams.map((team) => (
        <div key={team.id} className="space-y-2">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
            {team.name} · {team.players.length}
          </p>
          {team.players.length === 0 ? (
            <p className="text-xs text-[#94A3B8] px-1">{dict.no_active_players}</p>
          ) : (
            team.players.map((player) => (
              <PlayerCard key={player.id} player={player} report={reportMap[player.id]}
                dict={dict} onSaved={() => router.refresh()} />
            ))
          )}
        </div>
      ))}

      {allPlayers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#64748B] text-sm">{dict.no_players}</p>
          <p className="text-[#94A3B8] text-xs mt-1">{dict.no_players_hint}</p>
        </div>
      )}
    </div>
  );
}
