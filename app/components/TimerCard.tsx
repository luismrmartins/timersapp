"use client";

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
  index: number;
  others: { id: string; name: string }[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string) => void;
  onSetNext: (id: string, nextId: string | null) => void;
};

const iconBtn =
  "inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

export default function TimerCard({
  timer,
  index,
  others,
  onToggle,
  onReset,
  onDelete,
  onDuplicate,
  onEdit,
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
        "flex flex-col gap-3 rounded-[10px] border border-[var(--fg)]/20 p-4 font-mono md:aspect-square",
        isFinished ? "ring-1 ring-inset ring-[var(--fg)]" : "",
      ].join(" ")}
    >
      {/* 1. number + edit / duplicate / delete */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--fg)]/50">
          <span className="tabular-nums">
            {String(index).padStart(2, "0")}
          </span>
          <span className="truncate uppercase tracking-widest">
            {timer.mode === "stopwatch" ? "Stopwatch" : "Timer"}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {isFinished && (
            <span className="mr-1 bg-[var(--fg)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--bg)]">
              Finished
            </span>
          )}
          <button
            type="button"
            onClick={() => onEdit(timer.id)}
            aria-label="Edit"
            className={iconBtn}
          >
            <Icon name="edit" className="md:text-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(timer.id)}
            aria-label="Duplicate"
            className={iconBtn}
          >
            <Icon name="file_copy" className="text-[16px] md:text-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(timer.id)}
            aria-label="Delete"
            className={iconBtn}
          >
            <Icon name="close" className="md:text-[16px]" />
          </button>
        </div>
      </div>

      {/* 2. name */}
      <h3 className="truncate text-base font-medium uppercase tracking-wide text-[var(--fg)] lg:text-lg">
        {timer.name}
      </h3>

      {/* 3. description */}
      {timer.description && (
        <p className="line-clamp-3 text-xs leading-relaxed text-[var(--fg)]/50">
          {timer.description}
        </p>
      )}

      {/* 4. timer + 5. buttons (side by side on mobile, stacked on desktop) */}
      <div className="flex flex-1 flex-row items-center justify-between gap-3 md:flex-col md:items-start md:justify-end md:gap-4">
        <div className="tabular-nums text-4xl leading-none tracking-tight text-[var(--fg)]">
          {formatTime(timer.remaining)}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggle(timer.id)}
            disabled={isFinished}
            aria-label={isRunning ? "Pause" : "Start"}
            className={iconBtn}
          >
            <Icon
              name={isRunning ? "pause" : "play_arrow"}
              className="md:text-[16px]"
            />
          </button>
          <button
            type="button"
            onClick={() => onReset(timer.id)}
            aria-label="Reset"
            className={iconBtn}
          >
            <Icon name="refresh" className="md:text-[16px]" />
          </button>
        </div>
      </div>

      {timer.mode !== "stopwatch" && others.length > 0 && (
        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
          <span>Then</span>
          <select
            value={currentNext}
            onChange={(e) =>
              onSetNext(timer.id, e.target.value ? e.target.value : null)
            }
            className="min-w-0 flex-1 rounded-md border border-[var(--fg)]/20 bg-transparent px-2 py-1 font-mono text-xs normal-case tracking-normal text-[var(--fg)]/70 outline-none focus:border-[var(--fg)] hover:text-[var(--fg)]"
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
