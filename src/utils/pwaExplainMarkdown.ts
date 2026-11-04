/** Source essay used for the in-app “What is PWA” explainer. */
export const PWA_EXPLAIN_MD_URL =
  'https://raw.githubusercontent.com/lavas-project/pwa-book/refs/heads/master/chapter01/2-what-is-pwa.md'

/**
 * Strip sections the product asked to hide:
 * - first body paragraph after the title
 * - Google checklist block through “每个页面都有独立的 URL”
 * - last two closing paragraphs
 */
export function filterPwaExplainMarkdown(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n')

  text = text.replace(
    /(# 什么是 PWA\n\n)Google 提出 PWA[\s\S]*?\n\n(?=PWA 主要特点)/,
    '$1',
  )

  text = text.replace(
    /\nGoogle 在官网一篇名为[\s\S]*?每个页面都有独立的 URL\n+/,
    '\n',
  )

  text = text.replace(/\nPWA 能给站点体验带来飞跃式的提升[\s\S]*$/, '\n')

  return `${text.trim()}\n`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat(s: string): string {
  let out = escapeHtml(s)
  out = out.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Strip rare control chars from the source MD
  return out.replace(/\u0008/g, '')
}

/** Minimal Markdown → HTML for the filtered PWA essay (headings, lists, tables, links). */
export function pwaExplainMarkdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const parts: string[] = []
  let i = 0
  let inUl = false
  let inTable = false

  const closeUl = () => {
    if (inUl) {
      parts.push('</ul>')
      inUl = false
    }
  }
  const closeTable = () => {
    if (inTable) {
      parts.push('</tbody></table>')
      inTable = false
    }
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      closeUl()
      closeTable()
      i += 1
      continue
    }

    if (trimmed.startsWith('# ')) {
      closeUl()
      closeTable()
      parts.push(`<h1>${inlineFormat(trimmed.slice(2))}</h1>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      closeUl()
      closeTable()
      parts.push(`<h2>${inlineFormat(trimmed.slice(3))}</h2>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('* ')) {
      closeTable()
      if (!inUl) {
        parts.push('<ul>')
        inUl = true
      }
      parts.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('|')) {
      closeUl()
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      const isSep = cells.every(c => /^:?-+:?$/.test(c))
      if (isSep) {
        i += 1
        continue
      }
      if (!inTable) {
        parts.push('<table class="pwa-explain-table"><tbody>')
        inTable = true
        parts.push(`<tr>${cells.map(c => `<th>${inlineFormat(c)}</th>`).join('')}</tr>`)
      } else {
        parts.push(`<tr>${cells.map(c => `<td>${inlineFormat(c)}</td>`).join('')}</tr>`)
      }
      i += 1
      continue
    }

    closeUl()
    closeTable()
    // Merge soft-wrapped continuation lines into one paragraph
    let para = trimmed
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (
        !next
        || next.startsWith('#')
        || next.startsWith('* ')
        || next.startsWith('|')
      ) break
      para += next
      i += 1
    }
    parts.push(`<p>${inlineFormat(para)}</p>`)
    i += 1
  }

  closeUl()
  closeTable()
  return parts.join('\n')
}
