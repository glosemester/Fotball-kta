"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "nb", label: "Norsk" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "en", label: "English" },
] as const;

export default function LangSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);

  async function select(code: string) {
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: code }),
    });
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 bg-white border border-[#E4E2F5] rounded-xl shadow-lg overflow-hidden min-w-[130px]">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => select(code)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F5F3FF] ${
                  current === code
                    ? "font-semibold text-[#6D28D9]"
                    : "text-[#1A1A2E]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
