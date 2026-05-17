"use client";

import { useEffect, useRef } from "react";
import Icon from "./Icon";
import TimerShareButton from "./TimerShareButton";
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
  focusedId: string;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onLap: (id: string) => void;
  onExit: () => void;
};

const controlBtn =
  "inline-flex items-center justify-center p-3 text-[var(--fg)]/70 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40";

export default function FocusMode({
  timers,
  focusedId,
  onToggle,
  onReset,
  onLap,
  onExit,
}: Props) {
  const dict = useDict();
  const t = dict.focus;
  const card = dict.card;
  const scrollRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  // Only running timers are scrollable — plus the focused one, even if it
  // isn't running yet, so it can still be started from focus mode.
  const slides = timers.filter(
    (t) => t.status === "running" || t.id === focusedId,
  );
  const slideKey = slides.map((t) => t.id).join(",");

  // Scroll to the focused timer's slide — instant on open, smooth after.
  // Re-runs when the running set changes so focus stays in view.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const index = slides.findIndex((t) => t.id === focusedId);
    if (index < 0) return;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: didMount.current ? "smooth" : "auto",
    });
    didMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId, slideKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
        return;
      }
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
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] font-mono text-[var(--fg)]">
      <div className="flex items-center p-6 [@media(max-height:500px)]:p-3">
        <button
          type="button"
          onClick={onExit}
          aria-label={t.exit}
          className="inline-flex items-center gap-2 p-1.5 text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--fg)]"
        >
          <Icon name="fullscreen_exit" />
          {t.exitLabel}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {slides.map((timer) => {
          const isFinished = timer.status === "finished";
          const isRunning = timer.status === "running";
          const isStopwatch = timer.mode === "stopwatch";
          const isAlarm = timer.mode === "alarm";
          const laps = timer.laps ?? [];
          const nextTimer =
            !isAlarm && timer.nextId
              ? timers.find((tt) => tt.id === timer.nextId)
              : null;
          return (
            <div
              key={timer.id}
              className="flex w-full shrink-0 snap-start flex-col items-start justify-center gap-10 px-6 pb-24 [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:pb-6"
            >
              <div className="flex flex-col items-start gap-3">
                <span className="text-xs uppercase tracking-widest text-[var(--fg)]/50">
                  {isStopwatch
                    ? card.stopwatch
                    : isAlarm
                      ? card.alarm
                      : card.timer}
                </span>
                <h2 className="text-xl font-medium uppercase tracking-wide sm:text-2xl">
                  {timer.name}
                </h2>
                {timer.description && (
                  <p className="max-w-md text-sm leading-relaxed text-[var(--fg)]/50">
                    {timer.description}
                  </p>
                )}
              </div>

              <div className="tabular-nums text-[clamp(2.5rem,14vw,10rem)] leading-none tracking-tight [@media(max-height:500px)]:text-[clamp(2rem,10vh,5rem)]">
                {formatTime(displaySeconds(timer))}
              </div>

              {isFinished && (
                <span className="bg-[var(--fg)] px-2 py-1 text-xs uppercase tracking-widest text-[var(--bg)]">
                  {t.finished}
                </span>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onToggle(timer.id)}
                  disabled={isFinished}
                  aria-label={isRunning ? t.pause : t.start}
                  className={controlBtn}
                >
                  <Icon
                    name={isRunning ? "pause" : "play_arrow"}
                    className="text-4xl [@media(max-height:500px)]:text-2xl"
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
                    <Icon name="flag" className="text-4xl [@media(max-height:500px)]:text-2xl" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onReset(timer.id)}
                  aria-label={t.reset}
                  className={controlBtn}
                >
                  <Icon name="refresh" className="text-4xl [@media(max-height:500px)]:text-2xl" />
                </button>
                <TimerShareButton
                  timer={timer}
                  buttonClassName={controlBtn}
                  iconClassName="text-4xl [@media(max-height:500px)]:text-2xl"
                />
              </div>

              {isStopwatch && laps.length > 0 && (
                <ul className="flex max-h-40 w-full max-w-md flex-col-reverse overflow-y-auto">
                  {laps.map((lap, i) => {
                    const split = lap - (i > 0 ? laps[i - 1] : 0);
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 border-t border-[var(--fg)]/10 py-1.5 text-xs uppercase tracking-widest text-[var(--fg)]/50 first:border-t-0"
                      >
                        <span>{fmt(card.lapNumber, { n: i + 1 })}</span>
                        <span className="tabular-nums text-[var(--fg)]/70">
                          {formatTime(lap)}
                        </span>
                        <span className="tabular-nums">
                          +{formatTime(split)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {nextTimer && (
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--fg)]/50">
                  <Icon name="arrow_forward" />
                  <span>{fmt(t.next, { name: nextTimer.name })}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
