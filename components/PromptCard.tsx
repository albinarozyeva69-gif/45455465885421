"use client";

import { motion } from "framer-motion";
import { Copy, Heart, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { formatCount } from "@/lib/utils";
import type { Prompt } from "@/types/prompt";

type PromptCardProps = {
  prompt: Prompt;
  favorite: boolean;
  onCopy: (prompt: Prompt) => void;
  onFavorite: (id: string) => void;
  onOpen: (prompt: Prompt) => void;
  onShare: (prompt: Prompt) => void;
};

export function PromptCard({
  prompt,
  favorite,
  onCopy,
  onFavorite,
  onOpen,
  onShare
}: PromptCardProps) {
  function stop(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <motion.article
      layout
      className="group mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-[2rem] border border-black/8 bg-white/62 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/80 dark:border-white/10 dark:bg-white/8 dark:shadow-black/20 dark:hover:bg-white/12"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      viewport={{ once: true, margin: "80px" }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(prompt)}
    >
      <div className="relative overflow-hidden rounded-[1.55rem] bg-neutral-200 dark:bg-neutral-900">
        <Image
          alt={prompt.title}
          className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          height={900}
          loading="lazy"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 25vw"
          src={prompt.imageUrl}
          width={720}
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/62 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-2xl">
          {prompt.category}
        </div>
        {prompt.featured ? (
          <div className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/25 bg-white/18 text-white shadow-lg backdrop-blur-2xl">
            <Sparkles size={17} />
          </div>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="line-clamp-2 text-lg font-bold leading-tight">{prompt.title}</p>
            <p className="mt-1 text-xs font-medium text-white/78">{formatCount(prompt.copyCount)} копий</p>
          </div>
          <button
            aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/16 text-white backdrop-blur-2xl transition active:scale-90"
            type="button"
            onClick={(event) => {
              stop(event);
              onFavorite(prompt.id);
            }}
          >
            <Heart size={19} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-950/6 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {prompt.prompt}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-bold text-white shadow-xl shadow-black/15 transition active:scale-[0.97] dark:bg-white dark:text-neutral-950"
            type="button"
            onClick={(event) => {
              stop(event);
              onCopy(prompt);
            }}
          >
            <Copy size={18} />
            Скопировать
          </button>
          <button
            aria-label="Поделиться"
            className="grid size-12 place-items-center rounded-full border border-black/8 bg-white/70 text-neutral-700 shadow-sm backdrop-blur-xl transition active:scale-90 dark:border-white/10 dark:bg-white/8 dark:text-white"
            type="button"
            onClick={(event) => {
              stop(event);
              onShare(prompt);
            }}
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
