"use client";

import type { Timer } from "../types";

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

type Props = {
  timer: Timer;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TimerCard({ timer, onToggle, onReset, onDelete }: Props) {
  const isFinished = timer.status === "finished";
  const isRunning = timer.status === "running";

  return (
    <div
      className={[
        "flex flex-col gap-4 border p-5 transition-colors",
        isFinished
          ? "border-neutral-400 bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-800"
          : "border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
            {timer.name}
          </div>
          {timer.description && (
            <div className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
              {timer.description}
            </div>
          )}
        </div>
        <span
          className={[
            "shrink-0 border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
            isFinished
              ? "border-neutral-700 text-neutral-900 dark:border-neutral-300 dark:text-neutral-100"
              : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400",
          ].join(" ")}
        >
          {timer.status}
        </span>
      </div>

      <div
        className={[
          "tabular-nums text-center text-4xl font-medium",
          isFinished
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-800 dark:text-neutral-200",
        ].join(" ")}
      >
        {formatTime(timer.remaining)}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggle(timer.id)}
          disabled={isFinished}
          className="flex-1 border border-neutral-400 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-800 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {isRunning ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => onReset(timer.id)}
          className="flex-1 border border-neutral-400 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-800 transition-colors hover:bg-neutral-200 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onDelete(timer.id)}
          className="flex-1 border border-neutral-400 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-300 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
