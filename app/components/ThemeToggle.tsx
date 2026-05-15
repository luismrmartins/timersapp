"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { useDict } from "../i18n/I18nProvider";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const dict = useDict();
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
      aria-label={
        theme === "dark" ? dict.header.switchToLight : dict.header.switchToDark
      }
      suppressHydrationWarning
      className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
    >
      <Icon name={theme === "dark" ? "dark_mode" : "light_mode"} />
    </button>
  );
}
