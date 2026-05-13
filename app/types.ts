export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type TimerMode = "countdown" | "stopwatch";

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
};
