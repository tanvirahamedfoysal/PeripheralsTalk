import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";

import type { CategoryRecord } from "@/lib/api/types";
import { peripheralCategories } from "@/lib/constants/categories";

export function CategoryGrid({
  categories,
  limit,
}: {
  categories?: CategoryRecord[];
  limit?: number;
}) {
  const records = categories?.length
    ? [...categories].sort((a, b) => a.id - b.id)
    : peripheralCategories.map(({ id, name }) => ({ id, name }));
  const visible = typeof limit === "number" ? records.slice(0, limit) : records;

  return (
    <div className="grid-4">
      {visible.map((record, index) => {
        const documented = peripheralCategories.find((item) => item.id === record.id);
        const Icon = documented?.icon ?? Layers3;
        const summary =
          documented?.summary ??
          "Explore core ideas, practical examples and community learning resources.";

        return (
          <Link
            href={`/categories/${record.id}`}
            className="card category-card"
            key={record.id}
          >
            <span className="category-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="category-icon">
              <Icon size={27} />
            </div>
            <div>
              <h3>{record.name}</h3>
              <p>{summary}</p>
              <span className="category-explore">
                Explore <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
