"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function SlettSpillerKnapp({ playerId, teamId }: { playerId: string; teamId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Fjerne denne spilleren fra laget?")) return;
    await fetch(`/api/lag/${teamId}/spillere/${playerId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-all"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
