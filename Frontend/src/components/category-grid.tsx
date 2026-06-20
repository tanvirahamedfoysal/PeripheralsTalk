import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { peripheralCategories } from "@/lib/constants/categories";
export function CategoryGrid({ limit }: { limit?: number }) {
  return (
    <div className="grid-4">
      {peripheralCategories.slice(0, limit).map((c) => {
        const Icon = c.icon;
        return (
          <Link href={`/categories/${c.id}`} className="card category-card" key={c.id}>
            <span className="category-number">{String(c.id).padStart(2, "0")}</span>
            <div className="category-icon">
              <Icon size={27} />
            </div>
            <div>
              <h3>{c.name}</h3>
              <p>{c.summary}</p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 18,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--teal)",
                }}
              >
                Explore <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
