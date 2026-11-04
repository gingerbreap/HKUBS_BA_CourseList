import type { Locale } from '../i18n/types'
import pwaExplainZhCN from '../data/pwa-explain.zh-CN.md?raw'
import pwaExplainZhHK from '../data/pwa-explain.zh-HK.md?raw'
import pwaExplainEn from '../data/pwa-explain.en.md?raw'

/** Canonical source of the Chinese essay (attribution footer). */
export const PWA_EXPLAIN_SOURCE_URL =
  'https://github.com/lavas-project/pwa-book/blob/master/chapter01/2-what-is-pwa.md'

export function pwaExplainMarkdownForLocale(locale: Locale): string {
  if (locale === 'zh-HK') return pwaExplainZhHK
  if (locale === 'en') return pwaExplainEn
  return pwaExplainZhCN
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
  return out.replace(/\u0008/g, '')
}

/** Minimal Markdown → HTML for the embedded PWA essay. */
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
    const trimmed = lines[i].trim()

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
