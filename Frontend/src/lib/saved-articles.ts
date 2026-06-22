import { extractArticleTitle } from "./article-document";
import type { ArticleRecord } from "./api/types";

export const SAVED_ARTICLES_EVENT = "peripheralstalk:saved-articles-updated";

export interface SavedArticle {
  id: number;
  peripheralId: number;
  title: string;
  author: string;
  savedAt: number;
}

function storageKey(userId: string): string {
  return `peripheralstalk:saved-articles:${userId}`;
}

export function getSavedArticles(userId: string): SavedArticle[] {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    const parsed = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is SavedArticle => {
        if (!item || typeof item !== "object") return false;
        const value = item as Partial<SavedArticle>;
        return (
          typeof value.id === "number" &&
          typeof value.peripheralId === "number" &&
          typeof value.title === "string" &&
          typeof value.author === "string" &&
          typeof value.savedAt === "number"
        );
      })
      .sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function isArticleSaved(userId: string, articleId: number): boolean {
  return getSavedArticles(userId).some((article) => article.id === articleId);
}

export function saveArticleForDashboard(userId: string, article: ArticleRecord): void {
  if (typeof window === "undefined" || !userId) return;

  const saved: SavedArticle = {
    id: article.id,
    peripheralId: article.peripheral_id,
    title: extractArticleTitle(article.content, `Article #${article.id}`),
    author: article.author_username || "Contributor",
    savedAt: Date.now(),
  };

  const next = [
    saved,
    ...getSavedArticles(userId).filter((item) => item.id !== article.id),
  ];

  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SAVED_ARTICLES_EVENT));
}

export function removeArticleFromDashboard(userId: string, articleId: number): void {
  if (typeof window === "undefined" || !userId) return;

  const next = getSavedArticles(userId).filter((article) => article.id !== articleId);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SAVED_ARTICLES_EVENT));
}
