"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      suppressHydrationWarning
      className="border border-[var(--fg)]/20 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
