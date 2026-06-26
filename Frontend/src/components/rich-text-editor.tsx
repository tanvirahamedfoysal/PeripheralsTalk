"use client";

import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  LoaderCircle,
  Pilcrow,
  Sigma,
  Table2,
  Underline,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { UploadImageResponse } from "@/lib/api/types";
import { serializeEditorHtml, typesetMath } from "@/lib/mathjax";

interface RichTextEditorProps {
  title: string;
  bodyHtml: string;
  disabled?: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

type EquationMode = "inline" | "display";

export function RichTextEditor({
  title,
  bodyHtml,
  disabled = false,
  onTitleChange,
  onBodyChange,
}: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const insertionMarkerRef = useRef<HTMLSpanElement | null>(null);
  const lastSyncedHtmlRef = useRef("");
  const equationPreviewRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableColumns, setTableColumns] = useState("3");
  const [equationDialogOpen, setEquationDialogOpen] = useState(false);
  const [equationSource, setEquationSource] = useState("E = mc^2");
  const [equationMode, setEquationMode] = useState<EquationMode>("display");

  useEffect(() => {
    return () => {
      insertionMarkerRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || bodyHtml === lastSyncedHtmlRef.current) return;

    editor.innerHTML = bodyHtml;
    lastSyncedHtmlRef.current = bodyHtml;
    void typesetMath(editor);
  }, [bodyHtml]);

  useEffect(() => {
    const preview = equationPreviewRef.current;
    if (!preview || !equationDialogOpen) return;

    preview.replaceChildren();
    const formula = document.createElement(
      equationMode === "display" ? "div" : "span",
    );
    formula.className = `pt-latex pt-latex-${equationMode}`;
    formula.dataset.latex = equationSource || "E = mc^2";
    formula.dataset.display = equationMode === "display" ? "block" : "inline";
    formula.textContent =
      equationMode === "display"
        ? `\\[${formula.dataset.latex}\\]`
        : `\\(${formula.dataset.latex}\\)`;
    preview.append(formula);
    void typesetMath(preview);
  }, [equationDialogOpen, equationMode, equationSource]);

  function currentEditorHtml(): string {
    const editor = editorRef.current;
    return editor ? serializeEditorHtml(editor) : "";
  }

  function syncContent(): void {
    const html = currentEditorHtml();
    lastSyncedHtmlRef.current = html;
    onBodyChange(html);
  }

  function saveSelection(): void {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  }

  function restoreSelection(): void {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    editor.focus();
    selection.removeAllRanges();

    if (
      savedSelectionRef.current &&
      editor.contains(savedSelectionRef.current.commonAncestorContainer)
    ) {
      selection.addRange(savedSelectionRef.current);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }

  function execute(command: string, value?: string): void {
    if (disabled) return;
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncContent();
  }

  function preventToolbarBlur(event: MouseEvent<HTMLButtonElement>): void {
    saveSelection();
    event.preventDefault();
  }

  function createInsertionMarker(): void {
    const editor = editorRef.current;
    if (!editor) return;

    insertionMarkerRef.current?.remove();

    const marker = document.createElement("span");
    marker.dataset.editorInsertionMarker = "true";
    marker.setAttribute("aria-hidden", "true");
    marker.style.display = "inline-block";
    marker.style.width = "0";
    marker.style.height = "1em";
    marker.style.overflow = "hidden";
    marker.textContent = "\u200B";

    const savedRange = savedSelectionRef.current;
    const range = document.createRange();

    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      range.setStart(savedRange.startContainer, savedRange.startOffset);
      range.collapse(true);
    } else {
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    range.insertNode(marker);
    insertionMarkerRef.current = marker;
  }

  function removeInsertionMarker(restoreCaret: boolean): void {
    const marker = insertionMarkerRef.current;
    const editor = editorRef.current;
    insertionMarkerRef.current = null;

    if (!marker?.isConnected) {
      if (restoreCaret) requestAnimationFrame(() => restoreSelection());
      return;
    }

    if (restoreCaret && editor) {
      const range = document.createRange();
      range.setStartBefore(marker);
      range.collapse(true);
      marker.remove();

      requestAnimationFrame(() => {
        const selection = window.getSelection();
        editor.focus();
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedSelectionRef.current = range.cloneRange();
      });
      return;
    }

    marker.remove();
  }

  function openTableDialog(): void {
    if (disabled) return;
    saveSelection();
    createInsertionMarker();
    setTableRows("3");
    setTableColumns("3");
    setTableDialogOpen(true);
  }

  function closeTableDialog(): void {
    setTableDialogOpen(false);
    removeInsertionMarker(true);
  }

  function openEquationDialog(): void {
    if (disabled) return;
    saveSelection();
    createInsertionMarker();
    setEquationSource("E = mc^2");
    setEquationMode("display");
    setEquationDialogOpen(true);
  }

  function closeEquationDialog(): void {
    setEquationDialogOpen(false);
    removeInsertionMarker(true);
  }

  function getInsertionRange(editor: HTMLElement): {
    range: Range;
    marker: HTMLSpanElement | null;
  } {
    const marker =
      insertionMarkerRef.current ??
      editor.querySelector<HTMLSpanElement>("[data-editor-insertion-marker='true']") ??
      null;
    const range = document.createRange();

    if (marker?.isConnected) {
      range.selectNode(marker);
      return { range, marker };
    }

    if (
      savedSelectionRef.current &&
      editor.contains(savedSelectionRef.current.commonAncestorContainer)
    ) {
      range.setStart(
        savedSelectionRef.current.startContainer,
        savedSelectionRef.current.startOffset,
      );
      range.collapse(true);
      return { range, marker: null };
    }

    range.selectNodeContents(editor);
    range.collapse(false);
    return { range, marker: null };
  }

  function insertHtmlAtSelection(
    html: string,
    options: { typeset?: boolean; toastMessage?: string } = {},
  ): void {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const { range } = getInsertionRange(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const inserted = document.execCommand("insertHTML", false, html);
    if (!inserted) {
      const template = document.createElement("template");
      template.innerHTML = html;
      range.deleteContents();
      range.insertNode(template.content.cloneNode(true));
    }

    insertionMarkerRef.current = null;
    editor
      .querySelectorAll("[data-editor-insertion-marker='true']")
      .forEach((node) => node.remove());
    syncContent();
    saveSelection();
    if (options.typeset) void typesetMath(editor);
    if (options.toastMessage) toast.success(options.toastMessage);
  }

  function insertMediaItem(itemHtml: string, toastMessage: string): void {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const { range, marker } = getInsertionRange(editor);
    const nearbyGrid = findNearbyMediaGrid(editor, range);

    if (nearbyGrid) {
      const template = document.createElement("template");
      template.innerHTML = itemHtml;
      nearbyGrid.append(template.content.cloneNode(true));
      marker?.remove();
      insertionMarkerRef.current = null;
      placeCaretAfterMediaGrid(editor, nearbyGrid);
      syncContent();
      toast.success(toastMessage);
      return;
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
    const gridHtml = `<div class="article-media-grid" data-media-grid="true">${itemHtml}</div><p><br></p>`;
    const inserted = document.execCommand("insertHTML", false, gridHtml);

    if (!inserted) {
      const template = document.createElement("template");
      template.innerHTML = gridHtml;
      range.deleteContents();
      range.insertNode(template.content.cloneNode(true));
    }

    insertionMarkerRef.current = null;
    editor
      .querySelectorAll("[data-editor-insertion-marker='true']")
      .forEach((node) => node.remove());
    syncContent();
    saveSelection();
    toast.success(toastMessage);
  }

  function insertTable(): void {
    if (disabled) return;

    const rows = Number.parseInt(tableRows, 10);
    const columns = Number.parseInt(tableColumns, 10);

    if (!Number.isInteger(rows) || rows < 1 || rows > 20) {
      toast.error("Choose between 1 and 20 rows.");
      return;
    }

    if (!Number.isInteger(columns) || columns < 1 || columns > 10) {
      toast.error("Choose between 1 and 10 columns.");
      return;
    }

    const headingCells = Array.from({ length: columns }, (_, index) => {
      return `<th scope="col">Heading ${index + 1}</th>`;
    }).join("");

    const bodyRows = Array.from({ length: Math.max(0, rows - 1) }, () => {
      const cells = Array.from({ length: columns }, () => "<td>Text</td>").join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    const itemHtml = [
      '<div class="article-media-item article-media-table">',
      '<div class="article-table-wrap">',
      `<table><thead><tr>${headingCells}</tr></thead><tbody>${bodyRows}</tbody></table>`,
      "</div>",
      "</div>",
    ].join("");

    setTableDialogOpen(false);
    requestAnimationFrame(() => {
      insertMediaItem(itemHtml, `${rows} × ${columns} table inserted.`);
    });
  }

  function insertEquation(): void {
    const latex = equationSource.trim();
    if (!latex) {
      toast.error("Enter a LaTeX formula before inserting it.");
      return;
    }

    const safeAttribute = escapeHtml(latex);
    const safeText = escapeHtml(latex);
    const display = equationMode === "display";
    const tag = display ? "div" : "span";
    const source = display ? `\\[${safeText}\\]` : `\\(${safeText}\\)`;
    const html = display
      ? `<${tag} class="pt-latex pt-latex-display" data-latex="${safeAttribute}" data-display="block" contenteditable="false">${source}</${tag}><p><br></p>`
      : `<${tag} class="pt-latex pt-latex-inline" data-latex="${safeAttribute}" data-display="inline" contenteditable="false">${source}</${tag}>&nbsp;`;

    setEquationDialogOpen(false);
    requestAnimationFrame(() => {
      insertHtmlAtSelection(html, {
        typeset: true,
        toastMessage: `${display ? "Display" : "Inline"} equation inserted.`,
      });
    });
  }

  async function uploadAndInsertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPG, WEBP or another image file.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await apiRequest<UploadImageResponse>(
        apiPaths.utility.uploadImage,
        { method: "POST", body: form },
      );

      const descriptiveName = file.name
        .replace(/\.[^.]+$/, "")
        .replaceAll(/[-_]+/g, " ");
      const safeAlt = escapeHtml(descriptiveName || "Article illustration");
      const safeUrl = escapeHtml(response.url);
      const itemHtml = `<figure class="article-media-item article-media-image"><img src="${safeUrl}" alt="${safeAlt}" /><figcaption>${safeAlt}</figcaption></figure>`;

      insertMediaItem(itemHtml, "Image uploaded and inserted into the article.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleEditorKeyUp(): void {
    saveSelection();
  }

  return (
    <div className="rich-editor-shell">
      <div className="field">
        <label className="label" htmlFor="article-title">
          Article title
        </label>
        <input
          id="article-title"
          className="input article-title-input"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Write a clear, specific article title"
          maxLength={180}
          disabled={disabled}
          required
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="article-rich-editor">
          Article content
        </label>
        <div className="editor-toolbar" role="toolbar" aria-label="Article formatting">
          <ToolbarButton
            label="Paragraph"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("formatBlock", "p")}
            disabled={disabled}
          >
            <Pilcrow size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("formatBlock", "h2")}
            disabled={disabled}
          >
            <Heading2 size={17} />
          </ToolbarButton>
          <span className="editor-toolbar-divider" />
          <ToolbarButton
            label="Bold"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("bold")}
            disabled={disabled}
          >
            <Bold size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("italic")}
            disabled={disabled}
          >
            <Italic size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("underline")}
            disabled={disabled}
          >
            <Underline size={17} />
          </ToolbarButton>
          <span className="editor-toolbar-divider" />
          <ToolbarButton
            label="Bulleted list"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("insertUnorderedList")}
            disabled={disabled}
          >
            <List size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            onMouseDown={preventToolbarBlur}
            onClick={() => execute("insertOrderedList")}
            disabled={disabled}
          >
            <ListOrdered size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Insert table"
            onMouseDown={preventToolbarBlur}
            onClick={openTableDialog}
            disabled={disabled}
          >
            <Table2 size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Insert image"
            onMouseDown={preventToolbarBlur}
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <ImagePlus size={17} />
            )}
          </ToolbarButton>
          <ToolbarButton
            label="Insert LaTeX equation"
            onMouseDown={preventToolbarBlur}
            onClick={openEquationDialog}
            disabled={disabled}
          >
            <Sigma size={17} />
          </ToolbarButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void uploadAndInsertImage(event)}
          />
        </div>

        <div
          id="article-rich-editor"
          ref={editorRef}
          className="rich-editor"
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder="Write the article here. Select text and use the toolbar to format it."
          onInput={() => {
            saveSelection();
            syncContent();
          }}
          onMouseUp={saveSelection}
          onKeyUp={handleEditorKeyUp}
          onFocus={saveSelection}
          onBlur={syncContent}
        />
        <small className="muted">
          Titles, headings, images, responsive tables and LaTeX equations are available for editing articles as you like.
        </small>
      </div>

      {tableDialogOpen ? (
        <div
          className="editor-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeTableDialog();
          }}
        >
          <div
            className="editor-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insert-table-title"
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeTableDialog();
                return;
              }

              if (event.key === "Enter") {
                event.preventDefault();
                insertTable();
              }
            }}
          >
            <div className="editor-dialog-heading">
              <div>
                <p className="eyebrow muted">Table settings</p>
                <h3 id="insert-table-title">Insert a responsive table</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                title="Close"
                onClick={closeTableDialog}
              >
                <X size={18} />
              </button>
            </div>

            <div className="editor-dialog-grid">
              <div className="field">
                <label className="label" htmlFor="table-row-count">
                  Rows
                </label>
                <input
                  id="table-row-count"
                  className="input"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(event) => setTableRows(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="table-column-count">
                  Columns
                </label>
                <input
                  id="table-column-count"
                  className="input"
                  type="number"
                  min="1"
                  max="10"
                  value={tableColumns}
                  onChange={(event) => setTableColumns(event.target.value)}
                  required
                />
              </div>
            </div>

            <p className="muted editor-dialog-note">
              The first row is inserted as the heading. Consecutive tables are centered,
              spaced evenly and wrapped to a new row when the editor is too narrow.
            </p>

            <div className="actions editor-dialog-actions">
              <button type="button" className="button ghost" onClick={closeTableDialog}>
                Cancel
              </button>
              <button type="button" className="button" onClick={insertTable}>
                <Table2 size={17} /> Insert table
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {equationDialogOpen ? (
        <div
          className="editor-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeEquationDialog();
          }}
        >
          <div
            className="editor-dialog equation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insert-equation-title"
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeEquationDialog();
              }
            }}
          >
            <div className="editor-dialog-heading">
              <div>
                <p className="eyebrow muted">Mathematical notation</p>
                <h3 id="insert-equation-title">Insert a LaTeX equation</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                title="Close"
                onClick={closeEquationDialog}
              >
                <X size={18} />
              </button>
            </div>

            <div className="field">
              <label className="label" htmlFor="latex-equation-source">
                LaTeX source
              </label>
              <textarea
                id="latex-equation-source"
                className="textarea equation-source-input"
                value={equationSource}
                onChange={(event) => setEquationSource(event.target.value)}
                placeholder="Example: \\frac{a}{b} = \\sqrt{x^2 + y^2}"
                autoFocus
                spellCheck={false}
              />
            </div>

            <div className="equation-mode-control" role="group" aria-label="Equation type">
              <button
                type="button"
                className={equationMode === "inline" ? "active" : ""}
                onClick={() => setEquationMode("inline")}
              >
                Inline equation
              </button>
              <button
                type="button"
                className={equationMode === "display" ? "active" : ""}
                onClick={() => setEquationMode("display")}
              >
                Display equation
              </button>
            </div>

            <div className="equation-preview-shell">
              <span className="label">Live preview</span>
              <div ref={equationPreviewRef} className="equation-preview" />
            </div>

            <div className="latex-example-grid" aria-label="LaTeX examples">
              <button type="button" onClick={() => setEquationSource("E = mc^2")}>
                E = mc^2
              </button>
              <button
                type="button"
                onClick={() => setEquationSource("\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}")}
              >
                Quadratic formula
              </button>
              <button
                type="button"
                onClick={() => setEquationSource("\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}")}
              >
                Summation
              </button>
              <button
                type="button"
                onClick={() => setEquationSource("\\int_a^b f(x)\\,dx")}
              >
                Integral
              </button>
            </div>

            <div className="actions editor-dialog-actions">
              <button
                type="button"
                className="button ghost"
                onClick={closeEquationDialog}
              >
                Cancel
              </button>
              <button type="button" className="button" onClick={insertEquation}>
                <Sigma size={17} /> Insert equation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function findNearbyMediaGrid(editor: HTMLElement, range: Range): HTMLElement | null {
  const start =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  if (!start || !editor.contains(start)) return null;

  let topLevel: HTMLElement = start;
  while (topLevel.parentElement && topLevel.parentElement !== editor) {
    topLevel = topLevel.parentElement;
  }

  if (topLevel.matches(".article-media-grid")) return topLevel;

  const visuallyEmpty =
    topLevel.matches("p, div") &&
    (topLevel.textContent ?? "").replace(/[\s\u200B]/g, "").length === 0;

  if (visuallyEmpty) {
    const previous = topLevel.previousElementSibling;
    if (previous instanceof HTMLElement && previous.matches(".article-media-grid")) {
      return previous;
    }
  }

  return null;
}

function placeCaretAfterMediaGrid(editor: HTMLElement, grid: HTMLElement): void {
  let target = grid.nextElementSibling;
  if (!(target instanceof HTMLParagraphElement)) {
    target = document.createElement("p");
    target.append(document.createElement("br"));
    grid.after(target);
  }

  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);
  const selection = window.getSelection();
  editor.focus();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function ToolbarButton({
  label,
  children,
  disabled,
  onClick,
  onMouseDown,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className="editor-tool-button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
