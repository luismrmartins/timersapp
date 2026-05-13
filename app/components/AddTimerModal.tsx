"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; description: string; duration: number }) => void;
};

const inputClass =
  "border border-[#DDDDDD] bg-white px-3 py-2 font-mono text-sm text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#111111]";

const primaryBtn =
  "bg-[#111111] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-white hover:bg-black";

const secondaryBtn =
  "border border-[#DDDDDD] px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[#666666] hover:border-[#999999] hover:text-[#111111]";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-[#DDDDDD] bg-[#FAFAF8] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-normal text-[#111111]">New Timer</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-0.5 text-sm text-[#666666] hover:text-[#111111]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[#666666]">
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
            <span className="text-xs uppercase tracking-widest text-[#666666]">
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

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[#666666]">
              Duration
            </span>
            <div className="flex items-center gap-2">
              <DurationInput label="hh" value={hours} onChange={setHours} />
              <span className="text-[#999999]">:</span>
              <DurationInput label="mm" value={minutes} onChange={setMinutes} />
              <span className="text-[#999999]">:</span>
              <DurationInput label="ss" value={seconds} onChange={setSeconds} />
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#666666]">{error}</div>
          )}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className={secondaryBtn}>
              Cancel
            </button>
            <button type="submit" className={primaryBtn}>
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
        className="w-full border border-[#DDDDDD] bg-white px-2 py-2 text-center font-mono text-sm tabular-nums text-[#111111] outline-none focus:border-[#111111]"
      />
      <span className="text-xs uppercase tracking-widest text-[#666666]">
        {label}
      </span>
    </label>
  );
}
