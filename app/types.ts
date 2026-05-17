export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerMode = "countdown" | "stopwatch" | "alarm";

export type Timer = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  remaining: number;
  status: TimerStatus;
  endsAt?: number | null;
  startedAt?: number | null;
  nextId?: string | null;
  mode?: TimerMode;
  laps?: number[];
  alarmHour?: number;
  alarmMinute?: number;
};

export type SequenceStep = {
  name: string;
  description?: string;
  duration: number;
  mode: TimerMode;
  nextIndex: number | null;
  alarmHour?: number;
  alarmMinute?: number;
  // Optional live state, used by share links so a running timer arrives
  // running on the other side and fires at the same wall-clock moment.
  // Saved sequences omit these.
  status?: "running" | "paused" | "finished";
  endsAt?: number;
  startedAt?: number;
  remaining?: number;
  laps?: number[];
};

export type Sequence = {
  id: string;
  name: string;
  steps: SequenceStep[];
};

export type SavedTimer = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  mode: TimerMode;
  alarmHour?: number;
  alarmMinute?: number;
};
