"use client";

import { useEffect, useState } from "react";
import { useDict } from "../i18n/I18nProvider";
import { defaultAlarmHM } from "../lib/alarm";
import type { Timer, TimerMode } from "../types";

type SubmitInput = {
  name: string;
  description: string;
  duration: number;
  nextId: string | null;
  prevId: string | null;
  mode: TimerMode;
  alarmHour?: number;
  alarmMinute?: number;
};

type ExistingTimer = { id: string; name: string; mode?: TimerMode };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: SubmitInput) => void;
  onSave: (id: string, input: SubmitInput) => void;
  editTimer: Timer | null;
  existingTimers: ExistingTimer[];
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
  const dict = useDict();
  const t = dict.modal;
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [alarmTime, setAlarmTime] = useState("09:00");
  const [nextId, setNextId] = useState("");
  const [prevId, setPrevId] = useState("");
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
      const pad = (n: number) => n.toString().padStart(2, "0");
      if (editTimer.mode === "alarm") {
        const h = editTimer.alarmHour ?? 9;
        const m = editTimer.alarmMinute ?? 0;
        setAlarmTime(`${pad(h)}:${pad(m)}`);
      } else {
        const def = defaultAlarmHM();
        setAlarmTime(`${pad(def.hour)}:${pad(def.minute)}`);
      }
      setNextId(editTimer.nextId ?? "");
      setPrevId("");
      setError(null);
    } else {
      setMode("countdown");
      setName("");
      setDescription("");
      setHours("0");
      setMinutes("5");
      setSeconds("0");
      const pad = (n: number) => n.toString().padStart(2, "0");
      const def = defaultAlarmHM();
      setAlarmTime(`${pad(def.hour)}:${pad(def.minute)}`);
      setNextId("");
      setPrevId("");
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
      setError(t.nameRequired);
      return;
    }
    let duration = 0;
    let alarmHour: number | undefined;
    let alarmMinute: number | undefined;
    if (mode === "countdown") {
      const h = Math.max(0, parseInt(hours, 10) || 0);
      const m = Math.max(0, parseInt(minutes, 10) || 0);
      const s = Math.max(0, parseInt(seconds, 10) || 0);
      duration = h * 3600 + m * 60 + s;
      if (duration <= 0) {
        setError(t.durationRequired);
        return;
      }
    } else if (mode === "alarm") {
      const match = alarmTime.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) {
        setError(t.alarmTimeRequired);
        return;
      }
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      alarmHour = h;
      alarmMinute = m;
    }
    const input: SubmitInput = {
      name: trimmedName,
      description: description.trim(),
      duration,
      nextId: mode === "countdown" ? (nextId || null) : null,
      prevId: prevId || null,
      mode,
      alarmHour,
      alarmMinute,
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
                ? t.editStopwatch
                : mode === "alarm"
                  ? t.editAlarm
                  : t.editTimer
              : mode === "stopwatch"
                ? t.newStopwatch
                : mode === "alarm"
                  ? t.newAlarm
                  : t.newTimer}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
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
            {t.modeTimer}
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
            {t.modeStopwatch}
          </button>
          <button
            type="button"
            onClick={() => setMode("alarm")}
            className={
              "flex-1 border border-l-0 border-[var(--fg)]/20 px-4 py-2 font-mono text-xs uppercase tracking-widest " +
              (mode === "alarm"
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--fg)]/70 hover:text-[var(--fg)]")
            }
          >
            {t.modeAlarm}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
              {t.name}
            </span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder={t.namePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
              {t.description}
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder={t.descriptionPlaceholder}
            />
          </label>

          {mode === "countdown" && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                {t.duration}
              </span>
              <div className="flex items-center gap-2">
                <DurationInput
                  label={t.hoursAbbr}
                  value={hours}
                  onChange={setHours}
                />
                <span className="text-[var(--fg)]/50">:</span>
                <DurationInput
                  label={t.minutesAbbr}
                  value={minutes}
                  onChange={setMinutes}
                />
                <span className="text-[var(--fg)]/50">:</span>
                <DurationInput
                  label={t.secondsAbbr}
                  value={seconds}
                  onChange={setSeconds}
                />
              </div>
            </div>
          )}

          {mode === "stopwatch" && (
            <p className="text-xs text-[var(--fg)]/50">{t.stopwatchHint}</p>
          )}

          {mode === "alarm" && (
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                {t.alarmTime}
              </span>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className={inputClass}
              />
            </label>
          )}

          {mode === "countdown" && existingTimers.length > 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                {t.thenStart}
              </span>
              <select
                value={nextId}
                onChange={(e) => setNextId(e.target.value)}
                className="border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] outline-none focus:border-[var(--fg)]"
              >
                <option value="">{dict.common.none}</option>
                {existingTimers.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {!isEditing &&
            existingTimers.some((et) => et.mode !== "stopwatch") && (
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
                  {t.startAfter}
                </span>
                <select
                  value={prevId}
                  onChange={(e) => setPrevId(e.target.value)}
                  className="border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] outline-none focus:border-[var(--fg)]"
                >
                  <option value="">{dict.common.none}</option>
                  {existingTimers
                    .filter((et) => et.mode !== "stopwatch")
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
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
              {dict.common.cancel}
            </button>
            <button type="submit" className={primaryBtn}>
              {isEditing
                ? dict.common.save
                : mode === "stopwatch"
                  ? t.addStopwatch
                  : mode === "alarm"
                    ? t.addAlarm
                    : t.addTimer}
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
