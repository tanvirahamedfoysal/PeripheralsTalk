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
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== bodyHtml) {
      editor.innerHTML = bodyHtml;
    }
  }, [bodyHtml]);

  function syncContent(): void {
    onBodyChange(editorRef.current?.innerHTML ?? "");
  }

  function execute(command: string, value?: string): void {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  }

  function preventToolbarBlur(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
  }

  function insertTable(): void {
    if (disabled) return;

    const rowInput = window.prompt("Number of rows", "3");
    if (rowInput === null) return;
    const columnInput = window.prompt("Number of columns", "3");
    if (columnInput === null) return;

    const rows = Math.min(12, Math.max(1, Number.parseInt(rowInput, 10) || 3));
    const columns = Math.min(8, Math.max(1, Number.parseInt(columnInput, 10) || 3));

    const header = Array.from({ length: columns }, (_, index) => {
      return `<th scope="col">Column ${index + 1}</th>`;
    }).join("");
    const body = Array.from({ length: rows }, () => {
      const cells = Array.from({ length: columns }, () => "<td>Text</td>").join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    execute(
      "insertHTML",
      `<div class="article-table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div><p><br></p>`,
    );
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

      const alternativeText = window.prompt(
        "Describe this image for learners",
        file.name.replace(/\.[^.]+$/, ""),
      );
      const safeAlt = (alternativeText ?? "Article illustration")
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
            onClick={insertTable}
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
          onInput={syncContent}
          onBlur={syncContent}
        />
        <small className="muted">
          The title, headings, bold and italic text, underline, tables and images are
          stored together as one HTML document in the article content field.
        </small>
      </div>
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
