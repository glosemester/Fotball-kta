"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const POSITION_KEYS = ["UNASSIGNED","GOALKEEPER","DEFENDER","MIDFIELDER","FORWARD"];

interface Dict {
  add_player: string; player_form_title: string; first_name: string; last_name: string;
  birth_year: string; position: string; adding: string; add_player_submit: string;
  cancel: string; error_generic: string; positions: Record<string, string>;
}

export default function LeggTilSpillerForm({ teamId, dict }: { teamId: string; dict: Dict }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthYear, setBirthYear] = useState(new Date().getFullYear() - 10);
  const [position, setPosition] = useState("UNASSIGNED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch(`/api/lag/${teamId}/spillere`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, birth_year: Number(birthYear), position }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || dict.error_generic);
      setLoading(false); return;
    }
    setFirstName(""); setLastName(""); setLoading(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {dict.add_player}
      </Button>
    );
  }

  return (
    <div className="bg-[#141D26] border border-[#2E4057] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#F8FAFC]">{dict.player_form_title}</h3>
        <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">{dict.first_name}</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">{dict.last_name}</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">{dict.birth_year}</label>
            <input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} min={2000} max={new Date().getFullYear()} required className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">{dict.position}</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-field">
              {POSITION_KEYS.map((key) => (
                <option key={key} value={key}>{dict.positions[key] ?? key}</option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3">
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? dict.adding : dict.add_player_submit}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{dict.cancel}</Button>
        </div>
      </form>
    </div>
  );
}
