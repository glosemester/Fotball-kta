"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Dict {
  create_button: string; form_title: string; team_name: string;
  team_name_placeholder: string; club_name: string; club_name_placeholder: string;
  age_group: string; creating: string; create_team: string; cancel: string;
  error_generic: string; age_labels: Record<string, string>;
}

const AGE_GROUP_KEYS = ["AGE_6_7","AGE_8_9","AGE_10_12","AGE_13_14","AGE_15_16","AGE_17_18"];

export default function OpprettLagForm({ dict }: { dict: Dict }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clubName, setClubName] = useState("");
  const [ageGroup, setAgeGroup] = useState("AGE_8_9");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/lag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, club_name: clubName, age_group: ageGroup }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || dict.error_generic);
      setLoading(false); return;
    }
    setName(""); setClubName(""); setLoading(false); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {dict.create_button}
      </Button>
    );
  }

  return (
    <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#FFFFFF]">{dict.form_title}</h3>
        <button onClick={() => setOpen(false)} className="text-[#8E8E93] hover:text-[#FFFFFF] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8E8E93]">{dict.team_name}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={dict.team_name_placeholder} className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8E8E93]">{dict.club_name}</label>
          <input value={clubName} onChange={(e) => setClubName(e.target.value)} required placeholder={dict.club_name_placeholder} className="input-field" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8E8E93]">{dict.age_group}</label>
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="input-field">
            {AGE_GROUP_KEYS.map((key) => (
              <option key={key} value={key}>{dict.age_labels[key] ?? key}</option>
            ))}
          </select>
        </div>
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl px-4 py-3">
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? dict.creating : dict.create_team}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{dict.cancel}</Button>
        </div>
      </form>
    </div>
  );
}
