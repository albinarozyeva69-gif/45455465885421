export type PromptTagSlug =
  | "cinematic"
  | "realistic"
  | "dark"
  | "neon"
  | "luxury"
  | "anime"
  | "iphone"
  | "fashion"
  | "cyberpunk"
  | "viral";

export type Prompt = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  tagSlugs: PromptTagSlug[];
  prompt: string;
  imageUrl: string;
  copyCount: number;
  favoriteCount: number;
  createdAt: string;
  featured?: boolean;
  isNew?: boolean;
};

export type PromptDraft = {
  id?: string;
  title: string;
  category: string;
  tags: string;
  prompt: string;
  imageFile?: File | null;
  imageUrl?: string;
};

export type ToastState = {
  id: number;
  message: string;
};
