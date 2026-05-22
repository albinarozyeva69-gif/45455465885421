"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import {
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminCategories, normalizeTags } from "@/lib/categories";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  mapPromptRow,
  type PromptCardRow
} from "@/lib/supabase";
import { hapticTap } from "@/lib/utils";
import type { Prompt, PromptDraft } from "@/types/prompt";

const emptyDraft: PromptDraft = {
  title: "",
  category: "Midjourney",
  tags: "",
  prompt: "",
  imageFile: null,
  imageUrl: ""
};

function fileNameSafe(file: File) {
  const extension = file.name.split(".").pop() || "jpg";
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`.toLowerCase();
}

export function AdminDashboard() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    isSupabaseConfigured
      ? "Войдите один раз. Сессия сохранится на этом устройстве."
      : "Подключите Supabase для реальных загрузок."
  );
  const [draft, setDraft] = useState<PromptDraft>(emptyDraft);
  const [items, setItems] = useState<Prompt[]>([]);

  const imagePreview = useMemo(() => {
    if (draft.imageFile) {
      return URL.createObjectURL(draft.imageFile);
    }

    return draft.imageUrl || "";
  }, [draft.imageFile, draft.imageUrl]);

  const refresh = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("prompt_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems((data as PromptCardRow[]).map(mapPromptRow));
    }
  }, [supabase]);

  const ensureAdminAccess = useCallback(async () => {
    if (!supabase) {
      return true;
    }

    const { data, error } = await supabase.rpc("claim_first_admin");

    if (error) {
      setMessage("Не удалось проверить доступ администратора.");
      return false;
    }

    if (!data) {
      setMessage("Этот аккаунт не администратор. Войдите под владельцем проекта.");
      return false;
    }

    setMessage("Вы вошли. Можно добавлять промпты.");
    await refresh();
    return true;
  }, [refresh, supabase]);

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setSignedIn(false);
        setAuthChecked(true);
        return;
      }

      const allowed = await ensureAdminAccess();
      setSignedIn(allowed);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!session) {
          setSignedIn(false);
          setAuthChecked(true);
          return;
        }

        const allowed = await ensureAdminAccess();
        setSignedIn(allowed);
        setAuthChecked(true);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, [ensureAdminAccess, supabase]);

  async function signIn() {
    if (!supabase) {
      setSignedIn(true);
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setBusy(false);
      setMessage("Не удалось войти. Проверьте почту и пароль.");
      return;
    }

    const allowed = await ensureAdminAccess();
    setSignedIn(allowed);
    setBusy(false);
    hapticTap();
  }

  async function signUp() {
    if (!supabase) {
      setSignedIn(true);
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);

    if (error) {
      setMessage("Не удалось создать аккаунт. Проверьте почту и пароль.");
      return;
    }

    if (data.session) {
      const allowed = await ensureAdminAccess();
      setSignedIn(allowed);
    } else {
      setMessage("Аккаунт создан. Проверьте почту и подтвердите вход.");
    }

    hapticTap();
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSignedIn(!isSupabaseConfigured);
    setMessage("Вы вышли из админки.");
  }

  function editPrompt(prompt: Prompt) {
    setDraft({
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      tags: prompt.tags.join(", "),
      prompt: prompt.prompt,
      imageUrl: prompt.imageUrl,
      imageFile: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage() {
    if (!draft.imageFile) {
      return draft.imageUrl || "";
    }

    if (!supabase) {
      return URL.createObjectURL(draft.imageFile);
    }

    const path = fileNameSafe(draft.imageFile);
    const { error } = await supabase.storage
      .from("prompt-images")
      .upload(path, draft.imageFile, {
        cacheControl: "31536000",
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("prompt-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function savePrompt() {
    if (!draft.title.trim() || !draft.prompt.trim()) {
      setMessage("Добавьте название и текст промпта.");
      return;
    }

    if (!draft.imageFile && !draft.imageUrl) {
      setMessage("Добавьте изображение для карточки.");
      return;
    }

    setBusy(true);
    setMessage("Сохраняем промпт...");

    try {
      const imageUrl = await uploadImage();
      const tags = normalizeTags(draft.tags);

      if (supabase) {
        const { error } = await supabase.rpc("upsert_prompt_with_tags", {
          p_prompt_id: draft.id || null,
          p_title: draft.title.trim(),
          p_prompt_text: draft.prompt.trim(),
          p_category_name: draft.category,
          p_tags: tags.length ? tags : ["кино"],
          p_image_url: imageUrl,
          p_is_featured: false
        });

        if (error) {
          throw error;
        }

        await refresh();
      } else {
        const localPrompt: Prompt = {
          id: draft.id || `local-${Date.now()}`,
          title: draft.title.trim(),
          category: draft.category,
          tags: tags.length ? tags : ["кино"],
          tagSlugs: ["cinematic"],
          prompt: draft.prompt.trim(),
          imageUrl,
          copyCount: 0,
          favoriteCount: 0,
          createdAt: new Date().toISOString(),
          isNew: true
        };

        setItems((current) =>
          draft.id
            ? current.map((item) => (item.id === draft.id ? localPrompt : item))
            : [localPrompt, ...current]
        );
      }

      setDraft(emptyDraft);
      setMessage("Промпт сохранён.");
      hapticTap();
    } catch {
      setMessage("Не удалось сохранить. Проверьте права Supabase и Storage.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePrompt(prompt: Prompt) {
    const confirmed = window.confirm("Удалить этот промпт?");

    if (!confirmed) {
      return;
    }

    setBusy(true);

    if (supabase) {
      const { error } = await supabase.from("prompts").delete().eq("id", prompt.id);
      if (error) {
        setMessage("Удаление не выполнено. Проверьте права администратора.");
      } else {
        await refresh();
        setMessage("Промпт удалён.");
      }
    } else {
      setItems((current) => current.filter((item) => item.id !== prompt.id));
      setMessage("Промпт удалён в демо-режиме.");
    }

    setBusy(false);
    hapticTap();
  }

  if (!authChecked) {
    return (
      <main className="grid min-h-svh place-items-center px-5 py-10">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="animate-spin text-neutral-500" size={34} />
          <p className="mt-4 text-sm font-bold text-neutral-500 dark:text-neutral-400">
            Проверяем вход
          </p>
        </div>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="grid min-h-svh place-items-center px-5 py-10">
        <section className="w-full max-w-sm rounded-[2rem] border border-black/8 bg-white/72 p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/8">
          <div className="grid size-14 place-items-center rounded-[1.2rem] bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Upload size={24} />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight">
            {authMode === "sign-in" ? "Вход в админку" : "Создать аккаунт"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            {authMode === "sign-in"
              ? "Войдите и сразу добавляйте промпты без повторного выхода."
              : "Создайте аккаунт владельца. Первый аккаунт станет админом автоматически."}
          </p>
          <div className="mt-5 grid gap-3">
            <input
              className="h-[52px] rounded-2xl border border-black/10 bg-white/80 px-4 text-base outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
              placeholder="Почта"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="h-[52px] rounded-2xl border border-black/10 bg-white/80 px-4 text-base outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 text-base font-bold text-white shadow-xl shadow-black/14 transition active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-950"
              disabled={busy}
              type="button"
              onClick={authMode === "sign-in" ? signIn : signUp}
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : null}
              {authMode === "sign-in" ? "Войти и добавлять" : "Создать аккаунт"}
            </button>
            <button
              className="h-11 rounded-2xl border border-black/10 bg-white/65 px-4 text-sm font-bold text-neutral-700 transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8 dark:text-neutral-200"
              type="button"
              onClick={() =>
                setAuthMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"))
              }
            >
              {authMode === "sign-in" ? "Нужен новый аккаунт" : "У меня уже есть аккаунт"}
            </button>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh px-5 pb-12 pt-[calc(env(safe-area-inset-top)+18px)] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
              Админ-панель
            </p>
            <h1 className="text-3xl font-black tracking-tight">Быстрое добавление</h1>
          </div>
          <button
            aria-label="Выйти"
            className="grid size-12 place-items-center rounded-full border border-black/10 bg-white/70 shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/10 dark:bg-white/8"
            type="button"
            onClick={signOut}
          >
            <LogOut size={19} />
          </button>
        </header>

        <motion.section
          className="mt-6 rounded-[2rem] border border-black/8 bg-white/70 p-4 shadow-2xl shadow-black/8 backdrop-blur-2xl dark:border-white/10 dark:bg-white/8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <label className="relative grid min-h-72 cursor-pointer place-items-center overflow-hidden rounded-[1.55rem] border border-dashed border-black/16 bg-neutral-950/5 text-center transition hover:bg-neutral-950/8 dark:border-white/16 dark:bg-white/6">
              {imagePreview ? (
                <img
                  alt="Предпросмотр изображения"
                  className="absolute inset-0 h-full w-full object-cover"
                  src={imagePreview}
                />
              ) : null}
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    imageFile: event.target.files?.[0] ?? null
                  }))
                }
              />
              <span className="relative z-10 rounded-full bg-white/80 px-4 py-3 text-sm font-bold text-neutral-950 shadow-lg backdrop-blur-2xl dark:bg-neutral-950/70 dark:text-white">
                <ImagePlus className="mr-2 inline" size={17} />
                Загрузить изображение
              </span>
            </label>

            <div className="grid gap-3">
              <input
                className="h-[52px] rounded-2xl border border-black/10 bg-white/82 px-4 text-base font-semibold outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
                placeholder="Название"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
              <select
                className="h-[52px] rounded-2xl border border-black/10 bg-white/82 px-4 text-base font-semibold outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value }))
                }
              >
                {adminCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                className="h-[52px] rounded-2xl border border-black/10 bg-white/82 px-4 text-base font-semibold outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
                placeholder="Теги через запятую: кино, реализм, люкс"
                value={draft.tags}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, tags: event.target.value }))
                }
              />
              <textarea
                className="min-h-40 resize-none rounded-2xl border border-black/10 bg-white/82 px-4 py-4 text-base leading-7 outline-none transition focus:border-neutral-950 dark:border-white/10 dark:bg-white/8 dark:focus:border-white"
                placeholder="Текст промпта"
                value={draft.prompt}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, prompt: event.target.value }))
                }
              />
              <button
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 text-base font-black text-white shadow-xl shadow-black/14 transition active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-950"
                disabled={busy}
                type="button"
                onClick={savePrompt}
              >
                {busy ? <Loader2 className="animate-spin" size={19} /> : draft.id ? <Save size={19} /> : <Plus size={19} />}
                {draft.id ? "Сохранить изменения" : "Добавить промпт"}
              </button>
              <p className="text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {message}
              </p>
            </div>
          </div>
        </motion.section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Все промпты</h2>
            <span className="rounded-full bg-neutral-950/6 px-3 py-1.5 text-xs font-bold text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
              {items.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {items.length ? (
              items.map((prompt) => (
                <article
                  key={prompt.id}
                  className="grid grid-cols-[76px_1fr] gap-3 rounded-[1.5rem] border border-black/8 bg-white/66 p-2 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/8 dark:bg-white/8"
                >
                  <img
                    alt={prompt.title}
                    className="size-[76px] rounded-[1.1rem] object-cover"
                    src={prompt.imageUrl}
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-base font-black">{prompt.title}</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                      {prompt.category} · {prompt.tags.slice(0, 3).join(", ")}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-3 text-sm font-bold text-white dark:bg-white dark:text-neutral-950"
                        type="button"
                        onClick={() => editPrompt(prompt)}
                      >
                        <Pencil size={16} />
                        Изменить
                      </button>
                      <button
                        aria-label="Удалить"
                        className="grid size-10 place-items-center rounded-full bg-rose-500 text-white"
                        type="button"
                        onClick={() => deletePrompt(prompt)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-black/8 bg-white/58 p-6 text-center shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/8 dark:bg-white/8">
                <p className="text-lg font-black">Промптов пока нет</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  Загрузите изображение, заполните поля выше и нажмите “Добавить промпт”.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
