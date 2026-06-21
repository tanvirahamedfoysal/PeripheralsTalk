"use client";

import { CircuitBoard, PanelLeftOpen } from "lucide-react";
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
        <span className="side-label">14 structured learning topics</span>
      </div>
    </aside>
  );
}
