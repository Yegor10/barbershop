import type { Locale } from "@/i18n/config"
import { en } from "@/i18n/dictionaries/en"
import { uk } from "@/i18n/dictionaries/uk"

/** The Ukrainian dictionary is the source of truth for the shape. */
export type Dictionary = typeof uk

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { uk, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
