export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type Timer = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  remaining: number;
  status: TimerStatus;
  endsAt?: number | null;
};
