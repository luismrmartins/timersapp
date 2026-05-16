"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { useDict } from "../i18n/I18nProvider";
import { fmt } from "../i18n/fmt";
import { alarmSeconds } from "../lib/alarm";
import type { Timer } from "../types";

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function displaySeconds(t: Timer): number {
  if (t.mode === "alarm") {
    return alarmSeconds(t.alarmHour ?? 0, t.alarmMinute ?? 0);
  }
  return t.remaining;
}

type Props = {
  timers: Timer[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onLap: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onAdd: () => void;
};

const iconBtn =
  "inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

const controlBtn =
  "inline-flex items-center justify-center p-2 text-[var(--fg)]/80 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

export default function CarouselView({
  timers,
  onToggle,
  onReset,
  onLap,
  onEdit,
  onDuplicate,
  onDelete,
  onSave,
  onAdd,
}: Props) {
  const dict = useDict();
  const card = dict.card;
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track which slide is currently centered using IntersectionObserver.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = slideRefs.current.findIndex(
              (el) => el === entry.target,
            );
            if (idx >= 0) setCurrentIndex(idx);
          }
        }
      },
      { root: container, threshold: [0.6, 0.9] },
    );
    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [timers.length]);

  // Arrow-key navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const container = scrollRef.current;
      if (!container) return;
      if (e.key === "ArrowRight") {
        container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        container.scrollBy({
          left: -container.clientWidth,
          behavior: "smooth",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollToIndex = (i: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: i * container.clientWidth, behavior: "smooth" });
  };

  if (timers.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center pb-12">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[var(--fg)]/20 px-6 py-20 text-center hover:border-[var(--fg)]/40 hover:bg-[var(--fg)]/5"
        >
          <span className="text-sm text-[var(--fg)]/70">
            {dict.board.noTimers}
          </span>
          <span className="mt-2 text-xs text-[var(--fg)]/50">
            {dict.board.clickToAdd}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Pagination dots */}
      <div className="mb-6 flex shrink-0 gap-1.5 overflow-x-auto">
        {timers.map((timer, i) => (
          <button
            key={timer.id}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={fmt(dict.header.gotoTimer, { n: i + 1 })}
            aria-current={i === currentIndex}
            className={
              "h-1.5 w-7 shrink-0 rounded-sm transition-colors " +
              (i === currentIndex
                ? "bg-[var(--fg)]"
                : "bg-[var(--fg)]/20 hover:bg-[var(--fg)]/40")
            }
          />
        ))}
      </div>

      {/* Slides */}
      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {timers.map((timer, i) => {
          const isFinished = timer.status === "finished";
          const isRunning = timer.status === "running";
          const isStopwatch = timer.mode === "stopwatch";
          const isAlarm = timer.mode === "alarm";
          const nextTimer =
            !isAlarm && timer.nextId
              ? timers.find((tt) => tt.id === timer.nextId)
              : null;
          return (
            <div
              key={timer.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="relative flex w-full shrink-0 snap-center flex-col gap-6 md:pr-28"
            >
              {/* Per-page actions: top right, extended past slide padding
                  and the surrounding main p-8 so the icons line up with
                  the page edge on desktop. */}
              <div className="flex justify-end gap-1 md:-mr-36">
                <button
                  type="button"
                  onClick={() => onEdit(timer.id)}
                  aria-label={card.edit}
                  className={iconBtn}
                >
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(timer.id)}
                  aria-label={card.duplicate}
                  className={iconBtn}
                >
                  <Icon name="file_copy" />
                </button>
                <button
                  type="button"
                  onClick={() => onSave(timer.id)}
                  aria-label={card.saveToLibrary}
                  className={iconBtn}
                >
                  <Icon name="bookmark_add" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(timer.id)}
                  aria-label={card.delete}
                  className={iconBtn}
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-4">
                <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--fg)]/50">
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    {isStopwatch
                      ? card.stopwatch
                      : isAlarm
                        ? card.alarm
                        : card.timer}
                  </span>
                </span>

                <h2 className="text-2xl font-medium uppercase tracking-wide sm:text-3xl">
                  {timer.name}
                </h2>

                {timer.description && (
                  <p className="max-w-xl text-sm leading-relaxed text-[var(--fg)]/50">
                    {timer.description}
                  </p>
                )}

                <div className="tabular-nums text-[clamp(3rem,12vw,9rem)] leading-none tracking-tight">
                  {formatTime(displaySeconds(timer))}
                </div>

                {isFinished && (
                  <span className="self-start bg-[var(--fg)] px-2 py-1 text-xs uppercase tracking-widest text-[var(--bg)]">
                    {card.finished}
                  </span>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggle(timer.id)}
                      disabled={isFinished}
                      aria-label={isRunning ? card.pause : card.start}
                      className={controlBtn}
                    >
                      <Icon
                        name={isRunning ? "pause" : "play_arrow"}
                        className="text-3xl"
                      />
                    </button>
                    {isStopwatch && (
                      <button
                        type="button"
                        onClick={() => onLap(timer.id)}
                        disabled={timer.status === "idle"}
                        aria-label={card.lap}
                        className={controlBtn}
                      >
                        <Icon name="flag" className="text-3xl" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onReset(timer.id)}
                      aria-label={card.reset}
                      className={controlBtn}
                    >
                      <Icon name="refresh" className="text-3xl" />
                    </button>
                  </div>
                  {nextTimer && (
                    <span className="text-xs uppercase tracking-widest text-[var(--fg)]/50">
                      {fmt(card.nextTimer, { name: nextTimer.name })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Big + button: desktop right edge, mobile inline below */}
      <button
        type="button"
        onClick={onAdd}
        aria-label={dict.header.addTimer}
        className="absolute right-2 top-1/2 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--fg)]/30 text-[var(--fg)]/70 hover:border-[var(--fg)]/60 hover:text-[var(--fg)] md:flex"
      >
        <Icon name="add" className="text-4xl" />
      </button>
      <div className="mt-6 flex shrink-0 md:hidden">
        <button
          type="button"
          onClick={onAdd}
          aria-label={dict.header.addTimer}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--fg)]/30 text-[var(--fg)]/70 hover:border-[var(--fg)]/60 hover:text-[var(--fg)]"
        >
          <Icon name="add" className="text-3xl" />
        </button>
      </div>
    </div>
  );
}
