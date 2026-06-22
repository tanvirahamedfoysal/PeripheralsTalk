import type { ArticleRecord } from "@/lib/api/types";

import { extractArticleTitle } from "./article-document";

const STORAGE_KEY = "peripheralstalk:recent-articles";
const MAX_RECENT_ARTICLES = 6;

export interface RecentArticle {
  id: number;
  peripheralId: number;
  title: string;
  author: string;
  createdAt: string;
  openedAt: number;
}

export function getRecentArticles(): RecentArticle[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is RecentArticle => {
        if (!item || typeof item !== "object") return false;
        const value = item as Partial<RecentArticle>;
        return (
          typeof value.id === "number" &&
          typeof value.peripheralId === "number" &&
          typeof value.title === "string" &&
          typeof value.author === "string" &&
          typeof value.createdAt === "string" &&
          typeof value.openedAt === "number"
        );
      })
      .sort((a, b) => b.openedAt - a.openedAt)
      .slice(0, MAX_RECENT_ARTICLES);
  } catch {
    return [];
  }
}

export function rememberArticle(article: ArticleRecord): void {
  if (typeof window === "undefined") return;

  const next: RecentArticle = {
    id: article.id,
    peripheralId: article.peripheral_id,
    title: extractArticleTitle(article.content, `Article #${article.id}`),
    author: article.author_username,
    createdAt: article.created_at,
    openedAt: Date.now(),
  };

  const records = [
    next,
    ...getRecentArticles().filter((item) => item.id !== next.id),
  ].slice(0, MAX_RECENT_ARTICLES);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("peripheralstalk:recent-articles-updated"));
}
