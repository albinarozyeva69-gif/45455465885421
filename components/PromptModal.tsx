"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Heart, Share2, X } from "lucide-react";
import Image from "next/image";
import type { Prompt } from "@/types/prompt";

type PromptModalProps = {
  prompt: Prompt | null;
  favorites: string[];
  prompts: Prompt[];
  onClose: () => void;
  onCopy: (prompt: Prompt) => void;
  onFavorite: (id: string) => void;
  onOpen: (prompt: Prompt) => void;
  onShare: (prompt: Prompt) => void;
};

export function PromptModal({
  prompt,
  favorites,
  prompts,
  onClose,
  onCopy,
  onFavorite,
  onOpen,
  onShare
}: PromptModalProps) {
  const similar = prompt
    ? prompts
        .filter(
          (item) =>
            item.id !== prompt.id &&
            (item.category === prompt.category ||
              item.tagSlugs.some((tag) => prompt.tagSlugs.includes(tag)))
        )
        .slice(0, 4)
    : [];

  return (
    <AnimatePresence>
      {prompt ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] bg-neutral-950/42 backdrop-blur-2xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            aria-modal="true"
            animate={{ y: 0 }}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[94svh] max-w-3xl overflow-hidden rounded-t-[2.3rem] border border-white/14 bg-white text-neutral-950 shadow-2xl dark:bg-neutral-950 dark:text-white"
            drag="y"
            dragConstraints={{ bottom: 0, top: 0 }}
            dragElastic={{ bottom: 0.28, top: 0 }}
            exit={{ y: "105%" }}
            initial={{ y: "105%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 900) {
                onClose();
              }
            }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-white/18" />
            <div className="no-scrollbar max-h-[calc(94svh-10px)] overflow-y-auto pb-8">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-white/70 px-5 py-4 backdrop-blur-2xl dark:bg-neutral-950/70">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                    Просмотр
                  </p>
                  <h2 className="mt-1 line-clamp-1 text-xl font-bold">{prompt.title}</h2>
                </div>
                <button
                  aria-label="Закрыть"
                  className="grid size-11 place-items-center rounded-full bg-neutral-950/6 transition active:scale-90 dark:bg-white/10"
                  type="button"
                  onClick={onClose}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="px-5">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <Image
                    priority
                    alt={prompt.title}
                    className="aspect-[4/5] w-full object-cover"
                    height={1200}
                    sizes="(max-width: 768px) 92vw, 720px"
                    src={prompt.imageUrl}
                    width={960}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-neutral-950">
                    {prompt.category}
                  </span>
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-950/6 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-5 rounded-[1.5rem] bg-neutral-950/[0.035] p-5 text-base leading-8 text-neutral-700 dark:bg-white/[0.07] dark:text-neutral-200">
                  {prompt.prompt}
                </p>

                <div className="sticky bottom-4 mt-5 grid grid-cols-[1fr_auto_auto] gap-2">
                  <button
                    className="flex h-14 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-base font-bold text-white shadow-2xl shadow-black/18 transition active:scale-[0.98] dark:bg-white dark:text-neutral-950"
                    type="button"
                    onClick={() => onCopy(prompt)}
                  >
                    <Copy size={19} />
                    Скопировать
                  </button>
                  <button
                    aria-label={
                      favorites.includes(prompt.id)
                        ? "Убрать из избранного"
                        : "Добавить в избранное"
                    }
                    className="grid size-14 place-items-center rounded-full border border-black/8 bg-white/88 shadow-lg backdrop-blur-xl transition active:scale-90 dark:border-white/10 dark:bg-white/10"
                    type="button"
                    onClick={() => onFavorite(prompt.id)}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(prompt.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    aria-label="Поделиться"
                    className="grid size-14 place-items-center rounded-full border border-black/8 bg-white/88 shadow-lg backdrop-blur-xl transition active:scale-90 dark:border-white/10 dark:bg-white/10"
                    type="button"
                    onClick={() => onShare(prompt)}
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold">Похожие промпты</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {similar.map((item) => (
                      <button
                        key={item.id}
                        className="group overflow-hidden rounded-[1.3rem] bg-neutral-950/5 text-left transition active:scale-[0.98] dark:bg-white/8"
                        type="button"
                        onClick={() => onOpen(item)}
                      >
                        <Image
                          alt={item.title}
                          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                          height={420}
                          loading="lazy"
                          sizes="45vw"
                          src={item.imageUrl}
                          width={420}
                        />
                        <p className="line-clamp-2 p-3 text-sm font-bold">{item.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
