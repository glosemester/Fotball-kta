"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SlettTreningKnapp({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function slett() {
    setLoading(true);
    await fetch(`/api/treninger/${id}`, { method: "DELETE" });
    router.push("/dashboard/treninger");
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#94A3B8]">Er du sikker?</span>
        <Button onClick={slett} disabled={loading} size="sm" className="bg-[#EF4444] hover:bg-[#DC2626] text-white border-0">
          {loading ? "Sletter..." : "Ja, slett"}
        </Button>
        <Button onClick={() => setConfirm(false)} variant="outline" size="sm">Avbryt</Button>
      </div>
    );
  }

  return (
    <Button onClick={() => setConfirm(true)} variant="outline" size="sm" className="text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10">
      <Trash2 className="h-4 w-4" />
      Slett økt
    </Button>
  );
}
