import { localizePath, type Locale, type LocalizedText } from "@/i18n/config"
import { getDictionary, type Dictionary } from "@/i18n/dictionaries"
import { createFormatters, type Formatters } from "@/i18n/formatters"

export interface I18n {
  locale: Locale
  /** Interface copy for the current language. */
  t: Dictionary
  /** Locale-aware formatting for prices, durations, dates and names. */
  fmt: Formatters
  /** Picks the current language from a localized content field. */
  tr: (text: LocalizedText) => string
  /** Address of a page in the current language. */
  href: (path: string) => string
}

/**
 * Everything a component needs to render in one language.
 * Server Components call this directly; Client Components use `useI18n()`.
 */
export function createI18n(locale: Locale): I18n {
  const t = getDictionary(locale)
  return {
    locale,
    t,
    fmt: createFormatters(locale, t),
    tr: (text) => text[locale],
    href: (path) => localizePath(path, locale),
  }
}
