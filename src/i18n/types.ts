export type Locale = 'zh-CN' | 'zh-HK' | 'en'

export const LOCALE_STORAGE_KEY = 'msba-locale'
export const DEFAULT_LOCALE: Locale = 'zh-CN'

export type TranslationValue = string | string[] | TranslationTree
export type TranslationTree = { [key: string]: TranslationValue }
