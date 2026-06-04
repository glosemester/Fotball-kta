"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dictionary keys required for this component.
 *
 * The parent server page must pass these under the `dict` prop.
 * Expected shape (from `dict.training.status_button`):
 *   - start:       label for DRAFT → ACTIVE   (e.g. "Start økt")
 *   - complete:    label for ACTIVE → COMPLETED (e.g. "Merk som gjennomført")
 *   - reopen:      label for COMPLETED → DRAFT  (e.g. "Gjenåpne")
 *   - saving:      loading label                 (e.g. "Lagrer…")
 */
interface StatusButtonDict {
  start: string;
  complete: string;
  reopen: string;
  saving: string;
}

interface Props {
  id: string;
  currentStatus: string;
  dict?: StatusButtonDict;
}

const FALLBACK_DICT: StatusButtonDict = {
  start: "Start økt",
  complete: "Merk som gjennomført",
  reopen: "Gjenåpne",
  saving: "Lagrer…",
};

const TRANSITIONS: Record<string, { nextStatus: string; dictKey: keyof StatusButtonDict }> = {
  DRAFT:     { nextStatus: "ACTIVE",    dictKey: "start" },
  ACTIVE:    { nextStatus: "COMPLETED", dictKey: "complete" },
  COMPLETED: { nextStatus: "DRAFT",     dictKey: "reopen" },
};

const ICONS: Record<string, typeof Play> = {
  DRAFT: Play,
  ACTIVE: CheckCircle2,
  COMPLETED: RotateCcw,
};

export default function TreningStatusKnapp({ id, currentStatus, dict }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const t = dict ?? FALLBACK_DICT;
  const transition = TRANSITIONS[currentStatus];

  // Unknown status — don't render anything
  if (!transition) return null;

  const Icon = ICONS[currentStatus] ?? Play;
  const label = t[transition.dictKey];
  const isRevert = currentStatus === "COMPLETED";

  async function handleClick() {
    setLoading(true);
    try {
      await fetch(`/api/treninger/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: transition.nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  // Revert action: smaller, muted styling (secondary feel)
  if (isRevert) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#FFFFFF] transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {loading ? t.saving : label}
      </button>
    );
  }

  // Primary actions: DRAFT→ACTIVE (green accent) and ACTIVE→COMPLETED (green accent)
  const isPrimary = currentStatus === "ACTIVE";

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isPrimary ? "default" : "outline"}
      size="sm"
      className={
        isPrimary
          ? "gap-2 bg-[#0A84FF] hover:bg-[#007AFF] text-white font-semibold"
          : "gap-2 border-[#0A84FF]/40 text-[#0A84FF] hover:bg-[#0A84FF]/10"
      }
    >
      <Icon className="h-4 w-4" />
      {loading ? t.saving : label}
    </Button>
  );
}
