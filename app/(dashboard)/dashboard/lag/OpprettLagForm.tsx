"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const AGE_GROUPS = [
  { value: "AGE_6_7", label: "6–7 år" },
  { value: "AGE_8_9", label: "8–9 år" },
  { value: "AGE_10_12", label: "10–12 år" },
  { value: "AGE_13_14", label: "13–14 år" },
  { value: "AGE_15_16", label: "15–16 år" },
  { value: "AGE_17_18", label: "17–18 år" },
];

export default function OpprettLagForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clubName, setClubName] = useState("");
  const [ageGroup, setAgeGroup] = useState("AGE_8_9");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/lag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, club_name: clubName, age_group: ageGroup }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Noe gikk galt");
      setLoading(false);
      return;
    }

    setName(""); setClubName(""); setLoading(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Opprett nytt lag
      </Button>
    );
  }

  return (
    <div className="bg-white border border-[#E4E2F5] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1A1A2E]">Nytt lag</h3>
        <button onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#1A1A2E] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#64748B]">Lagnavn</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="f.eks. Gutter 2017" className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#64748B]">Klubbnavn</label>
          <input value={clubName} onChange={(e) => setClubName(e.target.value)} required placeholder="f.eks. Rosenborg BK" className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#64748B]">Aldersgruppe</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="input-field">
            {AGE_GROUPS.map((ag) => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
          </select>
        </div>
        {error && (
          <div className="bg-[#DC2626]/8 border border-[#DC2626]/15 rounded-xl px-4 py-3">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Oppretter..." : "Opprett lag"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Avbryt</Button>
        </div>
      </form>
    </div>
  );
}
