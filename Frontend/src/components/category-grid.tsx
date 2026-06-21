import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { CategoryRecord } from "@/lib/api/types";
import { peripheralCategories } from "@/lib/constants/categories";

export function CategoryGrid({
  categories,
  limit,
}: {
  categories?: CategoryRecord[];
  limit?: number;
}) {
  const backendNames = new Map(categories?.map((item) => [item.id, item.name]));

  return (
    <div className="grid-4">
      {peripheralCategories.slice(0, limit).map((category) => {
        const Icon = category.icon;
        const name = backendNames.get(category.id) ?? category.name;

        return (
          <Link
            href={`/categories/${category.id}`}
            className="card category-card"
            key={category.id}
          >
            <span className="category-number">
              {String(category.id).padStart(2, "0")}
            </span>
            <div className="category-icon">
              <Icon size={27} />
            </div>
            <div>
              <h3>{name}</h3>
              <p>{category.summary}</p>
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
