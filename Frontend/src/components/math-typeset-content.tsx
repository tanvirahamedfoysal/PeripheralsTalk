"use client";

import { useEffect, useRef } from "react";

import { typesetMath } from "@/lib/mathjax";

export function MathTypesetContent({
  className,
  html,
}: {
  className: string;
  html: string;
}): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root) void typesetMath(root);
  }, [html]);

  return (
    <div
      ref={rootRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
