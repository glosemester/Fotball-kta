"use client";

import { useEffect, useMemo, useState } from "react";
import { TASKS, TOTAL_DAYS, type TaskId } from "./tasks";

type DayRecord = Partial<Record<TaskId, boolean>>;
type History = Record<string, DayRecord>;

interface StoredState {
  startDate: string;
  history: History;
}

const STORAGE_KEY = "75hard-state";

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86400000);
}

function isDayComplete(record: DayRecord | undefined): boolean {
  if (!record) return false;
  return TASKS.every((t) => record[t.id]);
}

function loadState(): StoredState {
  if (typeof window === "undefined") {
    const today = dateKey(new Date());
    return { startDate: today, history: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // ignore corrupt state
  }
  const today = dateKey(new Date());
  return { startDate: today, history: {} };
}

function saveState(state: StoredState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initializeState(): { state: StoredState; resetMessage: string | null } {
  const loaded = loadState();
  const today = new Date();
  const start = new Date(loaded.startDate);

  let failedOnDay: number | null = null;
  const checkedUntil = daysBetween(start, today);
  for (let offset = 0; offset < checkedUntil; offset++) {
    const d = new Date(start);
    d.setDate(d.getDate() + offset);
    const key = dateKey(d);
    if (!isDayComplete(loaded.history[key])) {
      failedOnDay = offset + 1;
      break;
    }
  }

  if (failedOnDay !== null) {
    const fresh: StoredState = { startDate: dateKey(today), history: {} };
    saveState(fresh);
    return {
      state: fresh,
      resetMessage: `Du fullførte ikke alle oppgavene på dag ${failedOnDay}. Utfordringen er startet på nytt fra dag 1.`,
    };
  }
  return { state: loaded, resetMessage: null };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [{ state, resetMessage }, setInit] = useState<{
    state: StoredState;
    resetMessage: string | null;
  }>(() => ({
    state: { startDate: dateKey(new Date()), history: {} },
    resetMessage: null,
  }));
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Reads localStorage, unavailable during SSR, so this must run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInit(initializeState());
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = now ? dateKey(now) : null;

  const currentDay = useMemo(() => {
    if (!state || !now) return 1;
    return daysBetween(new Date(state.startDate), now) + 1;
  }, [state, now]);

  const todayRecord: DayRecord = useMemo(() => {
    if (!state || !todayKey) return {};
    return state.history[todayKey] ?? {};
  }, [state, todayKey]);

  const completedCount = TASKS.filter((t) => todayRecord[t.id]).length;
  const allDoneToday = completedCount === TASKS.length;
  const challengeDone = currentDay > TOTAL_DAYS;

  const timeLeft = useMemo(() => {
    if (!now) return "00:00:00";
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }, [now]);

  function toggleTask(id: TaskId) {
    if (!todayKey || challengeDone) return;
    const dayRecord = { ...(state.history[todayKey] ?? {}) };
    dayRecord[id] = !dayRecord[id];
    const nextState: StoredState = {
      ...state,
      history: { ...state.history, [todayKey]: dayRecord },
    };
    setInit({ state: nextState, resetMessage });
    saveState(nextState);
  }

  function restartChallenge() {
    if (!confirm("Er du sikker på at du vil starte 75 Hard på nytt fra dag 1?")) return;
    const fresh: StoredState = { startDate: dateKey(new Date()), history: {} };
    saveState(fresh);
    setInit({ state: fresh, resetMessage: null });
  }

  if (!mounted || !now) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Laster …</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">75 Hard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Ingen unnskyldninger. Hver dag teller.
          </p>
        </header>

        {resetMessage && (
          <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-sm">
            {resetMessage}
          </div>
        )}

        {challengeDone ? (
          <div className="rounded-2xl border border-[var(--accent-2)]/50 bg-[var(--accent-2)]/10 px-4 py-6 text-center">
            <p className="text-lg font-semibold">🎉 Gratulerer!</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              Du har fullført alle {TOTAL_DAYS} dager med 75 Hard.
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Dag
                </p>
                <p className="text-3xl font-bold">
                  {currentDay}
                  <span className="text-[var(--muted)] text-lg font-normal">
                    {" "}
                    / {TOTAL_DAYS}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Tid igjen i dag
                </p>
                <p className="text-2xl font-mono font-semibold tabular-nums">
                  {timeLeft}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 divide-y divide-[var(--border)]">
              {TASKS.map((task) => {
                const checked = Boolean(todayRecord[task.id]);
                return (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent-2)]"
                    />
                    <span>
                      <span
                        className={
                          "block font-medium " +
                          (checked ? "line-through text-[var(--muted)]" : "")
                        }
                      >
                        {task.label}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {task.detail}
                      </span>
                    </span>
                  </label>
                );
              })}
            </section>

            <section className="text-center text-sm text-[var(--muted)]">
              {completedCount} / {TASKS.length} oppgaver fullført i dag
              {allDoneToday && (
                <p className="text-[var(--accent-2)] font-medium mt-1">
                  Bra jobbet – dagen er i boks! ✅
                </p>
              )}
            </section>
          </>
        )}

        <button
          onClick={restartChallenge}
          className="text-xs text-[var(--muted)] underline underline-offset-2 self-center mt-2"
        >
          Start på nytt fra dag 1
        </button>
      </div>
    </main>
  );
}
