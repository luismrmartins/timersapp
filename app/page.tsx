"use client";

import { useEffect, useState } from "react";
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
    const now = Date.now();
    const loaded = loadTimers().map((t) => {
      if (t.status === "running" && t.endsAt != null) {
        const ms = t.endsAt - now;
        if (ms <= 0) {
          return { ...t, remaining: 0, status: "finished" as const, endsAt: null };
        }
        return { ...t, remaining: Math.ceil(ms / 1000) };
      }
      return t;
    });
    setTimers(loaded);
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

  const anyRunning = timers.some((t) => t.status === "running");

  useEffect(() => {
    if (!anyRunning) return;

    const tick = () => {
      const now = Date.now();
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running" || t.endsAt == null) return t;
          const ms = t.endsAt - now;
          if (ms <= 0) {
            return { ...t, remaining: 0, status: "finished" as const, endsAt: null };
          }
          const remaining = Math.ceil(ms / 1000);
          if (remaining === t.remaining) return t;
          return { ...t, remaining };
        }),
      );
    };

    const interval = window.setInterval(tick, 250);
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [anyRunning]);

  useEffect(() => {
    if (!anyRunning) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          sentinel = null;
        });
      } catch {
        // permission denied / unsupported — silently no-op
      }
    };

    const onVisibility = () => {
      if (!document.hidden && sentinel == null) acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [anyRunning]);

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
      endsAt: null,
    };
    setTimers((prev) => [newTimer, ...prev]);
    setModalOpen(false);
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "finished") return t;
        if (t.status === "running") {
          const now = Date.now();
          const remaining =
            t.endsAt != null
              ? Math.max(0, Math.ceil((t.endsAt - now) / 1000))
              : t.remaining;
          return { ...t, status: "paused", remaining, endsAt: null };
        }
        return {
          ...t,
          status: "running",
          endsAt: Date.now() + t.remaining * 1000,
        };
      }),
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remaining: t.duration, status: "idle", endsAt: null }
          : t,
      ),
    );
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col bg-[#FAFAF8] font-mono text-[#111111]">
      <main className="mx-auto w-full max-w-5xl flex-1 p-8">
        <header className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-normal text-[#111111]">Timer Tempo</h1>
            <p className="mt-1 text-xs text-[#999999]">
              {hydrated
                ? `${timers.length} timer${timers.length === 1 ? "" : "s"}`
                : " "}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#111111] px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-black"
          >
            + Add Timer
          </button>
        </header>

        {/* AD SLOT */}
        <div className="mb-12 flex items-center justify-center border border-dashed border-[#DDDDDD] px-6 py-6 text-xs uppercase tracking-widest text-[#999999]">
          Advertisement
        </div>

        {hydrated && timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#DDDDDD] px-6 py-20 text-center">
            <div className="text-sm text-[#666666]">No timers yet</div>
            <div className="mt-2 text-xs text-[#999999]">
              Click &quot;+ Add Timer&quot; to create one.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* AD SLOT */}
        <div className="mt-12 flex items-center justify-center border border-dashed border-[#DDDDDD] px-6 py-6 text-xs uppercase tracking-widest text-[#999999]">
          Advertisement
        </div>

        <footer className="mt-16 text-xs text-[#999999]">
          <a href="#" className="hover:text-[#666666]">
            FAQ
          </a>{" "}
          <a href="/privacy" className="hover:text-[#666666]">
            Privacy
          </a>{" "}
          <a href="#" className="hover:text-[#666666]">
            Contact
          </a>
        </footer>
      </main>

      <AddTimerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addTimer}
      />
    </div>
  );
}
