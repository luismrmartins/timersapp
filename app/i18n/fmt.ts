export function fmt(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`,
  );
}

export function plural(
  count: number,
  one: string,
  other: string,
  vars?: Record<string, string | number>,
): string {
  return fmt(count === 1 ? one : other, { count, ...(vars ?? {}) });
}
