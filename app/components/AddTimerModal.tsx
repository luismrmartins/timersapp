"use client";

import { useEffect, useState } from "react";
import type { Timer, TimerMode } from "../types";

type SubmitInput = {
  name: string;
  description: string;
  duration: number;
  nextId: string | null;
  mode: TimerMode;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: SubmitInput) => void;
  onSave: (id: string, input: SubmitInput) => void;
  editTimer: Timer | null;
  existingTimers: { id: string; name: string }[];
};

const inputClass =
  "border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] placeholder:text-[var(--fg)]/40 outline-none focus:border-[var(--fg)]";

const primaryBtn =
  "bg-[var(--fg)] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--bg)] hover:opacity-90";

const secondaryBtn =
  "border border-[var(--fg)]/20 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]";

export default function AddTimerModal({
  open,
  onClose,
  onCreate,
  onSave,
  editTimer,
  existingTimers,
}: Props) {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [nextId, setNextId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEditing = editTimer !== null;

  useEffect(() => {
    if (!open) return;
    if (editTimer) {
      const d = editTimer.duration;
      setMode(editTimer.mode ?? "countdown");
      setName(editTimer.name);
      setDescription(editTimer.description ?? "");
      setHours(String(Math.floor(d / 3600)));
      setMinutes(String(Math.floor((d % 3600) / 60)));
      setSeconds(String(d % 60));
      setNextId(editTimer.nextId ?? "");
      setError(null);
    } else {
      setMode("countdown");
      setName("");
      setDescription("");
      setHours("0");
      setMinutes("5");
      setSeconds("0");
      setNextId("");
      setError(null);
    }
  }, [open, editTimer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    let duration = 0;
    if (mode === "countdown") {
      const h = Math.max(0, parseInt(hours, 10) || 0);
      const m = Math.max(0, parseInt(minutes, 10) || 0);
      const s = Math.max(0, parseInt(seconds, 10) || 0);
      duration = h * 3600 + m * 60 + s;
      if (duration <= 0) {
        setError("Duration must be greater than zero.");
        return;
      }
    }
    const input: SubmitInput = {
      name: trimmedName,
      description: description.trim(),
      duration,
      nextId: mode === "stopwatch" ? null : nextId || null,
      mode,
    };
    if (editTimer) {
      onSave(editTimer.id, input);
    } else {
      onCreate(input);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/40 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-[var(--fg)]/20 bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-normal text-[var(--fg)]">
            {isEditing
              ? mode === "stopwatch"
                ? "Edit Stopwatch"
                : "Edit Timer"
              : mode === "stopwatch"
                ? "New Stopwatch"
                : "New Timer"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-0.5 text-sm text-[var(--fg)]/70 hover:text-[var(--fg)]"
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex">
          <button
            type="button"
            onClick={() => setMode("countdown")}
            className={
              "flex-1 border border-[var(--fg)]/20 px-4 py-2 font-mono text-xs uppercase tracking-widest " +
              (mode === "countdown"
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--fg)]/70 hover:text-[var(--fg)]")
            }
          >
            Timer
          </button>
          <button
            type="button"
            onClick={() => setMode("stopwatch")}
            className={
              "flex-1 border border-l-0 border-[var(--fg)]/20 px-4 py-2 font-mono text-xs uppercase tracking-widest " +
              (mode === "stopwatch"
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--fg)]/70 hover:text-[var(--fg)]")
            }
          >
            Stopwatch
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
              Name
            </span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Tea steep"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Green tea, second brew"
            />
          </label>

          {mode === "countdown" && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                Duration
              </span>
              <div className="flex items-center gap-2">
                <DurationInput label="hh" value={hours} onChange={setHours} />
                <span className="text-[var(--fg)]/50">:</span>
                <DurationInput
                  label="mm"
                  value={minutes}
                  onChange={setMinutes}
                />
                <span className="text-[var(--fg)]/50">:</span>
                <DurationInput
                  label="ss"
                  value={seconds}
                  onChange={setSeconds}
                />
              </div>
            </div>
          )}

          {mode === "stopwatch" && (
            <p className="text-xs text-[var(--fg)]/50">
              Counts up from 00:00. Start, pause, and reset like a timer.
            </p>
          )}

          {mode === "countdown" && existingTimers.length > 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                Then start (optional)
              </span>
              <select
                value={nextId}
                onChange={(e) => setNextId(e.target.value)}
                className="border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] outline-none focus:border-[var(--fg)]"
              >
                <option value="">None</option>
                {existingTimers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <div className="text-xs text-[var(--fg)]/70">{error}</div>
          )}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className={secondaryBtn}>
              Cancel
            </button>
            <button type="submit" className={primaryBtn}>
              {isEditing
                ? "Save"
                : mode === "stopwatch"
                  ? "Add Stopwatch"
                  : "Add Timer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DurationInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[var(--fg)]/20 bg-transparent px-2 py-2 text-center font-mono text-sm tabular-nums text-[var(--fg)] outline-none focus:border-[var(--fg)]"
      />
      <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
        {label}
      </span>
    </label>
  );
}
