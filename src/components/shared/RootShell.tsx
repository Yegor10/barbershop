import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"

import { fontVariables } from "@/app/fonts"
import { Providers } from "@/components/shared/Providers"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

interface RootShellProps {
  locale: Locale
  children: ReactNode
}

/**
 * The document shell shared by both root layouts. Each language has its own
 * root layout so that `<html lang>` is right in the exported HTML.
 */
export function RootShell({ locale, children }: RootShellProps) {
  return (
    <html lang={locale} className={`dark ${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}

export function buildRootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale)
  return {
    title: {
      default: t.meta.siteTitle,
      template: "%s | Strop & Steel",
    },
    description: t.meta.description,
  }
}

export const rootViewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
}
