import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Prompt, PromptTagSlug } from "@/types/prompt";
import { labelsFromSlugs } from "@/lib/categories";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://sdxomyezmrbxxwpkaqfn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_asWOmJLZ85F1IWNFS_7KTw_KnqYI650";

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return client;
}

export type PromptCardRow = {
  id: string;
  title: string;
  category: string;
  tags: string[] | null;
  tag_slugs: string[] | null;
  prompt_text: string;
  image_url: string;
  copy_count: number | null;
  favorite_count: number | null;
  created_at: string;
  is_featured: boolean | null;
};

export function mapPromptRow(row: PromptCardRow): Prompt {
  const slugs = (row.tag_slugs ?? []) as PromptTagSlug[];

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: row.tags?.length ? row.tags : labelsFromSlugs(slugs),
    tagSlugs: slugs,
    prompt: row.prompt_text,
    imageUrl: row.image_url,
    copyCount: row.copy_count ?? 0,
    favoriteCount: row.favorite_count ?? 0,
    createdAt: row.created_at,
    featured: Boolean(row.is_featured),
    isNew: Date.now() - new Date(row.created_at).getTime() < 1000 * 60 * 60 * 48
  };
}
