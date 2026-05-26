"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

const OPTIONAL_FEATURES: {
  key: string;
  label: string;
  description: string;
  icon: typeof Activity;
  color: string;
  bg: string;
}[] = [
  {
    key: "wellbeing",
    label: "Velvære",
    description:
      "La spillere og foreldre registrere ukentlig velvære (Grønn/Gul/Rød). Vises i menyen og gir deg varsler før trening.",
    icon: Activity,
    color: "#16A34A",
    bg: "#F0FDF4",
  },
];

export default function InnstillingerKlient({ features }: { features: string[] }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(OPTIONAL_FEATURES.map((f) => [f.key, features.includes(f.key)]))
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(key: string) {
    setSaving(key);
    const next = !enabled[key];
    const res = await fetch("/api/innstillinger", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: key, enabled: next }),
    });
    if (res.ok) {
      setEnabled((prev) => ({ ...prev, [key]: next }));
      router.refresh();
    }
    setSaving(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
        Valgfrie moduler
      </p>

      {OPTIONAL_FEATURES.map(({ key, label, description, icon: Icon, color, bg }) => {
        const isOn = enabled[key];
        const isSaving = saving === key;

        return (
          <div
            key={key}
            className="bg-white border border-[#E4E2F5] rounded-2xl p-4 flex items-start gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: isOn ? bg : "#F8FAFC" }}
            >
              <Icon className="h-5 w-5" style={{ color: isOn ? color : "#94A3B8" }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1A1A2E] text-sm">{label}</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{description}</p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggle(key)}
              disabled={isSaving}
              className={`relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                isOn ? "bg-[#16A34A]" : "bg-[#E4E2F5]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
