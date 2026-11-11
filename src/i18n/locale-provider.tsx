"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

import type { Locale } from "@/i18n/config"
import { createI18n, type I18n } from "@/i18n/create-i18n"

const I18nContext = createContext<I18n | null>(null)

interface LocaleProviderProps {
  locale: Locale
  children: ReactNode
}

/** Makes the page's language available to every Client Component below it. */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo(() => createI18n(locale), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Copy, formatters and localized links for Client Components. */
export function useI18n(): I18n {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error("useI18n must be used inside <LocaleProvider>")
  }
  return value
}
