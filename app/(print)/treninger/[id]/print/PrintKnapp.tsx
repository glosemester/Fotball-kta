"use client";

import { Printer } from "lucide-react";

export default function PrintKnapp() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg bg-black text-white text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Skriv ut / Lagre PDF
    </button>
  );
}
