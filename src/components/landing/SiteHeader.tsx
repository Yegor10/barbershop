"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { Wordmark } from "@/components/shared/Wordmark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useScrolled } from "@/hooks/use-scrolled"
import { useI18n } from "@/i18n/locale-provider"
import { cn } from "@/lib/utils"

/** Landing-page header: clear over the hero photo, glass once the page scrolls. */
export function SiteHeader() {
  const { t, href } = useI18n()
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  const sections = [
    { hash: "#services", label: t.nav.services },
    { hash: "#barbers", label: t.nav.barbers },
    { hash: "#gallery", label: t.nav.gallery },
    { hash: "#reviews", label: t.nav.reviews },
    { hash: "#location", label: t.nav.location },
  ]

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "glass border-x-0 border-t-0" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" className="focus-ring rounded-sm">
          <Wordmark />
        </a>

        <nav aria-label={t.nav.label} className="ml-6 hidden items-center gap-1 lg:flex">
          {sections.map((section) => (
            <a
              key={section.hash}
              href={section.hash}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href={href("/admin")}
            className="focus-ring hidden rounded-md px-2 py-2 text-sm text-slate-400 transition-colors hover:text-white xl:block"
          >
            {t.nav.staff}
          </Link>
          <LanguageSwitcher />
          <Button asChild className="hidden h-10 px-4 font-semibold sm:inline-flex">
            <Link href={href("/book")}>{t.common.bookAppointment}</Link>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 lg:hidden"
                aria-label={t.nav.openMenu}
              >
                <Menu aria-hidden className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,88vw)]">
              <SheetHeader>
                <SheetTitle>{t.nav.menuTitle}</SheetTitle>
                <SheetDescription className="sr-only">{t.nav.label}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t.nav.label} className="flex flex-col px-4">
                {sections.map((section) => (
                  <a
                    key={section.hash}
                    href={section.hash}
                    onClick={() => setMenuOpen(false)}
                    className="focus-ring display rounded-md border-b border-white/10 py-4 text-3xl"
                  >
                    {section.label}
                  </a>
                ))}
                <Link
                  href={href("/admin")}
                  className="focus-ring rounded-md py-4 text-muted-foreground"
                >
                  {t.nav.staff}
                </Link>
              </nav>
              <div className="mt-auto p-4">
                <Button asChild size="xl" className="w-full">
                  <Link href={href("/book")}>{t.common.bookAppointment}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
