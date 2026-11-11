import Link from "next/link"

import { Wordmark } from "@/components/shared/Wordmark"
import { Button } from "@/components/ui/button"
import type { I18n } from "@/i18n/create-i18n"
import { SHOP } from "@/lib/mock-data"

interface SiteFooterProps {
  i18n: I18n
}

/** Closing call to book, then the practical links. */
export function SiteFooter({ i18n }: SiteFooterProps) {
  const { t, tr, href } = i18n

  return (
    <footer className="border-t border-white/10 bg-slate-900/50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-20">
        <div className="flex flex-col gap-4">
          <p className="display text-6xl sm:text-7xl lg:text-8xl">{t.footer.ctaTitle}</p>
          <p className="max-w-xl text-lg text-muted-foreground">{t.footer.ctaLead}</p>
        </div>
        <Button asChild size="xl" className="h-14 w-full px-8 text-lg sm:w-fit">
          <Link href={href("/book")}>{t.common.bookAppointment}</Link>
        </Button>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Wordmark size="sm" className="text-foreground" />
            <p>
              {tr(SHOP.street)}, {tr(SHOP.city)}
            </p>
          </div>

          <nav
            aria-label={t.nav.label}
            className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-slate-300"
          >
            <a href="#services" className="focus-ring rounded-sm hover:text-white">
              {t.nav.services}
            </a>
            <a href="#barbers" className="focus-ring rounded-sm hover:text-white">
              {t.nav.barbers}
            </a>
            <a href="#location" className="focus-ring rounded-sm hover:text-white">
              {t.nav.location}
            </a>
            <Link href={href("/admin")} className="focus-ring rounded-sm hover:text-white">
              {t.nav.staff}
            </Link>
          </nav>

          <p className="max-w-xs md:text-right">
            {t.footer.demoNote}{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-sm underline underline-offset-4 hover:text-white"
            >
              {t.footer.photoCredit}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
