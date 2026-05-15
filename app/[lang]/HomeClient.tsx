"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import TimerCard from "../components/TimerCard";
import CarouselView from "../components/CarouselView";
import AddTimerModal from "../components/AddTimerModal";
import LibraryModal from "../components/LibraryModal";
import FocusMode from "../components/FocusMode";
import ThemeToggle from "../components/ThemeToggle";
import NotificationsButton from "../components/NotificationsButton";
import LangSwitcher from "../components/LangSwitcher";
import Icon from "../components/Icon";
import {
  playChime,
  sendBrowserNotification,
  unlockAudio,
} from "../lib/notifications";
import { decodeShare, stepsToTimers } from "../lib/share";
import { nextOccurrence } from "../lib/alarm";
import { useDict, useLocale } from "../i18n/I18nProvider";
import { fmt, plural } from "../i18n/fmt";
import type {
  SavedTimer,
  Sequence,
  SequenceStep,
  Timer,
  TimerMode,
} from "../types";

const STORAGE_KEY = "timers:v1";
const SEQ_STORAGE_KEY = "sequences:v1";
const SAVED_STORAGE_KEY = "savedTimers:v1";
const VIEW_STORAGE_KEY = "viewMode:v1";

type ViewMode = "grid" | "single";

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

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

function loadSequences(): Sequence[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEQ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Sequence[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function loadSavedTimers(): SavedTimer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTimer[];
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

function formatRemaining(t: Timer): string {
  let total: number;
  if (t.mode === "alarm") {
    total = (t.alarmHour ?? 0) * 3600 + (t.alarmMinute ?? 0) * 60;
  } else {
    total = t.remaining;
  }
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function PipContent({
  timers,
  noRunningLabel,
}: {
  timers: Timer[];
  noRunningLabel: string;
}) {
  const running = timers.filter((t) => t.status === "running");
  return (
    <div
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "#0a0a0a",
        color: "#fafafa",
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
        margin: 0,
      }}
    >
      {running.length === 0 ? (
        <span style={{ opacity: 0.5, fontSize: "12px" }}>
          {noRunningLabel}
        </span>
      ) : (
        running.map((t) => {
          const warn =
            t.mode !== "stopwatch" && t.remaining > 0 && t.remaining <= 10;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  opacity: 0.6,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {t.name}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontVariantNumeric: "tabular-nums",
                  color: warn ? "#f87171" : "#fafafa",
                }}
              >
                {formatRemaining(t)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function HomeClient() {
  const dict = useDict();
  const locale = useLocale();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [unseenFinished, setUnseenFinished] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipSupported] = useState(
    () => typeof window !== "undefined" && "documentPictureInPicture" in window,
  );
  const prevTimersRef = useRef<Timer[]>([]);
  const baseTitleRef = useRef<string>("");

  useEffect(() => {
    const now = Date.now();
    const loaded = loadTimers().map((t) => {
      if (t.status !== "running") return t;
      if (t.mode === "stopwatch") {
        if (t.startedAt == null) return t;
        return { ...t, remaining: Math.floor((now - t.startedAt) / 1000) };
      }
      if (t.endsAt == null) return t;
      const ms = t.endsAt - now;
      if (ms <= 0) {
        return { ...t, remaining: 0, status: "finished" as const, endsAt: null };
      }
      return { ...t, remaining: Math.ceil(ms / 1000) };
    });
    setTimers(loaded);
    setSequences(loadSequences());
    setSavedTimers(loadSavedTimers());
    try {
      const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (v === "grid" || v === "single") setViewMode(v);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {
      // ignore quota/serialization errors
    }
  }, [timers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        SEQ_STORAGE_KEY,
        JSON.stringify(sequences),
      );
    } catch {
      // ignore quota/serialization errors
    }
  }, [sequences, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        SAVED_STORAGE_KEY,
        JSON.stringify(savedTimers),
      );
    } catch {
      // ignore quota/serialization errors
    }
  }, [savedTimers, hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFsChange = () => {
      if (!document.fullscreenElement) setFocusedId(null);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (focusedId && !timers.some((t) => t.id === focusedId)) {
      setFocusedId(null);
    }
  }, [focusedId, timers]);

  // Incoming shared link: decode ?s=, offer to add, then strip the param.
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get("s");
    if (!shareParam) return;
    params.delete("s");
    window.history.replaceState(
      null,
      "",
      window.location.pathname +
        (params.toString() ? `?${params}` : "") +
        window.location.hash,
    );
    const steps = decodeShare(shareParam);
    if (!steps) return;
    const count = steps.length;
    if (
      !window.confirm(
        plural(
          count,
          dict.board.confirmAddSharedOne,
          dict.board.confirmAddSharedOther,
        ),
      )
    ) {
      return;
    }
    const added = stepsToTimers(steps, makeId);
    setTimers((prev) => [...prev, ...added]);
    if (added[0]) setScrollToId(added[0].id);
  }, [hydrated]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    const onVisible = () => {
      if (!document.hidden) unlockAudio();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!scrollToId) return;
    const el = document.getElementById(`timer-${scrollToId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollToId(null);
  }, [scrollToId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!baseTitleRef.current) baseTitleRef.current = document.title;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = dict.meta.title;
    document.title = unseenFinished > 0 ? `(${unseenFinished}) ${base}` : base;
    baseTitleRef.current = base;
  }, [unseenFinished, dict]);

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
        sendBrowserNotification(dict.notification.timerFinished, t.name, t.id);
      }
      if (hidden) {
        setUnseenFinished((c) => c + justFinished.length);
      }

      const chainTargetIds = justFinished
        .map((t) => t.nextId)
        .filter((id): id is string => !!id);
      if (chainTargetIds.length > 0) {
        const targetSet = new Set(chainTargetIds);
        const lapsedIds = justFinished
          .map((t) => t.id)
          .filter((id) => !targetSet.has(id));

        // If the focused timer just chained, follow focus to its next.
        const focusedFinished = justFinished.find(
          (t) => t.id === focusedId,
        );
        if (
          focusedFinished?.nextId &&
          timers.some((t) => t.id === focusedFinished.nextId)
        ) {
          setFocusedId(focusedFinished.nextId);
        }

        setTimers((curr) => {
          const now = Date.now();
          const updated = curr.map((tt) =>
            targetSet.has(tt.id)
              ? {
                  ...tt,
                  remaining: tt.duration,
                  status: "running" as const,
                  endsAt: now + tt.duration * 1000,
                  startedAt: null,
                }
              : tt,
          );
          const byId = new Map(updated.map((t) => [t.id, t]));
          const fronts = chainTargetIds
            .map((id) => byId.get(id))
            .filter((t): t is Timer => !!t);
          const backs = lapsedIds
            .map((id) => byId.get(id))
            .filter((t): t is Timer => !!t);
          const handled = new Set<string>([...chainTargetIds, ...lapsedIds]);
          const middle = updated.filter((t) => !handled.has(t.id));
          return [...fronts, ...middle, ...backs];
        });
      }
    }
    prevTimersRef.current = timers;
  }, [timers, hydrated, focusedId]);

  const anyRunning = timers.some((t) => t.status === "running");
  const anyInWarning = timers.some(
    (t) =>
      t.status === "running" &&
      t.mode !== "stopwatch" &&
      t.remaining > 0 &&
      t.remaining <= 10,
  );
  const totalSeconds = timers.reduce(
    (sum, t) =>
      sum +
      (t.mode === "stopwatch" || t.mode === "alarm" ? 0 : t.remaining),
    0,
  );

  // Running countdowns sort to the top by who finishes first; everything
  // else keeps its order (Array.prototype.sort is stable).
  const finishKey = (t: Timer) =>
    t.status === "running" && t.mode !== "stopwatch" && t.endsAt != null
      ? t.endsAt
      : Infinity;
  const displayTimers = [...timers].sort((a, b) => finishKey(a) - finishKey(b));

  useEffect(() => {
    if (!anyRunning) return;

    const tick = () => {
      const now = Date.now();
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          if (t.mode === "stopwatch") {
            if (t.startedAt == null) return t;
            const elapsed = Math.floor((now - t.startedAt) / 1000);
            if (elapsed === t.remaining) return t;
            return { ...t, remaining: elapsed };
          }
          if (t.endsAt == null) return t;
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

  // Blink the theme twice per second while any countdown is in its last 10s.
  useEffect(() => {
    if (!anyInWarning) return;
    const html = document.documentElement;
    const original = html.getAttribute("data-theme") ?? "light";
    let current = original;
    const flip = () => {
      current = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", current);
    };
    flip();
    const interval = window.setInterval(flip, 250);
    return () => {
      window.clearInterval(interval);
      html.setAttribute("data-theme", original);
    };
  }, [anyInWarning]);

  // Document Picture-in-Picture: keep a small floating timer visible
  // on top of other tabs/windows.
  useEffect(() => {
    if (!pipWindow) return;
    const onClose = () => setPipWindow(null);
    pipWindow.addEventListener("pagehide", onClose);
    return () => pipWindow.removeEventListener("pagehide", onClose);
  }, [pipWindow]);

  const openPip = async () => {
    if (typeof window === "undefined") return;
    const dpip = (
      window as unknown as {
        documentPictureInPicture?: {
          requestWindow: (opts?: {
            width?: number;
            height?: number;
          }) => Promise<Window>;
        };
      }
    ).documentPictureInPicture;
    if (!dpip) return;
    try {
      const win = await dpip.requestWindow({ width: 280, height: 220 });
      win.document.title = dict.pip.title;
      const meta = win.document.createElement("meta");
      meta.name = "color-scheme";
      meta.content = "dark";
      win.document.head.appendChild(meta);
      win.document.body.style.margin = "0";
      win.document.body.style.background = "#0a0a0a";
      setPipWindow(win);
    } catch {
      // user dismissed or unsupported
    }
  };

  const togglePip = () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    } else {
      openPip();
    }
  };

  type TimerInput = {
    name: string;
    description: string;
    duration: number;
    nextId: string | null;
    prevId: string | null;
    mode: TimerMode;
    alarmHour?: number;
    alarmMinute?: number;
  };

  const addTimer = ({
    name,
    description,
    duration,
    nextId,
    prevId,
    mode,
    alarmHour,
    alarmMinute,
  }: TimerInput) => {
    const isAlarm = mode === "alarm";
    const isStopwatch = mode === "stopwatch";
    const newTimer: Timer = {
      id: makeId(),
      name,
      description: description || undefined,
      duration: isAlarm ? 0 : duration,
      remaining: isStopwatch || isAlarm ? 0 : duration,
      status: "idle",
      endsAt: null,
      startedAt: null,
      nextId: isStopwatch || isAlarm ? null : (nextId ?? null),
      mode,
      ...(isAlarm ? { alarmHour, alarmMinute } : {}),
    };
    setTimers((prev) => {
      const next = [...prev, newTimer];
      if (!prevId) return next;
      return next.map((t) =>
        t.id === prevId ? { ...t, nextId: newTimer.id } : t,
      );
    });
    setScrollToId(newTimer.id);
    setModalOpen(false);
    setEditingId(null);
  };

  const saveTimer = (
    id: string,
    { name, description, duration, nextId, mode, alarmHour, alarmMinute }: TimerInput,
  ) => {
    const isAlarm = mode === "alarm";
    const isStopwatch = mode === "stopwatch";
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name,
              description: description || undefined,
              duration: isAlarm ? 0 : duration,
              mode,
              nextId: isStopwatch || isAlarm ? null : nextId,
              status: "idle",
              remaining: isStopwatch || isAlarm ? 0 : duration,
              endsAt: null,
              startedAt: null,
              laps: undefined,
              alarmHour: isAlarm ? alarmHour : undefined,
              alarmMinute: isAlarm ? alarmMinute : undefined,
            }
          : t,
      ),
    );
    setModalOpen(false);
    setEditingId(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const saveSequence = (name: string) => {
    const idToIndex = new Map(timers.map((t, i) => [t.id, i]));
    const steps: SequenceStep[] = timers.map((t) => ({
      name: t.name,
      description: t.description,
      duration: t.duration,
      mode: t.mode ?? "countdown",
      nextIndex:
        t.nextId != null && idToIndex.has(t.nextId)
          ? (idToIndex.get(t.nextId) as number)
          : null,
      alarmHour: t.alarmHour,
      alarmMinute: t.alarmMinute,
    }));
    setSequences((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing) {
        return prev.map((s) => (s.name === name ? { ...s, steps } : s));
      }
      return [...prev, { id: makeId(), name, steps }];
    });
  };

  const loadSequence = (id: string) => {
    const seq = sequences.find((s) => s.id === id);
    if (!seq) return;
    if (
      timers.length > 0 &&
      !window.confirm(dict.library.confirmLoad)
    ) {
      return;
    }
    const newTimers: Timer[] = seq.steps.map((step) => ({
      id: makeId(),
      name: step.name,
      description: step.description,
      duration: step.mode === "alarm" ? 0 : step.duration,
      remaining:
        step.mode === "stopwatch" || step.mode === "alarm" ? 0 : step.duration,
      status: "idle" as const,
      endsAt: null,
      startedAt: null,
      nextId: null,
      mode: step.mode,
      alarmHour: step.alarmHour,
      alarmMinute: step.alarmMinute,
    }));
    seq.steps.forEach((step, i) => {
      if (step.nextIndex != null && newTimers[step.nextIndex]) {
        newTimers[i].nextId = newTimers[step.nextIndex].id;
      }
    });
    setTimers(newTimers);
    setLibraryOpen(false);
  };

  const deleteSequence = (id: string) => {
    setSequences((prev) => prev.filter((s) => s.id !== id));
  };

  const overwriteSequence = (id: string) => {
    const target = sequences.find((s) => s.id === id);
    if (!target || timers.length === 0) return;
    if (
      !window.confirm(
        fmt(dict.library.confirmOverwrite, { name: target.name }),
      )
    ) {
      return;
    }
    const idToIndex = new Map(timers.map((t, i) => [t.id, i]));
    const steps: SequenceStep[] = timers.map((t) => ({
      name: t.name,
      description: t.description,
      duration: t.duration,
      mode: t.mode ?? "countdown",
      nextIndex:
        t.nextId != null && idToIndex.has(t.nextId)
          ? (idToIndex.get(t.nextId) as number)
          : null,
      alarmHour: t.alarmHour,
      alarmMinute: t.alarmMinute,
    }));
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, steps } : s)),
    );
  };

  const saveTimerToLibrary = (id: string) => {
    const t = timers.find((x) => x.id === id);
    if (!t) return;
    const entry: SavedTimer = {
      id: makeId(),
      name: t.name,
      description: t.description,
      duration: t.duration,
      mode: t.mode ?? "countdown",
      alarmHour: t.alarmHour,
      alarmMinute: t.alarmMinute,
    };
    setSavedTimers((prev) => {
      const existing = prev.find((s) => s.name === entry.name);
      if (existing) {
        return prev.map((s) =>
          s.name === entry.name ? { ...entry, id: s.id } : s,
        );
      }
      return [...prev, entry];
    });
  };

  const addSavedTimer = (id: string) => {
    const entry = savedTimers.find((s) => s.id === id);
    if (!entry) return;
    const newTimer: Timer = {
      id: makeId(),
      name: entry.name,
      description: entry.description || undefined,
      duration: entry.mode === "alarm" ? 0 : entry.duration,
      remaining:
        entry.mode === "stopwatch" || entry.mode === "alarm"
          ? 0
          : entry.duration,
      status: "idle",
      endsAt: null,
      startedAt: null,
      nextId: null,
      mode: entry.mode,
      alarmHour: entry.alarmHour,
      alarmMinute: entry.alarmMinute,
    };
    setTimers((prev) => [...prev, newTimer]);
    setScrollToId(newTimer.id);
    setLibraryOpen(false);
  };

  const deleteSavedTimer = (id: string) => {
    setSavedTimers((prev) => prev.filter((s) => s.id !== id));
  };

  const enterFocus = (id: string) => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    setFocusedId(id);
  };

  const exitFocus = () => {
    setFocusedId(null);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const duplicateTimer = (id: string) => {
    setTimers((prev) => {
      const source = prev.find((t) => t.id === id);
      if (!source) return prev;
      const existing = new Set(prev.map((t) => t.name));
      const match = source.name.match(/^(.*?)\s+(\d+)$/);
      const stem = match ? match[1] : source.name;
      let n = match ? parseInt(match[2], 10) + 1 : 2;
      while (existing.has(`${stem} ${n}`)) n++;
      const isStopwatch = source.mode === "stopwatch";
      const isAlarm = source.mode === "alarm";
      const copy: Timer = {
        ...source,
        id: makeId(),
        name: `${stem} ${n}`,
        status: "idle",
        remaining: isStopwatch || isAlarm ? 0 : source.duration,
        endsAt: null,
        startedAt: null,
        laps: undefined,
      };
      return [...prev, copy];
    });
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
        const now = Date.now();
        const isStopwatch = t.mode === "stopwatch";
        const isAlarm = t.mode === "alarm";
        if (t.status === "running") {
          if (isStopwatch) {
            const elapsed =
              t.startedAt != null
                ? Math.floor((now - t.startedAt) / 1000)
                : t.remaining;
            return { ...t, status: "paused", remaining: elapsed, startedAt: null };
          }
          if (isAlarm) {
            return { ...t, status: "idle", remaining: 0, endsAt: null };
          }
          const remaining =
            t.endsAt != null
              ? Math.max(0, Math.ceil((t.endsAt - now) / 1000))
              : t.remaining;
          return { ...t, status: "paused", remaining, endsAt: null };
        }
        if (isStopwatch) {
          return {
            ...t,
            status: "running",
            startedAt: now - t.remaining * 1000,
            endsAt: null,
          };
        }
        if (isAlarm) {
          const endsAt = nextOccurrence(t.alarmHour ?? 0, t.alarmMinute ?? 0, now);
          return {
            ...t,
            status: "running",
            endsAt,
            startedAt: null,
            remaining: Math.ceil((endsAt - now) / 1000),
          };
        }
        return {
          ...t,
          status: "running",
          endsAt: now + t.remaining * 1000,
          startedAt: null,
        };
      }),
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.mode === "stopwatch") {
          return {
            ...t,
            remaining: 0,
            status: "idle",
            startedAt: null,
            laps: undefined,
          };
        }
        if (t.mode === "alarm") {
          return { ...t, remaining: 0, status: "idle", endsAt: null };
        }
        return { ...t, remaining: t.duration, status: "idle", endsAt: null };
      }),
    );
  };

  const lapTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.mode !== "stopwatch") return t;
        const elapsed =
          t.status === "running" && t.startedAt != null
            ? Math.floor((Date.now() - t.startedAt) / 1000)
            : t.remaining;
        return { ...t, laps: [...(t.laps ?? []), elapsed] };
      }),
    );
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) =>
      prev
        .filter((t) => t.id !== id)
        .map((t) => (t.nextId === id ? { ...t, nextId: null } : t)),
    );
  };

  const clearAllTimers = () => {
    if (timers.length === 0) return;
    if (!window.confirm(dict.board.confirmClearAll)) return;
    setTimers([]);
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-8">
        <header className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-normal text-[var(--fg)]">
              <Image
                src="/Tempo.png"
                alt="Timer Tempo"
                width={92}
                height={30}
                priority
                className="dark:invert dark:brightness-[1.35]"
              />
            </h1>
          </div>
          <div className="flex items-center gap-1 text-lg">
            <NotificationsButton />
            <ThemeToggle />
            {pipSupported && (
              <button
                type="button"
                onClick={togglePip}
                aria-label={
                  pipWindow
                    ? dict.header.closeMiniWindow
                    : dict.header.openMiniWindow
                }
                aria-pressed={pipWindow != null}
                title={
                  pipWindow
                    ? dict.header.miniWindowOn
                    : dict.header.miniWindowHint
                }
                className={
                  "inline-flex items-center justify-center p-1.5 " +
                  (pipWindow
                    ? "text-[var(--fg)]"
                    : "text-[var(--fg)]/70 hover:text-[var(--fg)]")
                }
              >
                <Icon name="picture_in_picture_alt" />
              </button>
            )}
            <LangSwitcher />
            <button
              type="button"
              onClick={() =>
                setViewMode((v) => (v === "grid" ? "single" : "grid"))
              }
              aria-label={
                viewMode === "grid"
                  ? dict.header.viewSingle
                  : dict.header.viewGrid
              }
              title={
                viewMode === "grid"
                  ? dict.header.viewSingle
                  : dict.header.viewGrid
              }
              className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
            >
              <Icon name={viewMode === "grid" ? "view_carousel" : "grid_view"} />
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              aria-label={dict.header.sequences}
              className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
            >
              <Icon name="bookmarks" />
            </button>
            <button
              type="button"
              onClick={openCreate}
              aria-label={dict.header.addTimer}
              className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
            >
              <Icon name="add_circle" />
            </button>
          </div>
        </header>

        {/* AD SLOT */}

        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/50">
            {hydrated
              ? `${plural(
                  timers.length,
                  dict.board.timerOne,
                  dict.board.timerOther,
                )}${
                  totalSeconds > 0 ? ` · ${formatDuration(totalSeconds)}` : ""
                }`
              : ""}
          </span>
          {hydrated && timers.length > 0 && (
            <button
              type="button"
              onClick={clearAllTimers}
              className="shrink-0 text-xs uppercase tracking-widest text-[var(--fg)]/50 hover:text-[var(--fg)]"
            >
              {dict.board.clearAll}
            </button>
          )}
        </div>

        {hydrated && viewMode === "grid" && (
          <>
            {timers.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayTimers.map((timer, i) => (
                  <TimerCard
                    key={timer.id}
                    timer={timer}
                    index={i + 1}
                    others={timers
                      .filter((t) => t.id !== timer.id)
                      .map((t) => ({ id: t.id, name: t.name }))}
                    onToggle={toggleTimer}
                    onReset={resetTimer}
                    onDelete={deleteTimer}
                    onDuplicate={duplicateTimer}
                    onEdit={openEdit}
                    onFocus={enterFocus}
                    onSave={saveTimerToLibrary}
                    onLap={lapTimer}
                    onSetNext={setNextTimer}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={openCreate}
              className={
                "flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[var(--fg)]/20 px-6 text-center hover:border-[var(--fg)]/40 hover:bg-[var(--fg)]/5 " +
                (timers.length === 0 ? "py-20" : "mt-3 py-8")
              }
            >
              {timers.length === 0 ? (
                <>
                  <span className="text-sm text-[var(--fg)]/70">
                    {dict.board.noTimers}
                  </span>
                  <span className="mt-2 text-xs text-[var(--fg)]/50">
                    {dict.board.clickToAdd}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--fg)]/50">
                  <Icon name="add_circle" />
                  {dict.board.addATimer}
                </span>
              )}
            </button>
          </>
        )}

        {hydrated && viewMode === "single" && (
          <CarouselView
            timers={displayTimers}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onLap={lapTimer}
            onEdit={openEdit}
            onDuplicate={duplicateTimer}
            onDelete={deleteTimer}
            onSave={saveTimerToLibrary}
            onAdd={openCreate}
          />
        )}

        {/* AD SLOT */}

        <footer className="mt-auto pt-16">
          <div className="flex items-center justify-between border-t border-dotted border-[var(--fg)]/20 pt-6 text-xs text-[var(--fg)]/50">
            <Link
              href={`/${locale}/faq`}
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.faq}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.privacy}
            </Link>
            <a
              href="mailto:timertempoapp@gmail.com"
              className="hover:text-[var(--fg)]"
            >
              {dict.footer.contact}
            </a>
          </div>
        </footer>
      </main>

      <AddTimerModal
        open={modalOpen}
        onClose={closeModal}
        onCreate={addTimer}
        onSave={saveTimer}
        editTimer={timers.find((t) => t.id === editingId) ?? null}
        existingTimers={timers
          .filter((t) => t.id !== editingId)
          .map((t) => ({ id: t.id, name: t.name, mode: t.mode }))}
      />

      <LibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        sequences={sequences}
        savedTimers={savedTimers}
        timers={timers}
        onSaveSequence={saveSequence}
        onLoadSequence={loadSequence}
        onOverwriteSequence={overwriteSequence}
        onDeleteSequence={deleteSequence}
        onAddSavedTimer={addSavedTimer}
        onDeleteSavedTimer={deleteSavedTimer}
      />

      {focusedId && timers.some((t) => t.id === focusedId) && (
        <FocusMode
          timers={timers}
          focusedId={focusedId}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onLap={lapTimer}
          onExit={exitFocus}
        />
      )}

      {pipWindow &&
        createPortal(
          <PipContent
            timers={timers}
            noRunningLabel={dict.pip.noRunning}
          />,
          pipWindow.document.body,
        )}
    </div>
  );
}
