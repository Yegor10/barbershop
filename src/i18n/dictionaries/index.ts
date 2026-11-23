import type { Locale } from "@/i18n/config"
import { en } from "@/i18n/dictionaries/en"
import { nl } from "@/i18n/dictionaries/nl"

/** The Dutch dictionary is the source of truth for the shape. */
export type Dictionary = typeof nl

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { nl, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
