"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSupabaseClient,
  mapPromptRow,
  type PromptCardRow
} from "@/lib/supabase";
import { sortByTrending } from "@/lib/trending";
import type { Prompt } from "@/types/prompt";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"empty" | "supabase">("empty");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 520));

      try {
        const supabase = getSupabaseClient();

        if (supabase) {
          const { data, error } = await supabase
            .from("prompt_cards")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && data && !cancelled) {
            setPrompts((data as PromptCardRow[]).map(mapPromptRow));
            setSource("supabase");
          }
        }
      } finally {
        await minimumDelay;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const incrementCopy = useCallback(async (id: string) => {
    setPrompts((items) =>
      items.map((item) =>
        item.id === id ? { ...item, copyCount: item.copyCount + 1 } : item
      )
    );

    if (source === "supabase") {
      const supabase = getSupabaseClient();
      await supabase?.rpc("increment_prompt_copies", { prompt_id: id });
    }
  }, [source]);

  const trending = useMemo(() => sortByTrending(prompts), [prompts]);

  return {
    prompts,
    trending,
    isLoading,
    source,
    incrementCopy
  };
}
