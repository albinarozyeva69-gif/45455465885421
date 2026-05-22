"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryRailProps = {
  activeCategory: string;
  onSelect: (category: string) => void;
};

export function CategoryRail({ activeCategory, onSelect }: CategoryRailProps) {
  return (
    <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-5 py-3 sm:px-8">
      {categories.map((category) => {
        const active = activeCategory === category;

        return (
          <motion.button
            key={category}
            aria-pressed={active}
            className={cn(
              "relative shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-95",
              active
                ? "text-white"
                : "border border-black/8 bg-white/55 text-neutral-700 shadow-sm backdrop-blur-xl hover:bg-white/80 dark:border-white/10 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white/14"
            )}
            type="button"
            onClick={() => onSelect(category)}
            whileTap={{ scale: 0.94 }}
          >
            {active ? (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-neutral-950 shadow-xl shadow-black/20 dark:bg-white/18"
                transition={{ type: "spring", stiffness: 440, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{category}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
