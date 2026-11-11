"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "motion/react"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Locale } from "@/i18n/config"
import { LocaleProvider } from "@/i18n/locale-provider"

interface ProvidersProps {
  locale: Locale
  children: ReactNode
}

/** App-wide client providers: language, motion preferences, tooltips, toasts. */
export function Providers({ locale, children }: ProvidersProps) {
  return (
    <LocaleProvider locale={locale}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster position="top-right" />
      </MotionConfig>
    </LocaleProvider>
  )
}
