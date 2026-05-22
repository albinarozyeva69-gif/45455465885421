"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ToastState } from "@/types/prompt";

type ToastProps = {
  toast: ToastState | null;
};

export function Toast({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed left-1/2 top-5 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-neutral-950/82 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/25 backdrop-blur-2xl dark:bg-white/12"
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          initial={{ opacity: 0, y: -18, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
        >
          <span className="grid size-6 place-items-center rounded-full bg-emerald-400 text-neutral-950">
            <Check size={15} strokeWidth={3} />
          </span>
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
