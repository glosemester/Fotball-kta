"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TreningStatusKnapp({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markerGjennomfort() {
    setLoading(true);
    await fetch(`/api/treninger/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setLoading(false);
    router.refresh();
  }

  if (currentStatus === "COMPLETED") return null;

  return (
    <Button onClick={markerGjennomfort} disabled={loading} variant="outline" size="sm" className="gap-2">
      <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
      {loading ? "Lagrer..." : "Merk som gjennomført"}
    </Button>
  );
}
