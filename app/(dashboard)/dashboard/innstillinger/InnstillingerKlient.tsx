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
      <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-widest px-1">
        {dict.optional_modules}
      </p>

      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-3xl p-4 flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: isOn ? "#0A84FF/10" : "#2C2C2E" }}
        >
          <Activity className="h-5 w-5" style={{ color: isOn ? "#0A84FF" : "#8E8E93" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#FFFFFF] text-sm">{dict.wellbeing_label}</p>
          <p className="text-xs text-[#8E8E93] mt-0.5 leading-relaxed">{dict.wellbeing_desc}</p>
        </div>

        <button
          onClick={() => toggle("wellbeing")}
          disabled={isSaving}
          className={`relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
            isOn ? "bg-[#0A84FF]" : "bg-[#38383A]"
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
