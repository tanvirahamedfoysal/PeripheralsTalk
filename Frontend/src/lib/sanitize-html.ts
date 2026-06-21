/**
 * Lightweight server/client-safe sanitizer for the trusted Editor HTML stored by
 * the immutable backend. It removes executable elements, inline event handlers,
 * javascript URLs, iframes and embedded objects before rendering.
 */
export function sanitizeArticleHtml(input: string): string {
  return input
    .replace(
      /<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*\/?\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
}
