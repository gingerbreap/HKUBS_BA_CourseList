import type { TranslationTree, TranslationValue } from './types'

export function resolveTranslation(
  tree: TranslationTree,
  key: string,
): TranslationValue | undefined {
  const parts = key.split('.')
  let cur: TranslationValue | TranslationTree = tree
  for (const part of parts) {
    if (typeof cur !== 'object' || cur === null || Array.isArray(cur)) return undefined
    cur = cur[part]
  }
  return cur
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = vars[name]
    return value === undefined ? '' : String(value)
  })
}
