"use client";

import { CircuitBoard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  function toggleSidebar(): void {
    onExpandedChange(!expanded);
  }

  return (
    <aside
      className={`peripheral-sidebar${expanded ? " expanded" : ""}`}
      aria-label="Peripheral categories"
    >
      <Link href="/" className="side-logo" aria-label="PeripheralsTalk home">
        <span className="logo-icon" aria-hidden="true">
          <CircuitBoard size={20} />
        </span>
        <strong className="side-label">PeripheralsTalk</strong>
      </Link>

      <button
        type="button"
        className="side-toggle"
        onClick={toggleSidebar}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse category sidebar" : "Expand category sidebar"}
        title={expanded ? "Collapse categories" : "Expand categories"}
      >
        {expanded ? (
          <PanelLeftClose size={20} aria-hidden="true" />
        ) : (
          <PanelLeftOpen size={20} aria-hidden="true" />
        )}
        <span className="side-label">
          {expanded ? "Collapse categories" : "Expand categories"}
        </span>
      </button>

      <nav className="side-list" aria-label="All peripheral categories">
        {peripheralCategories.map((category) => {
          const Icon = category.icon;
          const href = `/categories/${category.id}`;
          const active = pathname === href;

          return (
            <Link
              className={`side-link${active ? " active" : ""}`}
              key={category.id}
              href={href}
              title={category.name}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              <span className="side-label">{category.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="side-footer">
        <span className="side-label">14 structured categories</span>
      </div>
    </aside>
  );
}
