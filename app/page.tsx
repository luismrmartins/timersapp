"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TimerCard from "./components/TimerCard";
import AddTimerModal from "./components/AddTimerModal";
import ThemeToggle from "./components/ThemeToggle";
import NotificationsButton from "./components/NotificationsButton";
import {
  playChime,
  sendBrowserNotification,
  unlockAudio,
} from "./lib/notifications";
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
  const [unseenFinished, setUnseenFinished] = useState(0);
  const prevTimersRef = useRef<Timer[]>([]);
  const baseTitleRef = useRef<string>("");

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!baseTitleRef.current) baseTitleRef.current = document.title;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base =
      baseTitleRef.current || "Timer Tempo - Run Multiple Timers at Once";
    document.title = unseenFinished > 0 ? `(${unseenFinished}) ${base}` : base;
  }, [unseenFinished]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (!document.hidden) setUnseenFinished(0);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", () => setUnseenFinished(0));
    return () => {
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      prevTimersRef.current = timers;
      return;
    }
    const prev = prevTimersRef.current;
    const justFinished: Timer[] = [];
    for (const t of timers) {
      if (t.status !== "finished") continue;
      const before = prev.find((p) => p.id === t.id);
      if (before && before.status !== "finished") {
        justFinished.push(t);
      }
    }
    if (justFinished.length > 0) {
      const hidden =
        typeof document !== "undefined" && document.hidden;
      for (const t of justFinished) {
        playChime();
        sendBrowserNotification("Timer finished", t.name, t.id);
      }
      if (hidden) {
        setUnseenFinished((c) => c + justFinished.length);
      }

      const chainTargets = justFinished
        .map((t) => t.nextId)
        .filter((id): id is string => !!id);
      if (chainTargets.length > 0) {
        const targets = new Set(chainTargets);
        setTimers((curr) => {
          const now = Date.now();
          return curr.map((tt) =>
            targets.has(tt.id)
              ? {
                  ...tt,
                  remaining: tt.duration,
                  status: "running" as const,
                  endsAt: now + tt.duration * 1000,
                }
              : tt,
          );
        });
      }
    }
    prevTimersRef.current = timers;
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
    nextId,
  }: {
    name: string;
    description: string;
    duration: number;
    nextId: string | null;
  }) => {
    const newTimer: Timer = {
      id: makeId(),
      name,
      description: description || undefined,
      duration,
      remaining: duration,
      status: "idle",
      endsAt: null,
      nextId: nextId ?? null,
    };
    setTimers((prev) => [newTimer, ...prev]);
    setModalOpen(false);
  };

  const setNextTimer = (id: string, nextId: string | null) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, nextId } : t)),
    );
  };

  const toggleTimer = (id: string) => {
    unlockAudio();
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
    setTimers((prev) =>
      prev
        .filter((t) => t.id !== id)
        .map((t) => (t.nextId === id ? { ...t, nextId: null } : t)),
    );
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 p-8">
        <header className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-normal text-[var(--fg)]">
              <Image
                src="/Tempo.png"
                alt="Timer Tempo"
                width={120}
                height={39}
                priority
                className="dark:invert dark:brightness-[1.35]"
              />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsButton />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-[var(--fg)] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--bg)] hover:opacity-90"
            >
              + Add Timer
            </button>
          </div>
        </header>

        {/* AD SLOT */}
        <div className="mb-12 flex items-center justify-center border border-dashed border-[var(--fg)]/20 px-6 py-6 text-xs uppercase tracking-widest text-[var(--fg)]/50">
          Advertisement
        </div>

        <div className="mb-4 text-xs uppercase tracking-widest text-[var(--fg)]/50">
          {hydrated
            ? `${timers.length} timer${timers.length === 1 ? "" : "s"}`
            : ""}
        </div>

        {hydrated && timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[var(--fg)]/20 px-6 py-20 text-center">
            <div className="text-sm text-[var(--fg)]/70">No timers yet</div>
            <div className="mt-2 text-xs text-[var(--fg)]/50">
              Click &quot;+ Add Timer&quot; to create one.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                others={timers
                  .filter((t) => t.id !== timer.id)
                  .map((t) => ({ id: t.id, name: t.name }))}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onDelete={deleteTimer}
                onSetNext={setNextTimer}
              />
            ))}
          </div>
        )}

        {/* AD SLOT */}
        <div className="mt-12 flex items-center justify-center border border-dashed border-[var(--fg)]/20 px-6 py-6 text-xs uppercase tracking-widest text-[var(--fg)]/50">
          Advertisement
        </div>

        <footer className="mt-16">
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-[var(--fg)]/70">
            <p>
              Tempo lets you run multiple timers at the same time, each with
              its own name and description. Start one for the pasta, another
              for the sauce, another for the oven - they all run independently,
              and they all stay on screen.
            </p>
            <p>
              Most timer apps give you one timer. That works until it
              doesn&apos;t. Timer Tempo was built for the moments when you have
              more than one thing going at once - cooking a full meal, running
              intervals at the gym, managing time blocks at work, keeping a
              meeting on track. Name each timer, add a note if you need it,
              and start them whenever you&apos;re ready.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-dotted border-[var(--fg)]/20 pt-6 text-xs text-[var(--fg)]/50">
            <a href="#" className="hover:text-[var(--fg)]">
              FAQ
            </a>
            <a href="/privacy" className="hover:text-[var(--fg)]">
              Privacy
            </a>
            <a
              href="mailto:timertempoapp@gmail.com"
              className="hover:text-[var(--fg)]"
            >
              Contact
            </a>
          </div>
        </footer>
      </main>

      <AddTimerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addTimer}
        existingTimers={timers.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
