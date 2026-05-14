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

export type SequenceStep = {
  name: string;
  description?: string;
  duration: number;
  mode: TimerMode;
  nextIndex: number | null;
};

export type Sequence = {
  id: string;
  name: string;
  steps: SequenceStep[];
};
