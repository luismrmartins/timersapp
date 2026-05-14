"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import type { Sequence } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  sequences: Sequence[];
  timerCount: number;
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function SequencesModal({
  open,
  onClose,
  sequences,
  timerCount,
  onSave,
  onLoad,
  onDelete,
}: Props) {
  const [name, setName] = useState("");

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
    onSave(trimmed);
    setName("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/40 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[10px] border border-[var(--fg)]/20 bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-normal text-[var(--fg)]">Sequences</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-0.5 text-sm text-[var(--fg)]/70 hover:text-[var(--fg)]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
            Save current board
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                timerCount === 0 ? "No timers to save" : "Sequence name"
              }
              disabled={timerCount === 0}
              className="min-w-0 flex-1 rounded-md border border-[var(--fg)]/20 bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)] placeholder:text-[var(--fg)]/40 outline-none focus:border-[var(--fg)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={timerCount === 0 || name.trim() === ""}
              className="rounded-md bg-[var(--fg)] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--fg)]/70">
            Saved sequences
          </span>
          {sequences.length === 0 ? (
            <p className="text-xs text-[var(--fg)]/50">
              No saved sequences yet.
            </p>
          ) : (
            <ul className="flex flex-col">
              {sequences.map((seq) => (
                <li
                  key={seq.id}
                  className="flex items-center justify-between gap-3 border-t border-[var(--fg)]/10 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-[var(--fg)]">
                      {seq.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--fg)]/50">
                      {seq.steps.length} timer
                      {seq.steps.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onLoad(seq.id)}
                      className="rounded-md border border-[var(--fg)]/20 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(seq.id)}
                      aria-label="Delete sequence"
                      className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/50 hover:text-[var(--fg)]"
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
