"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { LOCALES, localizePath, stripLocale, type Locale } from "@/i18n/config"
import { useI18n } from "@/i18n/locale-provider"
import { cn } from "@/lib/utils"

const LANGUAGES: Readonly<Record<Locale, { short: string; name: string }>> = {
  uk: { short: "UA", name: "Українська" },
  en: { short: "EN", name: "English" },
}

interface LanguageSwitcherProps {
  className?: string
}

/**
 * Switches between the Ukrainian and English version of the current page.
 * The query string is carried over, so a ticket or a dashboard date stays
 * on screen in the other language.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const pagePath = stripLocale(pathname)

  function handleClick(event: MouseEvent<HTMLAnchorElement>, target: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    router.push(`${target}${window.location.search}`)
  }

  return (
    <div
      role="group"
      aria-label={t.common.languageLabel}
      className={cn(
        "inline-flex items-center rounded-md border border-white/15 p-0.5 text-xs font-semibold",
        className
      )}
    >
      {LOCALES.map((code) => {
        const language = LANGUAGES[code]
        const itemClass =
          "flex h-7 min-w-9 items-center justify-center rounded-[5px] px-2"

        if (code === locale) {
          return (
            <span
              key={code}
              aria-current="true"
              className={cn(itemClass, "bg-white/15 text-foreground")}
            >
              <span aria-hidden>{language.short}</span>
              <span className="sr-only">{language.name}</span>
            </span>
          )
        }

        const target = localizePath(pagePath, code)
        return (
          <Link
            key={code}
            href={target}
            hrefLang={code}
            lang={code}
            prefetch={false}
            onClick={(event) => handleClick(event, target)}
            className={cn(
              itemClass,
              "focus-ring text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            <span aria-hidden>{language.short}</span>
            <span className="sr-only">{language.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
