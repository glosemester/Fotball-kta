"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function SlettSpillerKnapp({ playerId, teamId }: { playerId: string; teamId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Fjerne denne spilleren fra laget?")) return;
    await fetch(`/api/lag/${teamId}/spillere/${playerId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
