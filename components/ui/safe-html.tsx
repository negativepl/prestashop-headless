"use client"

import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

interface SafeHtmlProps {
  html: string | undefined | null
  className?: string
  as?: "div" | "span" | "p"
  allowedTags?: string[]
}

const DEFAULT_ALLOWED_TAGS = [
  "p", "br", "b", "i", "em", "strong", "u", "s", "strike",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "blockquote", "pre", "code",
  "span", "div", "mark",
  "sup", "sub"
]

const DEFAULT_ALLOWED_ATTR = [
  "href", "src", "alt", "title", "class", "style",
  "target", "rel", "width", "height"
]

export function SafeHtml({
  html,
  className,
  as: Component = "div",
  allowedTags = DEFAULT_ALLOWED_TAGS
}: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState("")

  useEffect(() => {
    if (html && typeof window !== "undefined") {
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"]
      })
      setSanitized(clean)
    }
  }, [html, allowedTags])

  if (!html) return null

  // Content is sanitized by DOMPurify before rendering
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

/**
 * Lightweight component for search highlights (only <mark> tags allowed)
 */
export function SafeHighlight({
  html,
  className,
  as: Component = "span"
}: Omit<SafeHtmlProps, "allowedTags">) {
  const [sanitized, setSanitized] = useState("")

  useEffect(() => {
    if (html && typeof window !== "undefined") {
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["mark"],
        ALLOWED_ATTR: []
      })
      setSanitized(clean)
    }
  }, [html])

  if (!html) return null

  // Content is sanitized by DOMPurify before rendering
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
