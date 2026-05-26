"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const POSITIONS = [
  { value: "UNASSIGNED", label: "Ikke satt" },
  { value: "GOALKEEPER", label: "Keeper" },
  { value: "DEFENDER", label: "Forsvarer" },
  { value: "MIDFIELDER", label: "Midtbane" },
  { value: "FORWARD", label: "Angriper" },
];

export default function LeggTilSpillerForm({ teamId }: { teamId: string }) {
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
    setLoading(true);
    setError("");

    const res = await fetch(`/api/lag/${teamId}/spillere`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, birth_year: Number(birthYear), position }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Noe gikk galt");
      setLoading(false);
      return;
    }

    setFirstName(""); setLastName(""); setLoading(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Legg til spiller
      </Button>
    );
  }

  return (
    <div className="bg-white border border-[#E4E2F5] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1A1A2E]">Ny spiller</h3>
        <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#1A1A2E] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#64748B]">Fornavn</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#64748B]">Etternavn</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#64748B]">Fødselsår</label>
            <input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} min={2000} max={new Date().getFullYear()} required className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#64748B]">Posisjon</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-field">
              {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        {error && (
          <div className="bg-[#DC2626]/8 border border-[#DC2626]/15 rounded-xl px-4 py-3">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Legger til..." : "Legg til"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
        </div>
      </form>
    </div>
  );
}
