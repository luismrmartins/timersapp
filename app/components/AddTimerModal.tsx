"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; description: string; duration: number }) => void;
};

export default function AddTimerModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setHours("0");
      setMinutes("5");
      setSeconds("0");
      setError(null);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    const h = Math.max(0, parseInt(hours, 10) || 0);
    const m = Math.max(0, parseInt(minutes, 10) || 0);
    const s = Math.max(0, parseInt(seconds, 10) || 0);
    const duration = h * 3600 + m * 60 + s;
    if (duration <= 0) {
      setError("Duration must be greater than zero.");
      return;
    }
    onCreate({ name: trimmedName, description: description.trim(), duration });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-neutral-400 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            New Timer
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-neutral-400 px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Name
            </span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              placeholder="Tea steep"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              placeholder="Green tea, second brew"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Duration
            </span>
            <div className="flex items-center gap-2">
              <DurationInput label="hh" value={hours} onChange={setHours} />
              <span className="text-neutral-400">:</span>
              <DurationInput label="mm" value={minutes} onChange={setMinutes} />
              <span className="text-neutral-400">:</span>
              <DurationInput label="ss" value={seconds} onChange={setSeconds} />
            </div>
          </div>

          {error && (
            <div className="text-xs text-neutral-700 dark:text-neutral-300">
              {error}
            </div>
          )}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-neutral-400 px-4 py-1.5 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-neutral-900 bg-neutral-900 px-4 py-1.5 text-xs uppercase tracking-wider text-neutral-50 hover:bg-neutral-700 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Add Timer
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
        className="w-full border border-neutral-300 bg-neutral-50 px-2 py-2 text-center text-sm tabular-nums text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
      />
      <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </label>
  );
}
