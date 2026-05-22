"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { CategoryRail } from "@/components/CategoryRail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PromptCard } from "@/components/PromptCard";
import { PromptModal } from "@/components/PromptModal";
import { SearchOverlay } from "@/components/SearchOverlay";
import { SkeletonGrid } from "@/components/SkeletonGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toast } from "@/components/Toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePrompts } from "@/hooks/usePrompts";
import { hapticTap } from "@/lib/utils";
import type { Prompt, ToastState } from "@/types/prompt";

function promptMatches(prompt: Prompt, query: string, category: string) {
  const inCategory = category === "Все" || prompt.category === category;
  const normalized = query.trim().toLowerCase();

  if (!inCategory) {
    return false;
  }

  if (!normalized) {
    return true;
  }

  return [
    prompt.title,
    prompt.category,
    prompt.prompt,
    ...prompt.tags,
    ...prompt.tagSlugs
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function copyTextFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function AppShell() {
  const { prompts, trending, isLoading, incrementCopy } = usePrompts();
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "prompt-gallery-favorites",
    []
  );
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [toast, setToast] = useState<ToastState | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 1400);
  }, []);

  const copyPrompt = useCallback(
    async (prompt: Prompt) => {
      try {
        await navigator.clipboard.writeText(prompt.prompt);
      } catch {
        copyTextFallback(prompt.prompt);
      }

      hapticTap();
      showToast("Скопировано");
      incrementCopy(prompt.id);
    },
    [incrementCopy, showToast]
  );

  const sharePrompt = useCallback(
    async (prompt: Prompt) => {
      const shareText = `${prompt.title}\n\n${prompt.prompt}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: prompt.title,
            text: shareText
          });
          hapticTap();
          return;
        } catch {
          return;
        }
      }

      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        copyTextFallback(shareText);
      }

      hapticTap();
      showToast("Готово для отправки");
    },
    [showToast]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((current) =>
        current.includes(id)
          ? current.filter((favoriteId) => favoriteId !== id)
          : [...current, id]
      );
      hapticTap();
    },
    [setFavorites]
  );

  const tabPrompts = useMemo(() => {
    if (activeTab === "popular") {
      return trending;
    }

    if (activeTab === "profile") {
      return prompts.filter((prompt) => favorites.includes(prompt.id));
    }

    return prompts;
  }, [activeTab, favorites, prompts, trending]);

  const filteredPrompts = useMemo(
    () => tabPrompts.filter((prompt) => promptMatches(prompt, query, activeCategory)),
    [activeCategory, query, tabPrompts]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return trending.slice(0, 8);
    }

    return prompts.filter((prompt) => promptMatches(prompt, query, "Все")).slice(0, 12);
  }, [prompts, query, trending]);

  const newPrompts = useMemo(
    () =>
      [...prompts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [prompts]
  );

  const visiblePrompts = filteredPrompts.slice(0, visibleCount);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + 6, filteredPrompts.length));
        }
      },
      { rootMargin: "480px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filteredPrompts.length]);

  const title =
    activeTab === "profile"
      ? "Избранное"
      : activeTab === "popular"
        ? "Популярное"
        : activeCategory === "Все"
          ? "Все промпты"
          : activeCategory;

  return (
    <>
      <LoadingScreen show={isLoading} />
      <div className="min-h-svh pb-28 text-neutral-950 dark:text-white">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--page-soft)]/86 pt-[env(safe-area-inset-top)] backdrop-blur-2xl dark:border-white/8">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 sm:px-8">
            <button
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              type="button"
              onClick={() => {
                setActiveTab("home");
                setActiveCategory("Все");
              }}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-[1.05rem] bg-neutral-950 text-white shadow-lg shadow-black/15 dark:bg-white dark:text-neutral-950">
                <Sparkles size={20} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-black tracking-tight">
                  Промпт Галерея
                </span>
                <span className="block truncate text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Быстро копируйте идеи для AI
                </span>
              </span>
            </button>
            <button
              aria-label="Открыть поиск"
              className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/65 text-neutral-900 shadow-sm backdrop-blur-2xl transition active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white"
              type="button"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </button>
            <ThemeToggle />
          </div>
          <CategoryRail
            activeCategory={activeCategory}
            onSelect={(category) => {
              setActiveCategory(category);
              setActiveTab("categories");
            }}
          />
        </header>

        <main className="mx-auto max-w-7xl">
          <section className="px-5 pb-2 pt-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                  Популярное
                </p>
                <h1 className="mt-1 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                  Промпты, которые хочется открыть сразу.
                </h1>
              </div>
              <button
                className="hidden rounded-full border border-black/10 bg-white/65 px-4 py-2 text-sm font-bold shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/10 dark:bg-white/10 sm:block"
                type="button"
                onClick={() => setActiveTab("popular")}
              >
                Смотреть всё
              </button>
            </div>
          </section>

          <section aria-label="Популярное" className="no-scrollbar flex gap-3 overflow-x-auto px-5 py-4 sm:px-8">
            {trending.slice(0, 6).map((prompt, index) => (
              <button
                key={prompt.id}
                className="group relative h-48 w-36 shrink-0 overflow-hidden rounded-[1.5rem] text-left shadow-xl shadow-black/12 transition active:scale-[0.98] sm:h-56 sm:w-44"
                type="button"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <Image
                  alt={prompt.title}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  priority={index < 6}
                  sizes="176px"
                  src={prompt.imageUrl}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/8 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="line-clamp-2 text-sm font-black">{prompt.title}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-white/76">
                    {prompt.category}
                  </span>
                </span>
              </button>
            ))}
          </section>

          <section className="px-5 py-3 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                  Новое
                </p>
                <h2 className="text-2xl font-black tracking-tight">Свежие добавления</h2>
              </div>
              <Link
                className="flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/12 transition active:scale-95 dark:bg-white dark:text-neutral-950"
                href="/admin"
              >
                <ShieldCheck size={16} />
                Админка
              </Link>
            </div>
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
              {newPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="shrink-0 rounded-full border border-black/8 bg-white/62 px-4 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/10 dark:bg-white/8"
                  type="button"
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  {prompt.title}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 py-3 sm:px-8">
            <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
              Категории
            </p>
            <h2 className="text-2xl font-black tracking-tight">Выберите настроение</h2>
          </section>

          <section className="px-5 pb-4 pt-2 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                  {activeTab === "profile" ? "Профиль" : "Галерея"}
                </p>
                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
              </div>
              <p className="rounded-full bg-neutral-950/6 px-3 py-1.5 text-xs font-bold text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
                {filteredPrompts.length} карточек
              </p>
            </div>
          </section>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <SkeletonGrid key="skeleton" />
            ) : visiblePrompts.length ? (
              <motion.section
                key="grid"
                className="columns-1 gap-4 px-5 sm:columns-2 sm:px-8 lg:columns-3 xl:columns-4"
                layout
              >
                {visiblePrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    favorite={favorites.includes(prompt.id)}
                    prompt={prompt}
                    onCopy={copyPrompt}
                    onFavorite={toggleFavorite}
                    onOpen={setSelectedPrompt}
                    onShare={sharePrompt}
                  />
                ))}
              </motion.section>
            ) : (
              <motion.section
                key="empty"
                animate={{ opacity: 1, y: 0 }}
                className="px-5 py-10 sm:px-8"
                exit={{ opacity: 0, y: 10 }}
                initial={{ opacity: 0, y: 10 }}
              >
                <div className="rounded-[2rem] border border-black/8 bg-white/58 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-2xl dark:border-white/8 dark:bg-white/8">
                  <p className="text-2xl font-black">
                    {activeTab === "profile" ? "Избранное пока пустое" : "Промпты не найдены"}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {activeTab === "profile"
                      ? "Добавляйте лучшие карточки сердцем, чтобы быстро вернуться к ним позже."
                      : "Смените категорию или попробуйте другой поисковый запрос."}
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div ref={sentinelRef} className="h-12" />
        </main>

        <BottomNav
          activeTab={activeTab}
          favoriteCount={favorites.length}
          onChange={(tab) => {
            setActiveTab(tab);
            if (tab === "home" || tab === "popular" || tab === "profile") {
              setActiveCategory("Все");
            }
          }}
        />
      </div>

      <SearchOverlay
        open={searchOpen}
        query={query}
        results={searchResults}
        onClose={() => setSearchOpen(false)}
        onCopy={copyPrompt}
        onOpen={setSelectedPrompt}
        onQueryChange={setQuery}
      />
      <PromptModal
        favorites={favorites}
        prompt={selectedPrompt}
        prompts={prompts}
        onClose={() => setSelectedPrompt(null)}
        onCopy={copyPrompt}
        onFavorite={toggleFavorite}
        onOpen={setSelectedPrompt}
        onShare={sharePrompt}
      />
      <Toast toast={toast} />
    </>
  );
}
