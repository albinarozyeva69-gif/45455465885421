import type { PromptTagSlug } from "@/types/prompt";

export const categories = [
  "Все",
  "Midjourney",
  "ChatGPT",
  "Leonardo AI",
  "Flux",
  "Видео",
  "Фото",
  "Реклама",
  "Кино",
  "Реализм",
  "Аниме",
  "TikTok",
  "YouTube",
  "Маркетинг",
  "Бизнес",
  "Синематик"
] as const;

export const adminCategories = categories.filter((category) => category !== "Все");

export const tagLabels: Record<PromptTagSlug, string> = {
  cinematic: "кино",
  realistic: "реализм",
  dark: "тёмный",
  neon: "неон",
  luxury: "люкс",
  anime: "аниме",
  iphone: "айфон",
  fashion: "мода",
  cyberpunk: "киберпанк",
  viral: "вирусное"
};

export const tagSlugs = Object.keys(tagLabels) as PromptTagSlug[];

export function normalizeTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function labelsFromSlugs(slugs: string[]) {
  return slugs.map((slug) => tagLabels[slug as PromptTagSlug] ?? slug);
}
