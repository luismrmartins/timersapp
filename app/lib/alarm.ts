export function nextOccurrence(hour: number, minute: number, now = Date.now()): number {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= now) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

export function alarmSeconds(hour: number, minute: number): number {
  return hour * 3600 + minute * 60;
}

export function defaultAlarmHM(now = new Date()): { hour: number; minute: number } {
  const d = new Date(now.getTime() + 60 * 60 * 1000);
  return { hour: d.getHours(), minute: d.getMinutes() };
}
