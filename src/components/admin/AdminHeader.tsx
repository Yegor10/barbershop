"use client"

import Link from "next/link"
import { CalendarDays, ExternalLink, Users } from "lucide-react"

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { Wordmark } from "@/components/shared/Wordmark"
import { Button } from "@/components/ui/button"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/i18n/locale-provider"

/**
 * Dashboard top bar: brand, the Schedule / Clients switch and a way back to
 * the public site. Must be rendered inside the dashboard's `<Tabs>`.
 */
export function AdminHeader() {
  const { t, href } = useI18n()

  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-[104rem] items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Link href={href("/")} className="focus-ring shrink-0 rounded-sm">
          <Wordmark size="sm" />
        </Link>
        <p className="hidden border-l border-white/15 pl-5 text-sm text-muted-foreground lg:block">
          {t.admin.title}
        </p>

        <TabsList aria-label={t.admin.tabs.label} className="h-10! bg-white/10">
          <TabsTrigger value="schedule" className="px-3 sm:px-4">
            <CalendarDays aria-hidden />
            {t.admin.tabs.schedule}
          </TabsTrigger>
          <TabsTrigger value="clients" className="px-3 sm:px-4">
            <Users aria-hidden />
            {t.admin.tabs.clients}
          </TabsTrigger>
        </TabsList>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden h-9 px-3 md:inline-flex">
            <Link href={href("/")}>
              <ExternalLink aria-hidden />
              {t.admin.viewSite}
            </Link>
          </Button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
