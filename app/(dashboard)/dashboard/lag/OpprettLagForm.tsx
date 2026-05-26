"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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

    setName("");
    setClubName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-green-700 hover:bg-green-800">
        <Plus className="h-4 w-4 mr-2" />
        Opprett nytt lag
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nytt lag</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Lagnavn</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="f.eks. Gutter 2017"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Klubbnavn</label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
              placeholder="f.eks. Rosenborg BK"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Aldersgruppe</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {AGE_GROUPS.map((ag) => (
                <option key={ag.value} value={ag.value}>{ag.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800">
              {loading ? "Oppretter..." : "Opprett lag"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
