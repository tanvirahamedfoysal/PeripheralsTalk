"use client";

import { useState } from "react";

import { PeripheralSidebar } from "./peripheral-sidebar";

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps): React.ReactElement {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <>
      <PeripheralSidebar
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <div className={`public-shell${sidebarExpanded ? " expanded" : ""}`}>
        {children}
      </div>
    </>
  );
}
