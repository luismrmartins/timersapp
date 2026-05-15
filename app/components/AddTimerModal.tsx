"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
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

const underlineInput =
  "block w-full bg-transparent border-0 border-b border-[var(--fg)]/20 focus:border-[var(--fg)] focus:outline-none focus:ring-0 py-2 font-mono text-base text-[var(--fg)] placeholder:text-[var(--fg)]/30";

const fieldLabel =
  "text-[10px] uppercase tracking-widest text-[var(--fg)]/50";

const modeIcons: Record<TimerMode, string> = {
  countdown: "timer",
  stopwatch: "av_timer",
  alarm: "alarm",
};

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

  const submitLabel = isEditing
    ? dict.common.save
    : mode === "stopwatch"
      ? t.addStopwatch
      : mode === "alarm"
        ? t.addAlarm
        : t.addTimer;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)] font-mono text-[var(--fg)]">
      <button
        type="button"
        onClick={onClose}
        aria-label={dict.common.close}
        className="absolute right-6 top-6 inline-flex items-center justify-center p-1.5 text-lg text-[var(--fg)]/60 hover:text-[var(--fg)]"
      >
        <Icon name="close" />
      </button>

      <div className="px-6 pt-16 pb-12 sm:px-12 sm:pt-20 sm:pb-16">
        <div className="max-w-xl">
          {/* Mode selector — icon-led buttons */}
          <div className="mb-10 flex gap-3">
            {(["countdown", "stopwatch", "alarm"] as TimerMode[]).map((m) => {
              const active = mode === m;
              const label =
                m === "countdown"
                  ? t.modeTimer
                  : m === "stopwatch"
                    ? t.modeStopwatch
                    : t.modeAlarm;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={active}
                  className={
                    "flex flex-1 flex-col items-center gap-1.5 py-3 transition-opacity " +
                    (active
                      ? "text-[var(--fg)]"
                      : "text-[var(--fg)]/40 hover:text-[var(--fg)]/70")
                  }
                >
                  <Icon name={modeIcons[m]} className="text-3xl" />
                  <span className="text-[10px] uppercase tracking-widest">
                    {label}
                  </span>
                  <span
                    className={
                      "h-0.5 w-8 " +
                      (active ? "bg-[var(--fg)]" : "bg-transparent")
                    }
                  />
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {/* Name */}
            <div className="flex items-end gap-3">
              <Icon
                name="label"
                className="pb-2 text-xl text-[var(--fg)]/40"
              />
              <label className="flex flex-1 flex-col gap-1">
                <span className={fieldLabel}>{t.name}</span>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={underlineInput}
                  placeholder={t.namePlaceholder}
                />
              </label>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <Icon
                name="notes"
                className="pt-6 text-xl text-[var(--fg)]/40"
              />
              <label className="flex flex-1 flex-col gap-1">
                <span className={fieldLabel}>{t.description}</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${underlineInput} resize-none`}
                  placeholder={t.descriptionPlaceholder}
                />
              </label>
            </div>

            {/* Duration (countdown) */}
            {mode === "countdown" && (
              <div className="flex items-end gap-3">
                <Icon
                  name="timer"
                  className="pb-2 text-xl text-[var(--fg)]/40"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <span className={fieldLabel}>{t.duration}</span>
                  <div className="flex items-end gap-3">
                    <DurationInput
                      label={t.hoursAbbr}
                      value={hours}
                      onChange={setHours}
                    />
                    <span className="pb-2 text-2xl text-[var(--fg)]/30">
                      :
                    </span>
                    <DurationInput
                      label={t.minutesAbbr}
                      value={minutes}
                      onChange={setMinutes}
                    />
                    <span className="pb-2 text-2xl text-[var(--fg)]/30">
                      :
                    </span>
                    <DurationInput
                      label={t.secondsAbbr}
                      value={seconds}
                      onChange={setSeconds}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stopwatch hint */}
            {mode === "stopwatch" && (
              <div className="flex items-start gap-3">
                <Icon
                  name="av_timer"
                  className="text-xl text-[var(--fg)]/40"
                />
                <p className="flex-1 text-sm text-[var(--fg)]/60">
                  {t.stopwatchHint}
                </p>
              </div>
            )}

            {/* Alarm time */}
            {mode === "alarm" && (
              <div className="flex items-end gap-3">
                <Icon
                  name="alarm"
                  className="pb-2 text-xl text-[var(--fg)]/40"
                />
                <label className="flex flex-1 flex-col gap-1">
                  <span className={fieldLabel}>{t.alarmTime}</span>
                  <input
                    type="time"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className={underlineInput}
                  />
                </label>
              </div>
            )}

            {/* Then start (countdown chaining) */}
            {mode === "countdown" && existingTimers.length > 0 && (
              <div className="flex items-end gap-3">
                <Icon
                  name="arrow_forward"
                  className="pb-2 text-xl text-[var(--fg)]/40"
                />
                <label className="flex flex-1 flex-col gap-1">
                  <span className={fieldLabel}>{t.thenStart}</span>
                  <select
                    value={nextId}
                    onChange={(e) => setNextId(e.target.value)}
                    className={underlineInput}
                  >
                    <option value="">{dict.common.none}</option>
                    {existingTimers.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* Start after */}
            {!isEditing &&
              existingTimers.some((et) => et.mode !== "stopwatch") && (
                <div className="flex items-end gap-3">
                  <Icon
                    name="arrow_back"
                    className="pb-2 text-xl text-[var(--fg)]/40"
                  />
                  <label className="flex flex-1 flex-col gap-1">
                    <span className={fieldLabel}>{t.startAfter}</span>
                    <select
                      value={prevId}
                      onChange={(e) => setPrevId(e.target.value)}
                      className={underlineInput}
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
                </div>
              )}

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="mt-4 flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="text-xs uppercase tracking-widest text-[var(--fg)]/60 hover:text-[var(--fg)]"
              >
                {dict.common.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--fg)] hover:opacity-80"
              >
                <Icon name="check" />
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
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
        className="block w-full border-0 border-b border-[var(--fg)]/20 bg-transparent py-2 text-center font-mono text-2xl tabular-nums text-[var(--fg)] outline-none focus:border-[var(--fg)] focus:ring-0"
      />
      <span className="text-[10px] uppercase tracking-widest text-[var(--fg)]/40">
        {label}
      </span>
    </label>
  );
}
