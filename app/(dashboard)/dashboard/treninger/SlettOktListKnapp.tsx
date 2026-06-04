"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function SlettOktListKnapp({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function slett(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await fetch(`/api/treninger/${id}`, { method: "DELETE" });
    setConfirm(false);
    setLoading(false);
    router.refresh();
  }

  function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirm(true);
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirm(false);
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={slett} disabled={loading} className="px-2 py-1 bg-[#EF4444] text-white text-xs rounded hover:bg-[#DC2626]">
          {loading ? "..." : "Slett"}
        </button>
        <button onClick={handleCancel} disabled={loading} className="px-2 py-1 bg-[#2C2C2E] text-[#8E8E93] text-xs rounded hover:bg-[#38383A]">
          X
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleConfirm} 
      className="p-1.5 text-[#8E8E93] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
      title="Slett økt"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
