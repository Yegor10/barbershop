export const LOCALES = ["uk", "en"] as const

export type Locale = (typeof LOCALES)[number]

/** Ukrainian is served at the site root; English lives under `/en`. */
export const DEFAULT_LOCALE: Locale = "uk"

/** A piece of content written once per language. */
export type LocalizedText = Readonly<Record<Locale, string>>

const EN_PREFIX = "/en"

/**
 * The address of a page in a given language.
 * `localizePath("/book", "en")` → `/en/book`, `localizePath("/#services", "uk")` → `/#services`.
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === "/" ? `${EN_PREFIX}/` : `${EN_PREFIX}${clean}`
}

/** Drops the language prefix: `/en/book/` → `/book/`. */
export function stripLocale(pathname: string): string {
  if (pathname === EN_PREFIX || pathname === `${EN_PREFIX}/`) return "/"
  return pathname.startsWith(`${EN_PREFIX}/`)
    ? pathname.slice(EN_PREFIX.length)
    : pathname
}
