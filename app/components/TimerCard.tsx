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

const primaryBtn =
  "font-mono px-3 py-1.5 text-xs uppercase tracking-widest bg-[#111111] text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40";

const secondaryBtn =
  "font-mono px-3 py-1.5 text-xs uppercase tracking-widest border border-[#DDDDDD] text-[#666666] hover:border-[#999999] hover:text-[#111111]";

export default function TimerCard({
  timer,
  onToggle,
  onReset,
  onDelete,
}: Props) {
  const isFinished = timer.status === "finished";
  const isRunning = timer.status === "running";

  return (
    <div
      className={[
        "flex flex-col gap-3 border border-[#DDDDDD] bg-[#F5F5F3] p-4 font-mono",
        isFinished ? "ring-1 ring-inset ring-[#111111]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-[#666666]">{timer.name}</div>
          {timer.description && (
            <div className="mt-0.5 line-clamp-2 text-xs text-[#999999]">
              {timer.description}
            </div>
          )}
        </div>
        {isFinished && (
          <span className="shrink-0 bg-[#111111] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-white">
            Finished
          </span>
        )}
      </div>

      <div className="tabular-nums text-3xl tracking-tight text-[#111111]">
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
    </div>
  );
}
