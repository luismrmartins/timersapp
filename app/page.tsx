"use client";

import { useEffect, useRef, useState } from "react";
import TimerCard from "./components/TimerCard";
import AddTimerModal from "./components/AddTimerModal";
import type { Timer } from "./types";

const STORAGE_KEY = "timers:v1";

function loadTimers(): Timer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Timer[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Page() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setTimers(loadTimers());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {
      // ignore quota/serialization errors
    }
  }, [timers, hydrated]);

  const timersRef = useRef(timers);
  timersRef.current = timers;

  useEffect(() => {
    const hasRunning = timers.some((t) => t.status === "running");
    if (!hasRunning) return;
    const interval = window.setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          const next = t.remaining - 1;
          if (next <= 0) {
            return { ...t, remaining: 0, status: "finished" };
          }
          return { ...t, remaining: next };
        }),
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timers]);

  const addTimer = ({
    name,
    description,
    duration,
  }: {
    name: string;
    description: string;
    duration: number;
  }) => {
    const newTimer: Timer = {
      id: makeId(),
      name,
      description: description || undefined,
      duration,
      remaining: duration,
      status: "idle",
    };
    setTimers((prev) => [newTimer, ...prev]);
    setModalOpen(false);
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "finished") return t;
        if (t.status === "running") return { ...t, status: "paused" };
        return { ...t, status: "running" };
      }),
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remaining: t.duration, status: "idle" } : t,
      ),
    );
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-300 bg-neutral-100 px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold uppercase tracking-widest text-neutral-900 dark:text-neutral-100">
              Timers
            </h1>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {hydrated
                ? `${timers.length} timer${timers.length === 1 ? "" : "s"}`
                : " "}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wider text-neutral-50 hover:bg-neutral-700 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            + Add Timer
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {hydrated && timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 px-6 py-20 text-center text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            <div className="text-sm uppercase tracking-wider">No timers yet</div>
            <div className="mt-2 text-xs">
              Click &quot;Add Timer&quot; to create one.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onDelete={deleteTimer}
              />
            ))}
          </div>
        )}
      </main>

      <AddTimerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addTimer}
      />
    </div>
  );
}
