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

interface RichTextEditorProps {
  title: string;
  bodyHtml: string;
  disabled?: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

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
  const [uploading, setUploading] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableColumns, setTableColumns] = useState("3");

  useEffect(() => {
    return () => {
      insertionMarkerRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== bodyHtml) {
      editor.innerHTML = bodyHtml;
    }
  }, [bodyHtml]);

  function syncContent(): void {
    onBodyChange(editorRef.current?.innerHTML ?? "");
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

    if (savedSelectionRef.current) {
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

    const tableHtml = `<div class="article-table-wrap"><table><thead><tr>${headingCells}</tr></thead><tbody>${bodyRows}</tbody></table></div><p><br></p>`;
    const editor = editorRef.current;
    const marker =
      insertionMarkerRef.current ??
      editor?.querySelector<HTMLSpanElement>("[data-editor-insertion-marker='true']") ??
      null;

    setTableDialogOpen(false);

    requestAnimationFrame(() => {
      if (!editor) return;

      editor.focus();
      const selection = window.getSelection();
      const range = document.createRange();

      if (marker?.isConnected) {
        range.selectNode(marker);
      } else if (
        savedSelectionRef.current &&
        editor.contains(savedSelectionRef.current.commonAncestorContainer)
      ) {
        range.setStart(
          savedSelectionRef.current.startContainer,
          savedSelectionRef.current.startOffset,
        );
        range.collapse(true);
      } else {
        range.selectNodeContents(editor);
        range.collapse(false);
      }

      selection?.removeAllRanges();
      selection?.addRange(range);

      const inserted = document.execCommand("insertHTML", false, tableHtml);
      if (!inserted) {
        const template = document.createElement("template");
        template.innerHTML = tableHtml;
        const fragment = template.content.cloneNode(true);
        range.deleteContents();
        range.insertNode(fragment);
      }

      insertionMarkerRef.current = null;
      editor
        .querySelectorAll("[data-editor-insertion-marker='true']")
        .forEach((node) => node.remove());
      syncContent();
      saveSelection();
      toast.success(`${rows} × ${columns} table inserted.`);
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
      const safeAlt = (descriptiveName || "Article illustration")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

      execute(
        "insertHTML",
        `<figure><img src="${response.url}" alt="${safeAlt}" /><figcaption>${safeAlt}</figcaption></figure><p><br></p>`,
      );
      toast.success("Image uploaded and inserted into the article.");
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
          The title, headings, formatting, tables and images are saved together and
          restored when the article is opened.
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
                <h3 id="insert-table-title">Insert a table</h3>
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
              The first row is inserted as the table heading. You can edit every cell
              directly after insertion.
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
    </div>
  );
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
