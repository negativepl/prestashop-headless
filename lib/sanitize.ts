"use client"

import DOMPurify from "dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to remove potentially dangerous content
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return ""

  if (typeof window === "undefined") {
    // SSR: return empty string, will be hydrated on client
    return ""
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "blockquote", "pre", "code",
      "span", "div", "mark",
      "sup", "sub"
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "style",
      "target", "rel", "width", "height"
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"]
  })
}

/**
 * Sanitize HTML for search highlights (only allows <mark> tags)
 */
export function sanitizeHighlight(dirty: string | undefined | null): string {
  if (!dirty) return ""

  if (typeof window === "undefined") {
    return ""
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["mark"],
    ALLOWED_ATTR: []
  })
}
