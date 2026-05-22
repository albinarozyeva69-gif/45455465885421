"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("prompt-gallery-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = stored ? stored === "dark" : prefersDark;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("prompt-gallery-theme", next ? "dark" : "light");
  }

  return (
    <button
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/65 text-neutral-900 shadow-sm backdrop-blur-2xl transition active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white"
      title={dark ? "Светлая тема" : "Тёмная тема"}
      type="button"
      onClick={toggleTheme}
    >
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
