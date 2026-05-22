"use client";

import { AnimatePresence, motion } from "framer-motion";

type LoadingScreenProps = {
  show: boolean;
};

export function LoadingScreen({ show }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-[var(--page)]"
          exit={{ opacity: 0, scale: 1.02 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.32 }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              className="relative size-16 rounded-[1.4rem] border border-black/10 bg-white/76 shadow-2xl shadow-black/12 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
              transition={{ duration: 1.15, ease: "linear", repeat: Infinity }}
            >
              <div className="absolute left-1/2 top-3 size-3 -translate-x-1/2 rounded-full bg-sky-400" />
              <div className="absolute bottom-3 left-3 size-3 rounded-full bg-rose-400" />
              <div className="absolute bottom-3 right-3 size-3 rounded-full bg-emerald-400" />
            </motion.div>
            <p className="mt-5 text-sm font-bold text-neutral-500 dark:text-neutral-300">
              Загружаем галерею
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
