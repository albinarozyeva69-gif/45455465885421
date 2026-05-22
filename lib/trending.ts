import type { Prompt } from "@/types/prompt";

export function calculateTrendScore(prompt: Prompt) {
  const created = new Date(prompt.createdAt).getTime();
  const ageHours = Math.max(1, (Date.now() - created) / 1000 / 60 / 60);
  const velocity = prompt.copyCount * 2.4 + prompt.favoriteCount * 1.2;
  const freshness = Math.max(0, 60 - ageHours / 8);
  const editorialBoost = prompt.featured ? 35 : 0;

  return velocity + freshness + editorialBoost;
}

export function sortByTrending(prompts: Prompt[]) {
  return [...prompts].sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a));
}
