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
// being rebuilt into fresh timers on another device.
export function timersToSteps(timers: Timer[]): SequenceStep[] {
  const idToIndex = new Map(timers.map((t, i) => [t.id, i]));
  return timers.map((t) => ({
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
  }));
}

export function stepsToTimers(
  steps: SequenceStep[],
  makeId: () => string,
): Timer[] {
  const timers: Timer[] = steps.map((step) => ({
    id: makeId(),
    name: step.name,
    description: step.description,
    duration: step.mode === "alarm" ? 0 : step.duration,
    remaining:
      step.mode === "stopwatch" || step.mode === "alarm" ? 0 : step.duration,
    status: "idle" as const,
    endsAt: null,
    startedAt: null,
    nextId: null,
    mode: step.mode,
    alarmHour: step.alarmHour,
    alarmMinute: step.alarmMinute,
  }));
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
        };
      });
    return steps.length > 0 ? steps : null;
  } catch {
    return null;
  }
}
