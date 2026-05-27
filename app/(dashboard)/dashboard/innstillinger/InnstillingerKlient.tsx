"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

interface Props {
  features: string[];
  dict: { optional_modules: string; wellbeing_label: string; wellbeing_desc: string };
}

export default function InnstillingerKlient({ features, dict }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState({ wellbeing: features.includes("wellbeing") });
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(key: string) {
    setSaving(key);
    const next = !enabled[key as keyof typeof enabled];
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

  const isOn = enabled.wellbeing;
  const isSaving = saving === "wellbeing";

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest px-1">
        {dict.optional_modules}
      </p>

      <div className="bg-white border border-[#E4E2F5] rounded-2xl p-4 flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: isOn ? "#F0FDF4" : "#F8FAFC" }}
        >
          <Activity className="h-5 w-5" style={{ color: isOn ? "#16A34A" : "#94A3B8" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A2E] text-sm">{dict.wellbeing_label}</p>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{dict.wellbeing_desc}</p>
        </div>

        <button
          onClick={() => toggle("wellbeing")}
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
    </div>
  );
}
