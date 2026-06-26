export interface MathJaxRuntime {
  startup?: {
    promise?: Promise<unknown>;
  };
  typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
  typesetClear?: (elements?: HTMLElement[]) => void;
}

declare global {
  interface Window {
    MathJax?: MathJaxRuntime & Record<string, unknown>;
  }
}

function sourceFor(latex: string, display: boolean): string {
  return display ? `\\[${latex}\\]` : `\\(${latex}\\)`;
}

export function restoreMathSources(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>("[data-latex]").forEach((node) => {
    const latex = node.dataset.latex ?? "";
    const display = node.dataset.display === "block";
    node.textContent = sourceFor(latex, display);
  });
}

export function serializeEditorHtml(editor: HTMLElement): string {
  const clone = editor.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("[data-editor-insertion-marker='true']")
    .forEach((node) => node.remove());
  restoreMathSources(clone);
  return clone.innerHTML;
}

async function waitForMathJax(timeoutMs = 8000): Promise<MathJaxRuntime | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const runtime = window.MathJax;
    if (runtime?.typesetPromise) return runtime;
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }

  return null;
}

export async function typesetMath(root: HTMLElement): Promise<void> {
  if (typeof window === "undefined") return;

  const runtime = await waitForMathJax();
  if (!runtime?.typesetPromise || !root.isConnected) return;

  try {
    await runtime.startup?.promise;
    runtime.typesetClear?.([root]);
    restoreMathSources(root);
    await runtime.typesetPromise([root]);
  } catch {
    // Keep the original LaTeX source visible when MathJax cannot render it.
  }
}
