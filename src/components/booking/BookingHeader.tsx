"use client"

import Link from "next/link"
import { X } from "lucide-react"

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { Wordmark } from "@/components/shared/Wordmark"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/locale-provider"

/** Slim header for the booking flow: brand, language and a way out. */
export function BookingHeader() {
  const { t, href } = useI18n()

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <Link href={href("/")} className="focus-ring rounded-sm">
        <Wordmark size="sm" />
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button asChild variant="ghost" size="icon" className="size-10">
          <Link href={href("/")} aria-label={t.booking.exit}>
            <X aria-hidden className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
