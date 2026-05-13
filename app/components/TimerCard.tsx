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
  others: { id: string; name: string }[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onSetNext: (id: string, nextId: string | null) => void;
};

const primaryBtn =
  "font-mono px-3 py-1.5 text-xs uppercase tracking-widest bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryBtn =
  "font-mono px-3 py-1.5 text-xs uppercase tracking-widest border border-[var(--fg)]/20 text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]";

export default function TimerCard({
  timer,
  others,
  onToggle,
  onReset,
  onDelete,
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
        {isFinished && (
          <span className="shrink-0 bg-[var(--fg)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--bg)]">
            Finished
          </span>
        )}
      </div>

      <div className="tabular-nums text-3xl tracking-tight text-[var(--fg)]">
        {formatTime(timer.remaining)}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(timer.id)}
          disabled={isFinished}
          className={primaryBtn}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => onReset(timer.id)}
          className={secondaryBtn}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onDelete(timer.id)}
          className={secondaryBtn}
        >
          Delete
        </button>
      </div>

      {others.length > 0 && (
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
