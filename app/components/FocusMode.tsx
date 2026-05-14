"use client";

import { useEffect } from "react";
import Icon from "./Icon";
import type { Timer } from "../types";

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

type Props = {
  timer: Timer;
  nextName: string | null;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onExit: () => void;
};

const controlBtn =
  "inline-flex items-center justify-center p-3 text-[var(--fg)]/70 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

export default function FocusMode({
  timer,
  nextName,
  onToggle,
  onReset,
  onExit,
}: Props) {
  const isFinished = timer.status === "finished";
  const isRunning = timer.status === "running";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <div className="flex items-center p-6">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit focus mode"
          className="inline-flex items-center gap-2 p-1.5 text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--fg)]"
        >
          <Icon name="fullscreen_exit" />
          Exit
        </button>
      </div>

      <div className="flex flex-1 flex-col items-start justify-center gap-10 px-6 pb-24">
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/50">
            {timer.mode === "stopwatch" ? "Stopwatch" : "Timer"}
          </span>
          <h2 className="text-xl font-medium uppercase tracking-wide sm:text-2xl">
            {timer.name}
          </h2>
          {timer.description && (
            <p className="max-w-md text-sm leading-relaxed text-[var(--fg)]/50">
              {timer.description}
            </p>
          )}
        </div>

        <div className="tabular-nums text-[clamp(2.5rem,14vw,10rem)] leading-none tracking-tight">
          {formatTime(timer.remaining)}
        </div>

        {isFinished && (
          <span className="bg-[var(--fg)] px-2 py-1 text-xs uppercase tracking-widest text-[var(--bg)]">
            Finished
          </span>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggle(timer.id)}
            disabled={isFinished}
            aria-label={isRunning ? "Pause" : "Start"}
            className={controlBtn}
          >
            <Icon
              name={isRunning ? "pause" : "play_arrow"}
              className="text-4xl"
            />
          </button>
          <button
            type="button"
            onClick={() => onReset(timer.id)}
            aria-label="Reset"
            className={controlBtn}
          >
            <Icon name="refresh" className="text-4xl" />
          </button>
        </div>

        {nextName && (
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--fg)]/50">
            <Icon name="arrow_forward" />
            <span>Next: {nextName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
