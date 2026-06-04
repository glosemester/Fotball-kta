"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CalendarDays, Users, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SlettOktListKnapp from "./SlettOktListKnapp";

const THEME_EMOJIS: Record<string, string> = {
  PASNING_MOTTAK: "🎯", DRIBLING_VENDINGER: "🌀", AVSLUTNINGER: "🥅",
  FORSVAR: "🛡️", POSISJONSSPILL: "♟️", PRESSING: "⚡",
  OVERGANGER: "↔️", KEEPERTEKNIKK: "🧤", FRITT_SPILL: "⚽",
  VENN_MED_BALLEN: "🔥"
};

const THEME_KEYS: Record<string, string> = {
  PASNING_MOTTAK: "pasning_mottak", DRIBLING_VENDINGER: "dribling_vendinger",
  AVSLUTNINGER: "avslutninger", FORSVAR: "forsvar", POSISJONSSPILL: "posisjonsspill",
  PRESSING: "pressing", OVERGANGER: "overganger", KEEPERTEKNIKK: "keeperteknikk",
  FRITT_SPILL: "fritt_spill", VENN_MED_BALLEN: "venn_med_ballen"
};

export default function TreningListeKlient({ initialSessions, dict, dateLocale, d }: any) {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(dateLocale, {
      weekday: "short", day: "numeric", month: "short",
    });
  }

  const STATUS_BADGE: Record<string, { label: string; variant: "green" | "yellow" | "secondary" }> = {
    DRAFT:     { label: d.status_draft,     variant: "secondary" },
    ACTIVE:    { label: d.status_active,    variant: "yellow" },
    COMPLETED: { label: d.status_completed, variant: "green" },
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Er du sikker på at du vil slette ${selectedIds.size} økter?`)) return;
    setIsDeleting(true);
    try {
      // Slett én og én via eksisterende endepunkt, eller bygg bulk. Vi kjører loop for enkelhet
      for (const id of Array.from(selectedIds)) {
        await fetch(`/api/treninger/${id}`, { method: "DELETE" });
      }
      setSessions((prev: any) => prev.filter((s: any) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      alert("Feil ved sletting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-[#1C1C1E] p-3 rounded-2xl border border-[#0A84FF]/30">
          <span className="text-sm text-[#0A84FF]">{selectedIds.size} økter valgt</span>
          <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={isDeleting} className="text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444]/10">
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Sletter..." : "Slett valgte"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.map((s: any) => {
          const themeKey = THEME_KEYS[s.theme];
          const themeLabel = themeKey ? (d.themes as Record<string, string>)[themeKey] ?? s.theme : s.theme;
          const emoji = THEME_EMOJIS[s.theme] ?? "⚽";
          const statusInfo = STATUS_BADGE[s.status] ?? STATUS_BADGE.DRAFT;
          const isSelected = selectedIds.has(s.id);

          return (
            <div
              key={s.id}
              className={`group relative bg-[#1C1C1E] border ${isSelected ? "border-[#0A84FF]" : "border-[#38383A] hover:border-[#0A84FF]/40"} rounded-3xl p-4 flex items-center justify-between hover:bg-[#2C2C2E] transition-all`}
            >
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => toggleSelect(s.id)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 accent-[#0A84FF] w-4 h-4 cursor-pointer" 
              />
              <Link href={`/dashboard/treninger/${s.id}`} className="absolute inset-0 z-0 rounded-3xl" aria-label={`Gå til ${themeLabel}`} />
              
              <div className="flex items-center gap-4 relative z-10 pointer-events-none pl-8">
                <div className="w-11 h-11 rounded-2xl bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center shrink-0 text-xl">
                  {emoji}
                </div>
                <div>
                  <p className="font-semibold text-[#FFFFFF] text-sm">{themeLabel}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#8E8E93]">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8E8E93]">
                      <Users className="h-3 w-3" />
                      {s.actual_player_count} {dict.common.players}
                    </span>
                    {s.team && (
                      <span className="text-xs text-[#4E5A72] hidden sm:inline">{s.team.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 relative z-10">
                <Badge variant={statusInfo.variant} className="hidden sm:inline-flex">{statusInfo.label}</Badge>
                {!isSelected && <SlettOktListKnapp id={s.id} />}
                <ChevronRight className="h-4 w-4 text-[#8E8E93] group-hover:text-[#0A84FF] transition-colors pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
