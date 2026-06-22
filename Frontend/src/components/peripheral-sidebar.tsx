"use client";

import { CircuitBoard, Layers3, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";
import { CATEGORY_UPDATE_EVENT } from "@/lib/category-events";
import { peripheralCategories } from "@/lib/constants/categories";

interface PeripheralSidebarProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function PeripheralSidebar({
  expanded,
  onExpandedChange,
}: PeripheralSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const [liveCategories, setLiveCategories] = useState<CategoryRecord[] | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      setLiveCategories([...(response.data ?? [])].sort((a, b) => a.id - b.id));
    } catch {
      setLiveCategories(null);
    }
  }, []);

  useEffect(() => {
    void loadCategories();

    const refresh = () => void loadCategories();
    window.addEventListener(CATEGORY_UPDATE_EVENT, refresh);
    return () => window.removeEventListener(CATEGORY_UPDATE_EVENT, refresh);
  }, [loadCategories]);

  const categories = useMemo(() => {
    const records =
      liveCategories ?? peripheralCategories.map(({ id, name }) => ({ id, name }));

    return records.map((record, index) => {
      const documented = peripheralCategories.find((item) => item.id === record.id);
      return {
        id: record.id,
        name: record.name,
        position: index + 1,
        icon: documented?.icon ?? Layers3,
      };
    });
  }, [liveCategories]);

  function handleBlur(event: React.FocusEvent<HTMLElement>): void {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      onExpandedChange(false);
    }
  }

  return (
    <aside
      className={`peripheral-sidebar${expanded ? " expanded" : ""}`}
      aria-label="Peripheral categories"
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
      onFocusCapture={() => onExpandedChange(true)}
      onBlurCapture={handleBlur}
    >
      <Link href="/" className="side-logo" aria-label="PeripheralsTalk home">
        <span className="logo-icon" aria-hidden="true">
          <CircuitBoard size={20} />
        </span>
        <strong className="side-label">PeripheralsTalk</strong>
      </Link>

      <div className="side-toggle" aria-hidden="true">
        <PanelLeftOpen size={20} />
        <span className="side-label">Browse peripheral topics</span>
      </div>

      <nav className="side-list" aria-label="All peripheral categories">
        {categories.map((category) => {
          const Icon = category.icon;
          const href = `/categories/${category.id}`;
          const active = pathname === href;

          return (
            <Link
              className={`side-link${active ? " active" : ""}`}
              key={category.id}
              href={href}
              title={`${category.position}. ${category.name}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              <span className="side-label">
                <span className="side-category-number">
                  {String(category.position).padStart(2, "0")}
                </span>
                {category.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="side-footer">
        <span className="side-label">
          {categories.length} structured learning topics
        </span>
      </div>
    </aside>
  );
}
