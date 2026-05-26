"use client";

import { useState } from "react";
import type { WellbeingStatus, WellbeingSymptom } from "@/types";
import { Button } from "@/components/ui/button";

interface WellbeingSelectorProps {
  playerId: string;
  playerName: string;
  onSubmit: (status: WellbeingStatus, symptoms: WellbeingSymptom[], note?: string) => Promise<void>;
}

const SYMPTOMS: { key: WellbeingSymptom; label: string; forStatus: WellbeingStatus[] }[] = [
  { key: "general_fatigue", label: "Generell tretthet / lite energi", forStatus: ["yellow", "red"] },
  { key: "muscle_soreness", label: "Stivhet og ømhet i muskler", forStatus: ["yellow", "red"] },
  { key: "growing_pains", label: "Vokseverk i bein og ledd", forStatus: ["yellow", "red"] },
  { key: "schlatter", label: "Murring/smerte foran på kneet (Schlatter)", forStatus: ["red"] },
  { key: "severs", label: "Smerte bak på hælen (Severs)", forStatus: ["red"] },
  { key: "sleep_issues", label: "Dårlig søvn siste natt(er)", forStatus: ["yellow"] },
  { key: "low_motivation", label: "Lite motivasjon / tung å dra seg til trening", forStatus: ["yellow"] },
];

const STATUS_OPTIONS: { status: WellbeingStatus; emoji: string; label: string; description: string; bg: string; border: string; selected: string }[] = [
  {
    status: "green",
    emoji: "🟢",
    label: "Overskudd",
    description: "God søvn, energi og motivasjon. Klar for full trening!",
    bg: "bg-green-50",
    border: "border-green-200",
    selected: "border-green-600 bg-green-100 ring-2 ring-green-400",
  },
  {
    status: "yellow",
    emoji: "🟡",
    label: "Sliten / Vokseverk",
    description: "Litt sliten, stiv eller vokseverk. Kan trene, men kanskje ikke 100%.",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    selected: "border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400",
  },
  {
    status: "red",
    emoji: "🔴",
    label: "Smerte",
    description: "Har vondt et sted. Skal ikke presse seg. Treneren varsles.",
    bg: "bg-red-50",
    border: "border-red-200",
    selected: "border-red-600 bg-red-100 ring-2 ring-red-400",
  },
];

export function WellbeingSelector({ playerId, playerName, onSubmit }: WellbeingSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState<WellbeingStatus | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<WellbeingSymptom[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visibleSymptoms = selectedStatus
    ? SYMPTOMS.filter((s) => s.forStatus.includes(selectedStatus))
    : [];

  function toggleSymptom(symptom: WellbeingSymptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleSubmit() {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedStatus, selectedSymptoms, note || undefined);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-green-800">Registrert! Takk, {playerName.split(" ")[0]}.</p>
        <p className="text-sm text-green-700 mt-1">Treneren har blitt varslet hvis det trengs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Hvordan har <span className="text-green-700">{playerName}</span> det denne uken?
        </h3>
        <p className="text-sm text-gray-500">Velg det som passer best. Ingen riktige eller gale svar.</p>
      </div>

      <div className="grid gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.status}
            onClick={() => {
              setSelectedStatus(opt.status);
              setSelectedSymptoms([]);
            }}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selectedStatus === opt.status ? opt.selected : `${opt.bg} ${opt.border} hover:border-gray-400`
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-600">{opt.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {visibleSymptoms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Huk av det som gjelder (valgfritt):</p>
          {visibleSymptoms.map((symptom) => (
            <label
              key={symptom.key}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom.key)}
                onChange={() => toggleSymptom(symptom.key)}
                className="h-4 w-4 rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">{symptom.label}</span>
            </label>
          ))}
        </div>
      )}

      {selectedStatus && selectedStatus !== "green" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ekstra informasjon til treneren (valgfritt):
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="F.eks: 'Har hatt vondt i kneet siden i går etter løpetur'"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedStatus || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Sender..." : "Registrer velvære"}
      </Button>
    </div>
  );
}
