"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { Search, UserSearch } from "lucide-react"

import { ClientSheet } from "@/components/admin/ClientSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/locale-provider"
import { transliterate } from "@/i18n/translit"
import {
  CLIENT_HISTORY_DAYS,
  CLIENT_LOOKAHEAD_DAYS,
  buildClientDirectory,
} from "@/lib/appointments"
import { useStoredAppointments } from "@/lib/booking-store"
import { initialsOf } from "@/lib/format"
import { getBarber } from "@/lib/mock-data"
import type { ClientRecord } from "@/lib/types"
import { cn } from "@/lib/utils"

type ClientFilter = "all" | "regulars" | "upcoming" | "noShows"
const CLIENT_FILTERS: readonly ClientFilter[] = ["all", "regulars", "upcoming", "noShows"]

/** Rows shown before "show more". */
const PAGE_SIZE = 40
/** Completed visits in the period that make someone a regular. */
const REGULAR_VISITS = 2

function passesFilter(client: ClientRecord, filter: ClientFilter): boolean {
  if (filter === "regulars") return client.visits >= REGULAR_VISITS
  if (filter === "upcoming") return client.nextVisit !== null
  if (filter === "noShows") return client.noShows > 0
  return true
}

interface ClientsDirectoryProps {
  now: Date | null
  /** Start a booking for this client (opens the quick-booking dialog). */
  onNewBooking: (client: ClientRecord) => void
}

/** Searchable client list built from recent and upcoming appointments. */
export function ClientsDirectory({ now, onNewBooking }: ClientsDirectoryProps) {
  const { t, tr, fmt } = useI18n()
  const copy = t.admin.clients
  const stored = useStoredAppointments()

  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [filter, setFilter] = useState<ClientFilter>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [openKey, setOpenKey] = useState<string | null>(null)

  // Most recently active first: upcoming bookings, then latest visits.
  const clients = useMemo(() => {
    if (!now) return null
    return buildClientDirectory(now, stored).sort((a, b) =>
      (b.history[0]?.start ?? "").localeCompare(a.history[0]?.start ?? "")
    )
  }, [now, stored])

  const matches = useMemo(() => {
    if (!clients) return null
    const needle = deferredQuery.trim().toLocaleLowerCase()
    const digits = needle.replace(/\D/g, "")
    return clients.filter((client) => {
      if (!passesFilter(client, filter)) return false
      if (!needle) return true
      const name = client.fullName.toLocaleLowerCase()
      return (
        name.includes(needle) ||
        transliterate(name).includes(needle) ||
        (digits.length >= 3 && client.phone.replace(/\D/g, "").includes(digits))
      )
    })
  }, [clients, deferredQuery, filter])

  const openClient = clients?.find((client) => client.key === openKey) ?? null
  const visible = matches?.slice(0, visibleCount) ?? []
  const remaining = matches ? matches.length - visible.length : 0

  function resetFilters() {
    setQuery("")
    setFilter("all")
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="display text-5xl sm:text-6xl">{t.admin.tabs.clients}</h1>
        <p className="text-muted-foreground">
          {copy.period(CLIENT_HISTORY_DAYS, CLIENT_LOOKAHEAD_DAYS)}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            aria-label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            className="h-11 pr-3 pl-9 text-base md:text-base"
          />
        </div>

        <div
          role="group"
          aria-label={copy.filters.label}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:px-0.5"
        >
          {CLIENT_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => {
                setFilter(option)
                setVisibleCount(PAGE_SIZE)
              }}
              className={cn(
                "focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                filter === option
                  ? "border-slate-100 bg-slate-100 text-slate-950"
                  : "border-white/15 text-slate-200 hover:border-white/35 hover:bg-white/5"
              )}
            >
              {copy.filters[option]}
              {clients && (
                <span
                  className={cn(
                    "tabular-nums",
                    filter === option ? "text-slate-600" : "text-muted-foreground"
                  )}
                >
                  {clients.filter((client) => passesFilter(client, option)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {matches === null ? (
        <ClientsTableSkeleton label={copy.loading} />
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-white/15 p-6">
          <UserSearch aria-hidden className="size-7 text-muted-foreground" />
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold">{copy.emptyTitle}</p>
            <p className="max-w-lg text-muted-foreground">
              {copy.emptyHint(deferredQuery.trim())}
            </p>
          </div>
          <Button type="button" variant="outline" className="h-11 px-4" onClick={resetFilters}>
            {copy.clearFilters}
          </Button>
        </div>
      ) : (
        <>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {copy.count(matches.length)}
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60">
            <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
              <caption className="sr-only">{copy.tableLabel}</caption>
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {copy.columns.client}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {copy.columns.phone}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    {copy.columns.visits}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {copy.columns.lastVisit}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {copy.columns.nextVisit}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    {copy.columns.spent}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">
                    {copy.columns.barber}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((client) => {
                  const name = fmt.personName(client.fullName)
                  const barber = client.favouriteBarberId
                    ? getBarber(client.favouriteBarberId)
                    : undefined
                  return (
                    <tr
                      key={client.key}
                      className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/[0.04]"
                    >
                      <th scope="row" className="px-4 py-2.5 font-normal">
                        <button
                          type="button"
                          onClick={() => setOpenKey(client.key)}
                          aria-label={copy.openClient(name)}
                          className="focus-ring flex items-center gap-3 rounded-md text-left"
                        >
                          <span
                            aria-hidden
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200"
                          >
                            {initialsOf(name)}
                          </span>
                          <span className="font-medium underline-offset-4 hover:underline">
                            {name}
                          </span>
                        </button>
                      </th>
                      <td className="px-4 py-2.5 whitespace-nowrap tabular-nums text-slate-300">
                        {client.phone || copy.none}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {client.visits}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-slate-300">
                        {client.lastVisit ? fmt.dayShort(client.lastVisit) : copy.none}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {client.nextVisit ? (
                          `${fmt.dayShort(client.nextVisit)}, ${fmt.time(client.nextVisit)}`
                        ) : (
                          <span className="text-muted-foreground">{copy.none}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums">
                        {fmt.price(client.totalSpent)}
                      </td>
                      <td className="hidden px-4 py-2.5 whitespace-nowrap text-slate-300 xl:table-cell">
                        {barber ? tr(barber.name) : copy.none}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {remaining > 0 && (
            <Button
              type="button"
              variant="outline"
              className="h-11 self-center px-5"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              {copy.showMore(Math.min(PAGE_SIZE, remaining))}
            </Button>
          )}
        </>
      )}

      <ClientSheet
        client={openClient}
        onClose={() => setOpenKey(null)}
        onNewBooking={(client) => {
          setOpenKey(null)
          onNewBooking(client)
        }}
      />
    </div>
  )
}

function ClientsTableSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/60"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-white/[0.07] px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="ml-auto hidden h-4 w-32 sm:block" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
