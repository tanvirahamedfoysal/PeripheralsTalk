"use client";

import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { CategoryRecord } from "@/lib/api/types";

export function HomeTopicFinder({
  categories,
}: {
  categories: CategoryRecord[];
}): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const matches = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    if (!normalized) return sorted.slice(0, 6);
    return sorted
      .filter(
        (category) =>
          category.name.toLowerCase().includes(normalized) ||
          String(category.id) === normalized,
      )
      .slice(0, 6);
  }, [categories, normalized]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const first = matches[0];
    if (first) router.push(`/categories/${first.id}`);
  }

  return (
    <div className="home-topic-finder">
      <form className="home-topic-search" onSubmit={submit}>
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a peripheral, category name or category ID"
          aria-label="Search learning topics"
        />
        {query ? (
          <button
            type="button"
            className="home-search-clear"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <X size={16} />
          </button>
        ) : null}
        <button className="home-search-submit" type="submit" disabled={!matches[0]}>
          Open topic <ArrowRight size={16} />
        </button>
      </form>

      <div className="home-topic-results" aria-live="polite">
        {matches.length > 0 ? (
          matches.map((category, index) => (
            <Link href={`/categories/${category.id}`} key={category.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{category.name}</b>
              <ArrowRight size={15} />
            </Link>
          ))
        ) : (
          <p>
            No category matches “{query}”. Browse the complete directory to see every
            learning topic.
          </p>
        )}
      </div>
    </div>
  );
}
