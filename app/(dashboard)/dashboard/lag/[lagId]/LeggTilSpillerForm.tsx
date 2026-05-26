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
    <div className="bg-[#141929] border border-white/[0.07] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Ny spiller</h3>
        <button onClick={() => setOpen(false)} className="text-[#4E5A72] hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Fornavn</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-dark" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Etternavn</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-dark" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Fødselsår</label>
            <input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} min={2000} max={new Date().getFullYear()} required className="input-dark" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Posisjon</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-dark">
              {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
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
