import type { SequenceStep, Timer } from "../types";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// A board (timers + their chaining) flattened to relative steps, the same
// shape sequences use. nextId is stored as a relative index so it survives
// being rebuilt into fresh timers on another device. Live state
// (status / endsAt / startedAt / remaining / laps) is carried for non-idle
// timers so a shared running timer fires for the recipient at the same
// wall-clock moment as for the sender.
export function timersToSteps(timers: Timer[]): SequenceStep[] {
  const idToIndex = new Map(timers.map((t, i) => [t.id, i]));
  return timers.map((t) => {
    const step: SequenceStep = {
      name: t.name,
      description: t.description,
      duration: t.duration,
      mode: t.mode ?? "countdown",
      nextIndex:
        t.nextId != null && idToIndex.has(t.nextId)
          ? (idToIndex.get(t.nextId) as number)
          : null,
      alarmHour: t.alarmHour,
      alarmMinute: t.alarmMinute,
    };
    if (t.status === "running") {
      step.status = "running";
      if (t.mode === "stopwatch") {
        if (t.startedAt != null) step.startedAt = t.startedAt;
      } else if (t.endsAt != null) {
        step.endsAt = t.endsAt;
      }
    } else if (t.status === "paused") {
      step.status = "paused";
      step.remaining = t.remaining;
    } else if (t.status === "finished") {
      step.status = "finished";
    }
    if (t.mode === "stopwatch" && t.laps && t.laps.length > 0) {
      step.laps = t.laps;
    }
    return step;
  });
}

export function stepsToTimers(
  steps: SequenceStep[],
  makeId: () => string,
): Timer[] {
  const now = Date.now();
  const timers: Timer[] = steps.map((step) => {
    const isStopwatch = step.mode === "stopwatch";
    const isAlarm = step.mode === "alarm";
    const base: Timer = {
      id: makeId(),
      name: step.name,
      description: step.description,
      duration: isAlarm ? 0 : step.duration,
      remaining: isStopwatch || isAlarm ? 0 : step.duration,
      status: "idle",
      endsAt: null,
      startedAt: null,
      nextId: null,
      mode: step.mode,
      alarmHour: step.alarmHour,
      alarmMinute: step.alarmMinute,
    };
    if (isStopwatch && step.laps && step.laps.length > 0) {
      base.laps = step.laps.slice(0, 200);
    }

    if (step.status === "running") {
      if (isStopwatch) {
        if (step.startedAt != null) {
          base.status = "running";
          base.startedAt = step.startedAt;
          base.remaining = Math.max(0, Math.floor((now - step.startedAt) / 1000));
        }
      } else if (step.endsAt != null) {
        if (step.endsAt > now) {
          base.status = "running";
          base.endsAt = step.endsAt;
          base.remaining = Math.ceil((step.endsAt - now) / 1000);
        } else {
          // Already fired before the recipient opened the link.
          base.status = "finished";
          base.remaining = 0;
        }
      }
    } else if (step.status === "paused") {
      base.status = "paused";
      if (typeof step.remaining === "number") {
        base.remaining = Math.max(0, Math.floor(step.remaining));
      }
    } else if (step.status === "finished") {
      base.status = "finished";
      base.remaining = 0;
    }
    return base;
  });
  steps.forEach((step, i) => {
    if (step.nextIndex != null && timers[step.nextIndex]) {
      timers[i].nextId = timers[step.nextIndex].id;
    }
  });
  return timers;
}

export function encodeShare(steps: SequenceStep[]): string {
  return encodeURIComponent(utf8ToBase64(JSON.stringify(steps)));
}

// Decodes and sanitizes untrusted share data from a URL parameter.
export function decodeShare(param: string): SequenceStep[] | null {
  try {
    const parsed = JSON.parse(base64ToUtf8(decodeURIComponent(param)));
    if (!Array.isArray(parsed)) return null;
    const steps: SequenceStep[] = parsed
      .filter(
        (s): s is Record<string, unknown> =>
          s != null && typeof s === "object",
      )
      .filter(
        (s) => typeof s.name === "string" && typeof s.duration === "number",
      )
      .map((s) => {
        const mode =
          s.mode === "stopwatch"
            ? ("stopwatch" as const)
            : s.mode === "alarm"
              ? ("alarm" as const)
              : ("countdown" as const);
        const alarmHour =
          typeof s.alarmHour === "number"
            ? Math.min(23, Math.max(0, Math.floor(s.alarmHour)))
            : undefined;
        const alarmMinute =
          typeof s.alarmMinute === "number"
            ? Math.min(59, Math.max(0, Math.floor(s.alarmMinute)))
            : undefined;
        const status =
          s.status === "running" ||
          s.status === "paused" ||
          s.status === "finished"
            ? s.status
            : undefined;
        const endsAt =
          typeof s.endsAt === "number" && Number.isFinite(s.endsAt)
            ? Math.floor(s.endsAt)
            : undefined;
        const startedAt =
          typeof s.startedAt === "number" && Number.isFinite(s.startedAt)
            ? Math.floor(s.startedAt)
            : undefined;
        const remaining =
          typeof s.remaining === "number" && Number.isFinite(s.remaining)
            ? Math.max(0, Math.floor(s.remaining))
            : undefined;
        const laps =
          Array.isArray(s.laps)
            ? (s.laps as unknown[])
                .filter(
                  (n): n is number =>
                    typeof n === "number" && Number.isFinite(n) && n >= 0,
                )
                .slice(0, 200)
                .map((n) => Math.floor(n))
            : undefined;
        return {
          name: (s.name as string).slice(0, 200),
          description:
            typeof s.description === "string"
              ? s.description.slice(0, 500)
              : undefined,
          duration: Math.max(0, Math.floor(s.duration as number)),
          mode,
          nextIndex:
            typeof s.nextIndex === "number" ? Math.floor(s.nextIndex) : null,
          alarmHour: mode === "alarm" ? alarmHour : undefined,
          alarmMinute: mode === "alarm" ? alarmMinute : undefined,
          status,
          endsAt,
          startedAt,
          remaining,
          laps: mode === "stopwatch" ? laps : undefined,
        };
      });
    return steps.length > 0 ? steps : null;
  } catch {
    return null;
  }
}
