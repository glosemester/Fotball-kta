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
      className="flex items-center gap-1.5 text-[#4E5A72] hover:text-white text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.05]"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">Logg ut</span>
    </button>
  );
}
