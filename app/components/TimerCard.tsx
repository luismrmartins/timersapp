"use client";

import Icon from "./Icon";
import { useDict } from "../i18n/I18nProvider";
import { fmt } from "../i18n/fmt";
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
  onFocus: (id: string) => void;
  onSave: (id: string) => void;
  onLap: (id: string) => void;
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
  onFocus,
  onSave,
  onLap,
  onSetNext,
}: Props) {
  const dict = useDict();
  const t = dict.card;
  const isFinished = timer.status === "finished";
  const isRunning = timer.status === "running";
  const isStopwatch = timer.mode === "stopwatch";
  const laps = timer.laps ?? [];
  const currentNext =
    timer.nextId && others.some((o) => o.id === timer.nextId)
      ? timer.nextId
      : "";

  return (
    <div
      id={`timer-${timer.id}`}
      className={[
        "flex scroll-mt-6 flex-col gap-3 rounded-[10px] bg-[var(--card)] p-4 font-mono md:aspect-[3/2]",
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
            {timer.mode === "stopwatch" ? t.stopwatch : t.timer}
          </span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(timer.id)}
            aria-label={t.edit}
            className={iconBtn}
          >
            <Icon name="edit" className="md:text-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(timer.id)}
            aria-label={t.duplicate}
            className={iconBtn}
          >
            <Icon name="file_copy" className="text-[16px] md:text-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onSave(timer.id)}
            aria-label={t.saveToLibrary}
            className={iconBtn}
          >
            <Icon name="bookmark_add" className="md:text-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(timer.id)}
            aria-label={t.delete}
            className={iconBtn}
          >
            <Icon name="close" className="md:text-[16px]" />
          </button>
        </div>
      </div>

      {/* 2. name */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-medium uppercase tracking-wide text-[var(--fg)] lg:text-lg">
          {timer.name}
        </h3>
        {isFinished && (
          <span className="shrink-0 bg-[var(--fg)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--bg)]">
            {t.finished}
          </span>
        )}
      </div>

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
            aria-label={isRunning ? t.pause : t.start}
            className={iconBtn}
          >
            <Icon
              name={isRunning ? "pause" : "play_arrow"}
              className="md:text-[16px]"
            />
          </button>
          {isStopwatch && (
            <button
              type="button"
              onClick={() => onLap(timer.id)}
              disabled={timer.status === "idle"}
              aria-label={t.lap}
              className={iconBtn}
            >
              <Icon name="flag" className="md:text-[16px]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onReset(timer.id)}
            aria-label={t.reset}
            className={iconBtn}
          >
            <Icon name="refresh" className="md:text-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => onFocus(timer.id)}
            aria-label={t.focusMode}
            className={iconBtn}
          >
            <Icon name="fullscreen" className="md:text-[16px]" />
          </button>
        </div>
      </div>

      {isStopwatch && laps.length > 0 && (
        <ul className="flex max-h-28 flex-col-reverse overflow-y-auto">
          {laps.map((lap, i) => {
            const split = lap - (i > 0 ? laps[i - 1] : 0);
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-2 border-t border-[var(--fg)]/10 py-1 text-[10px] uppercase tracking-widest text-[var(--fg)]/50 first:border-t-0"
              >
                <span>{fmt(t.lapNumber, { n: i + 1 })}</span>
                <span className="tabular-nums text-[var(--fg)]/70">
                  {formatTime(lap)}
                </span>
                <span className="tabular-nums">+{formatTime(split)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {timer.mode !== "stopwatch" && others.length > 0 && (
        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
          <span>{t.then}</span>
          <select
            value={currentNext}
            onChange={(e) =>
              onSetNext(timer.id, e.target.value ? e.target.value : null)
            }
            className="min-w-0 flex-1 rounded-md border border-[var(--fg)]/20 bg-transparent px-2 py-1 font-mono text-xs normal-case tracking-normal text-[var(--fg)]/70 outline-none focus:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            <option value="">{dict.common.none}</option>
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
