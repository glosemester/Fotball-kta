"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, CalendarDays, Activity, ClipboardList, TrendingUp, Zap, Target, BatteryCharging, Trophy, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const FOCUS_STYLE: Record<string, { icon: React.ElementType; border: string; label: string }> = {
  high_volume: { icon: TrendingUp, border: "#3B82F6", label: "Høy intensitet" },
  sharpness:   { icon: Zap, border: "#A855F7", label: "Skarphet" },
  technical:   { icon: Target, border: "#22C55E", label: "Teknisk" },
  recovery:    { icon: BatteryCharging, border: "#F59E0B", label: "Restitusjon" },
  match:       { icon: Trophy, border: "#EF4444", label: "Kamp" },
  rest:        { icon: Moon, border: "#2E4057", label: "Hvile" },
};

export default function DashboardHomeClient({ fullName, teams, existingPlans, matches, week, dict }: any) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || null);

  const selectedTeam = teams.find((t: any) => t.id === selectedTeamId);
  const plan = existingPlans.find((p: any) => p.team_id === selectedTeamId);
  
  return (
    <div className="space-y-8">
      {/* Hilsen */}
      <div>
        <h1 className="font-heading text-4xl uppercase tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] to-[#94A3B8]">
          HEI {fullName}
        </h1>
        <p className="text-[#94A3B8] mt-1 text-sm font-medium tracking-wide">HVA ER PLANEN FOR I DAG?</p>
      </div>

      {/* Lagvelger */}
      {teams.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {teams.map((t: any) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
                selectedTeamId === t.id
                  ? "bg-[#22C55E]/10 border border-[#22C55E]/50 text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  : "glass-panel text-[#94A3B8] hover:text-[#F8FAFC] glass-panel-hover"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Hovedhandlinger */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/treninger/ny">
          <Button className="w-full h-14 bg-gradient-to-br from-[#22C55E] to-[#16A34A] hover:from-[#4ADE80] hover:to-[#22C55E] text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-0.5 transition-all duration-300 text-sm border border-[#4ADE80]/30">
            <Dumbbell className="mr-2 h-5 w-5" /> Ny Økt
          </Button>
        </Link>
        <Link href="/dashboard/ukesplan">
          <Button variant="outline" className="w-full h-14 glass-panel glass-panel-hover border-none text-[#F8FAFC] font-bold uppercase tracking-wider rounded-xl text-sm hover:-translate-y-0.5 transition-all duration-300">
            <CalendarDays className="mr-2 h-5 w-5 text-[#22C55E]" /> Ukesplan
          </Button>
        </Link>
        <Link href="/dashboard/velvare">
          <Button variant="outline" className="w-full h-12 glass-panel glass-panel-hover border-none text-[#94A3B8] hover:text-[#F8FAFC] font-semibold tracking-wide uppercase rounded-xl text-xs hover:-translate-y-0.5 transition-all duration-300">
            <Activity className="mr-2 h-4 w-4 text-[#F97316]" /> Spillerstatus
          </Button>
        </Link>
        <Link href="/dashboard/treninger">
          <Button variant="outline" className="w-full h-12 glass-panel glass-panel-hover border-none text-[#94A3B8] hover:text-[#F8FAFC] font-semibold tracking-wide uppercase rounded-xl text-xs hover:-translate-y-0.5 transition-all duration-300">
            <ClipboardList className="mr-2 h-4 w-4 text-[#94A3B8]" /> Alle økter
          </Button>
        </Link>
      </div>

      {/* Ukesplan Visning */}
      {selectedTeam && (
        <div>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="font-heading text-2xl uppercase tracking-widest font-bold text-[#F8FAFC]">
              UKE {week} <span className="text-[#94A3B8] font-medium ml-2">| {selectedTeam.name}</span>
            </h2>
          </div>
          <div className="space-y-3">
            {DAY_KEYS.map((dayKey, index) => {
              const dayLabel = dict.weekplan?.days?.[dayKey] || dayKey;
              const dayData = plan?.plan_data?.[dayKey] || { focus: "rest", notes: "" };
              
              // Se etter kamp i matches for gjeldende lag
              const dayMatches = matches.filter((m: any) => {
                if (m.team_id && m.team_id !== selectedTeam.id) return false;
                const d = new Date(m.date);
                const dayOfWeek = (d.getDay() + 6) % 7; // 0=mandag, 6=søndag
                return dayOfWeek === index;
              });

              let focusKey = dayData.focus;
              let notes = dayData.notes;

              if (dayMatches.length > 0 && focusKey === "rest") {
                focusKey = "match";
                notes = `Kamp mot ${dayMatches[0].opponent}`;
              }

              const style = FOCUS_STYLE[focusKey] || FOCUS_STYLE.rest;
              const Icon = style.icon;

              return (
                <div key={dayKey} className="flex items-center gap-4 glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-300 group">
                  <div className="w-12 shrink-0">
                    <p className="font-heading text-lg font-bold tracking-widest text-[#F8FAFC] uppercase opacity-60 group-hover:opacity-100 transition-opacity">{dayLabel.substring(0, 3)}</p>
                  </div>
                  <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ border: `1px solid ${style.border}40`, boxShadow: `0 0 10px ${style.border}10` }}>
                    <Icon className="h-5 w-5" style={{ color: style.border }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-lg uppercase tracking-wider font-bold" style={{ color: style.border }}>{style.label}</p>
                    {notes && <p className="text-sm text-[#94A3B8] truncate mt-0.5">{notes}</p>}
                  </div>
                  {focusKey !== "rest" && focusKey !== "match" && (
                    <Link href="/dashboard/treninger/ny">
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-[#22C55E] hover:bg-[#22C55E]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Dumbbell className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
