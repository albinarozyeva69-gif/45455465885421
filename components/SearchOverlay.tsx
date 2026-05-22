"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Prompt } from "@/types/prompt";

type SearchOverlayProps = {
  open: boolean;
  query: string;
  results: Prompt[];
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onCopy: (prompt: Prompt) => void;
  onOpen: (prompt: Prompt) => void;
};

export function SearchOverlay({
  open,
  query,
  results,
  onQueryChange,
  onClose,
  onCopy,
  onOpen
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[75] bg-white/70 p-4 pt-[calc(env(safe-area-inset-top)+18px)] backdrop-blur-3xl dark:bg-neutral-950/76"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ y: 0, scale: 1 }}
            className="mx-auto max-w-2xl"
            exit={{ y: -20, scale: 0.98 }}
            initial={{ y: -18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <div className="flex items-center gap-2 rounded-[1.6rem] border border-black/10 bg-white/86 p-2 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
              <Search className="ml-3 text-neutral-400" size={21} />
              <input
                ref={inputRef}
                aria-label="Поиск"
                className="h-12 min-w-0 flex-1 bg-transparent text-lg font-semibold text-neutral-950 outline-none placeholder:text-neutral-400 dark:text-white"
                placeholder="Поиск по названию, тегу или категории"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
              <button
                aria-label="Закрыть поиск"
                className="grid size-11 place-items-center rounded-full bg-neutral-950/6 text-neutral-700 transition active:scale-90 dark:bg-white/10 dark:text-white"
                type="button"
                onClick={onClose}
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-4 max-h-[calc(100svh-130px)] overflow-y-auto pb-10">
              {results.length ? (
                <div className="grid gap-3">
                  {results.map((prompt) => (
                    <article
                      key={prompt.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-[1.4rem] border border-black/8 bg-white/74 p-2 shadow-lg shadow-black/5 backdrop-blur-2xl dark:border-white/8 dark:bg-white/8"
                    >
                      <button
                        className="grid min-w-0 grid-cols-[74px_1fr] items-center gap-3 text-left transition active:scale-[0.99]"
                        type="button"
                        onClick={() => {
                          onOpen(prompt);
                          onClose();
                        }}
                      >
                        <Image
                          alt={prompt.title}
                          className="size-[74px] rounded-[1rem] object-cover"
                          height={148}
                          src={prompt.imageUrl}
                          width={148}
                        />
                        <span className="min-w-0">
                          <span className="line-clamp-1 text-base font-bold text-neutral-950 dark:text-white">
                            {prompt.title}
                          </span>
                          <span className="mt-1 line-clamp-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            {prompt.category} · {prompt.tags.slice(0, 3).join(", ")}
                          </span>
                        </span>
                      </button>
                      <button
                        aria-label="Скопировать"
                        className="grid size-11 place-items-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopy(prompt);
                        }}
                      >
                        <Copy size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-10 rounded-[2rem] border border-black/8 bg-white/58 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-2xl dark:border-white/8 dark:bg-white/8">
                  <p className="text-xl font-bold text-neutral-950 dark:text-white">
                    Ничего не найдено
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Попробуйте другое название, тег или категорию.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
