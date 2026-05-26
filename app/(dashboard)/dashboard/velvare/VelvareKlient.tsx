"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WellbeingStatus, WellbeingSymptom } from "@/types";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
}

interface Report {
  player_id: string;
  status: "GREEN" | "YELLOW" | "RED";
  symptoms: string[];
  note: string | null;
}

interface Props {
  teams: Team[];
  reports: Report[];
  week: number;
  year: number;
}

const STATUS_CONFIG = {
  GREEN:   { label: "Overskudd",        emoji: "🟢", bg: "#F0FDF4", border: "#16A34A", text: "#15803D" },
  YELLOW:  { label: "Sliten/Vokseverk", emoji: "🟡", bg: "#FFFBEB", border: "#D97706", text: "#92400E" },
  RED:     { label: "Smerte",           emoji: "🔴", bg: "#FEF2F2", border: "#DC2626", text: "#991B1B" },
};

const SYMPTOMS: { key: string; label: string; forStatus: string[] }[] = [
  { key: "general_fatigue",  label: "Generell tretthet / lite energi",           forStatus: ["yellow", "red"] },
  { key: "muscle_soreness",  label: "Stivhet og ømhet i muskler",                forStatus: ["yellow", "red"] },
  { key: "growing_pains",    label: "Vokseverk i bein og ledd",                  forStatus: ["yellow", "red"] },
  { key: "schlatter",        label: "Murring/smerte foran på kneet (Schlatter)", forStatus: ["red"] },
  { key: "severs",           label: "Smerte bak på hælen (Severs)",              forStatus: ["red"] },
  { key: "sleep_issues",     label: "Dårlig søvn siste natt(er)",                forStatus: ["yellow"] },
  { key: "low_motivation",   label: "Lite motivasjon / tung å dra seg til trening", forStatus: ["yellow"] },
];

function PlayerCard({ player, report, onSaved }: {
  player: Player;
  report: Report | undefined;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<WellbeingStatus | null>(null);
  const [symptoms, setSymptoms] = useState<WellbeingSymptom[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const cfg = report ? STATUS_CONFIG[report.status] : null;
  const visibleSymptoms = status ? SYMPTOMS.filter((s) => s.forStatus.includes(status)) : [];

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
    setSaving(false);
    setDone(true);
    setOpen(false);
    onSaved();
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
            {cfg ? (
              <p className="text-xs mt-0.5" style={{ color: cfg.text }}>{cfg.emoji} {cfg.label}</p>
            ) : (
              <p className="text-xs text-[#94A3B8] mt-0.5">Ikke registrert denne uken</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {cfg && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
              {cfg.emoji} {cfg.label}
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
              <p className="text-sm font-semibold text-[#16A34A]">Registrert!</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-[#1A1A2E]">
                Hvordan er {player.first_name} denne uken?
              </p>

              <div className="space-y-2">
                {(["green", "yellow", "red"] as WellbeingStatus[]).map((s) => {
                  const c = STATUS_CONFIG[s.toUpperCase() as keyof typeof STATUS_CONFIG];
                  const isSelected = status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setSymptoms([]); }}
                      className="w-full text-left rounded-xl border-2 p-3 transition-all"
                      style={{
                        background: isSelected ? c.bg : "#FFFFFF",
                        borderColor: isSelected ? c.border : "#E4E2F5",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: isSelected ? c.text : "#1A1A2E" }}>{c.label}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {visibleSymptoms.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#64748B]">Symptomer (valgfritt):</p>
                  {visibleSymptoms.map((sym) => (
                    <label key={sym.key} className="flex items-center gap-2.5 rounded-lg border border-[#E4E2F5] bg-white p-2.5 cursor-pointer hover:bg-[#F8F7FF]">
                      <input
                        type="checkbox"
                        checked={symptoms.includes(sym.key as WellbeingSymptom)}
                        onChange={() => toggleSymptom(sym.key as WellbeingSymptom)}
                        className="h-4 w-4 accent-[#6D28D9]"
                      />
                      <span className="text-xs text-[#1A1A2E]">{sym.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {status && status !== "green" && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tilleggsinfo til treneren (valgfritt)..."
                  rows={2}
                  className="input-field resize-none text-xs"
                />
              )}

              <Button onClick={handleSave} disabled={!status || saving} className="w-full" size="lg">
                {saving ? "Lagrer..." : "Registrer velvære"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function VelvareKlient({ teams, reports, week, year }: Props) {
  const router = useRouter();
  const reportMap = Object.fromEntries(reports.map((r) => [r.player_id, r]));

  const allPlayers = teams.flatMap((t) => t.players);
  const countGreen  = reports.filter((r) => r.status === "GREEN").length;
  const countYellow = reports.filter((r) => r.status === "YELLOW").length;
  const countRed    = reports.filter((r) => r.status === "RED").length;
  const countMissing = allPlayers.length - reports.length;

  const redYellowPlayers = reports
    .filter((r) => r.status === "RED" || r.status === "YELLOW")
    .map((r) => {
      const player = allPlayers.find((p) => p.id === r.player_id);
      return player ? { ...player, report: r } : null;
    })
    .filter(Boolean) as (Player & { report: Report })[];

  return (
    <div className="space-y-6">
      {/* Uke-oversikt */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Grønn",      count: countGreen,  bg: "#F0FDF4", text: "#15803D", border: "#16A34A" },
          { label: "Gul",        count: countYellow, bg: "#FFFBEB", text: "#92400E", border: "#D97706" },
          { label: "Rød",        count: countRed,    bg: "#FEF2F2", text: "#991B1B", border: "#DC2626" },
          { label: "Mangler",    count: countMissing,bg: "#F8FAFC", text: "#64748B", border: "#E4E2F5" },
        ].map(({ label, count, bg, text, border }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: bg, borderColor: border }}>
            <p className="text-xl font-bold" style={{ color: text }}>{count}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: text }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Varsel for røde/gule */}
      {redYellowPlayers.length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#92400E]">
              {redYellowPlayers.length} spiller{redYellowPlayers.length !== 1 ? "e" : ""} trenger oppfølging
            </p>
          </div>
          <div className="space-y-1 pl-6">
            {redYellowPlayers.map(({ id, first_name, last_name, report }) => (
              <p key={id} className="text-xs text-[#92400E]">
                {STATUS_CONFIG[report.status].emoji} {first_name} {last_name}
                {report.note && <span className="text-[#D97706]"> — {report.note}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Spillere per lag */}
      {teams.map((team) => (
        <div key={team.id} className="space-y-2">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
            {team.name} · {team.players.length} spillere
          </p>
          {team.players.length === 0 ? (
            <p className="text-xs text-[#94A3B8] px-1">Ingen aktive spillere i dette laget.</p>
          ) : (
            team.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                report={reportMap[player.id]}
                onSaved={() => router.refresh()}
              />
            ))
          )}
        </div>
      ))}

      {allPlayers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#64748B] text-sm">Ingen spillere registrert ennå.</p>
          <p className="text-[#94A3B8] text-xs mt-1">Legg til spillere under Lag & Spillere.</p>
        </div>
      )}
    </div>
  );
}
