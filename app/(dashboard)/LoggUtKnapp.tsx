"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LoggUtKnapp() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#1A1A2E] text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-[#F0EEFF]"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">Logg ut</span>
    </button>
  );
}
