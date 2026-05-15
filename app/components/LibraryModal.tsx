"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import ShareButton from "./ShareButton";
import { useDict } from "../i18n/I18nProvider";
import { plural } from "../i18n/fmt";
import type { SavedTimer, Sequence, Timer } from "../types";

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  sequences: Sequence[];
  savedTimers: SavedTimer[];
  timers: Timer[];
  onSaveSequence: (name: string) => void;
  onLoadSequence: (id: string) => void;
  onOverwriteSequence: (id: string) => void;
  onDeleteSequence: (id: string) => void;
  onAddSavedTimer: (id: string) => void;
  onDeleteSavedTimer: (id: string) => void;
};

const rowBtn =
  "rounded-md border border-[var(--fg)]/20 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

const rowDeleteBtn =
  "inline-flex items-center justify-center p-1.5 text-[var(--fg)]/50 hover:text-[var(--fg)]";

export default function LibraryModal({
  open,
  onClose,
  sequences,
  savedTimers,
  timers,
  onSaveSequence,
  onLoadSequence,
  onOverwriteSequence,
  onDeleteSequence,
  onAddSavedTimer,
  onDeleteSavedTimer,
}: Props) {
  const dict = useDict();
  const t = dict.library;
  const [name, setName] = useState("");
  const timerCount = timers.length;

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || timerCount === 0) return;
    onSaveSequence(trimmed);
    setName("");
  };

  const sequenceTotal = (seq: Sequence) =>
    seq.steps.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/40 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[10px] border border-[var(--fg)]/20 bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-normal text-[var(--fg)]">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
            className="px-2 py-0.5 text-sm text-[var(--fg)]/70 hover:text-[var(--fg)]"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
            {t.saveCurrentBoard}
          </span>
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                timerCount === 0 ? t.noTimersToSave : t.sequenceName
              }
              disabled={timerCount === 0}
              className="min-w-0 flex-1 rounded-md border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] placeholder:text-[var(--fg)]/40 outline-none focus:border-[var(--fg)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={timerCount === 0 || name.trim() === ""}
              className="rounded-md bg-[var(--fg)] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {dict.common.save}
            </button>
          </form>
          <ShareButton timers={timers} />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
            {t.sequences}
          </span>
          {sequences.length === 0 ? (
            <p className="text-xs text-[var(--fg)]/50">{t.noSequences}</p>
          ) : (
            <ul className="flex flex-col">
              {sequences.map((seq) => {
                const total = sequenceTotal(seq);
                return (
                  <li
                    key={seq.id}
                    className="flex items-center justify-between gap-3 border-t border-[var(--fg)]/10 py-3 first:border-t-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-[var(--fg)]">
                        {seq.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
                        {plural(
                          seq.steps.length,
                          t.seqTimerCountOne,
                          t.seqTimerCountOther,
                        )}
                        {total > 0 ? ` · ${formatDuration(total)}` : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOverwriteSequence(seq.id)}
                        disabled={timerCount === 0}
                        className={rowBtn}
                      >
                        {t.overwrite}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLoadSequence(seq.id)}
                        className={rowBtn}
                      >
                        {t.load}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSequence(seq.id)}
                        aria-label={t.deleteSequence}
                        className={rowDeleteBtn}
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
            {t.timers}
          </span>
          {savedTimers.length === 0 ? (
            <p className="text-xs text-[var(--fg)]/50">{t.noSavedTimers}</p>
          ) : (
            <ul className="flex flex-col">
              {savedTimers.map((st) => (
                <li
                  key={st.id}
                  className="flex items-center justify-between gap-3 border-t border-[var(--fg)]/10 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-[var(--fg)]">
                      {st.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
                      {st.mode === "stopwatch"
                        ? t.stopwatchLabel
                        : st.mode === "alarm"
                          ? `${dict.card.alarm} · ${String(st.alarmHour ?? 0).padStart(2, "0")}:${String(st.alarmMinute ?? 0).padStart(2, "0")}`
                          : formatDuration(st.duration)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAddSavedTimer(st.id)}
                      className={rowBtn}
                    >
                      {t.add}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedTimer(st.id)}
                      aria-label={t.deleteSavedTimer}
                      className={rowDeleteBtn}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
