"use client";

import { Flame, Heart, Home, Layers2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "home" | "categories" | "popular" | "profile";

type BottomNavProps = {
  activeTab: NavTab;
  favoriteCount: number;
  onChange: (tab: NavTab) => void;
};

const navItems = [
  { id: "home", label: "Главная", icon: Home },
  { id: "categories", label: "Категории", icon: Layers2 },
  { id: "popular", label: "Популярное", icon: Flame },
  { id: "profile", label: "Профиль", icon: UserRound }
] satisfies Array<{ id: NavTab; label: string; icon: typeof Home }>;

export function BottomNav({ activeTab, favoriteCount, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2">
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[1.7rem] border border-black/10 bg-white/82 p-1.5 shadow-2xl shadow-black/14 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/72">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              aria-label={item.label}
              className={cn(
                "relative flex h-14 flex-col items-center justify-center gap-1 rounded-[1.2rem] text-[11px] font-semibold transition active:scale-95",
                active
                  ? "bg-neutral-950 text-white shadow-lg shadow-black/15 dark:bg-white dark:text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
              type="button"
              onClick={() => onChange(item.id)}
            >
              <Icon size={19} strokeWidth={active ? 2.7 : 2.2} />
              <span>{item.label}</span>
              {item.id === "profile" && favoriteCount > 0 ? (
                <span className="absolute right-3 top-2 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] text-white">
                  <Heart size={9} fill="currentColor" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
