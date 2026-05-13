"use client";

import Icon from "./Icon";
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
  others: { id: string; name: string }[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetNext: (id: string, nextId: string | null) => void;
};

const iconBtn =
  "inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

export default function TimerCard({
  timer,
  others,
  onToggle,
  onReset,
  onDelete,
  onDuplicate,
  onSetNext,
}: Props) {
  const isFinished = timer.status === "finished";
  const isRunning = timer.status === "running";
  const currentNext =
    timer.nextId && others.some((o) => o.id === timer.nextId)
      ? timer.nextId
      : "";

  return (
    <div
      className={[
        "flex flex-col gap-3 border border-[var(--fg)]/20 p-4 font-mono",
        isFinished ? "ring-1 ring-inset ring-[var(--fg)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-[var(--fg)]/70">
            {timer.name}
          </div>
          {timer.description && (
            <div className="mt-0.5 line-clamp-2 text-xs text-[var(--fg)]/50">
              {timer.description}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {isFinished && (
            <span className="bg-[var(--fg)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--bg)]">
              Finished
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(timer.id)}
            aria-label="Delete"
            className="-mr-1 -mt-1 px-1 text-lg leading-none text-[var(--fg)]/50 hover:text-[var(--fg)]"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="tabular-nums text-3xl tracking-tight text-[var(--fg)]">
          {formatTime(timer.remaining)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(timer.id)}
            disabled={isFinished}
            aria-label={isRunning ? "Pause" : "Start"}
            className={iconBtn}
          >
            <Icon name={isRunning ? "pause" : "play_arrow"} />
          </button>
          <button
            type="button"
            onClick={() => onReset(timer.id)}
            aria-label="Reset"
            className={iconBtn}
          >
            <Icon name="refresh" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(timer.id)}
            aria-label="Duplicate"
            className={iconBtn}
          >
            <Icon name="file_copy" />
          </button>
        </div>
      </div>

      {timer.mode !== "stopwatch" && others.length > 0 && (
        <label className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
          <span>Then</span>
          <select
            value={currentNext}
            onChange={(e) =>
              onSetNext(timer.id, e.target.value ? e.target.value : null)
            }
            className="min-w-0 flex-1 border border-[var(--fg)]/20 bg-transparent px-2 py-1 font-mono text-xs normal-case tracking-normal text-[var(--fg)]/70 outline-none focus:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            <option value="">None</option>
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
