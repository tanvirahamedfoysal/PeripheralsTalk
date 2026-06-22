import { sanitizeArticleHtml } from "./sanitize-html";

export interface ParsedArticleDocument {
  title: string;
  bodyHtml: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function decodeHtml(value: string): string {
  if (typeof document === "undefined") {
    return value
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#039;", "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function stripTags(value: string): string {
  return decodeHtml(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function serializeArticleDocument(title: string, bodyHtml: string): string {
  const cleanTitle = title.trim();
  const cleanBody = sanitizeArticleHtml(bodyHtml.trim());

  return [
    '<article class="pt-article-document" data-pt-document="1">',
    `  <h1 data-pt-title="1">${escapeHtml(cleanTitle)}</h1>`,
    `  <div class="pt-article-body" data-pt-body="1">${cleanBody}</div>`,
    "</article>",
  ].join("\n");
}

export function parseArticleDocument(input: string): ParsedArticleDocument {
  const source = input?.trim() ?? "";

  if (!source) {
    return { title: "", bodyHtml: "" };
  }

  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(source, "text/html");
    const wrapper = documentNode.querySelector('[data-pt-document="1"]');

    if (wrapper) {
      const title = wrapper.querySelector('[data-pt-title="1"]')?.textContent?.trim();
      const body = wrapper.querySelector('[data-pt-body="1"]');
      return {
        title: title ?? "",
        bodyHtml: body?.innerHTML ?? "",
      };
    }

    const firstHeading = documentNode.querySelector("h1");
    if (firstHeading) {
      const title = firstHeading.textContent?.trim() ?? "";
      firstHeading.remove();
      return {
        title,
        bodyHtml: documentNode.body.innerHTML.trim(),
      };
    }
  }

  const titleMatch = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (titleMatch) {
    return {
      title: stripTags(titleMatch[1]),
      bodyHtml: source.replace(titleMatch[0], "").trim(),
    };
  }

  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return {
      title: "",
      bodyHtml: `<p>${escapeHtml(source).replaceAll("\n", "<br />")}</p>`,
    };
  }

  return { title: "", bodyHtml: source };
}

export function extractArticleTitle(input: string, fallback: string): string {
  const parsed = parseArticleDocument(input);
  if (parsed.title.trim()) return parsed.title.trim();

  const text = stripTags(parsed.bodyHtml || input);
  if (!text) return fallback;
  return text.length > 72 ? `${text.slice(0, 69).trim()}…` : text;
}
