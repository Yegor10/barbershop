"use client"

import type { ReactNode } from "react"
import { Armchair, Banknote, CalendarCheck, CircleCheck, type LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/locale-provider"
import type { DayStats } from "@/lib/appointments"
import { BARBERS } from "@/lib/mock-data"

interface MetricsBarProps {
  /** `null` while the day is loading. */
  stats: DayStats | null
  isToday: boolean
  /** Pending and confirmed appointments that haven't started yet. */
  upcoming: number
}

/** The day at a glance: bookings, expected revenue, occupancy, completion. */
export function MetricsBar({ stats, isToday, upcoming }: MetricsBarProps) {
  const { t, fmt } = useI18n()
  const copy = t.admin.metrics

  const settled = stats
    ? stats.byStatus.completed + stats.byStatus.cancelled + stats.byStatus.no_show
    : 0

  return (
    <section
      aria-label={copy.label}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 xl:grid-cols-4"
    >
      <MetricTile
        icon={CalendarCheck}
        label={isToday ? copy.bookingsToday : copy.bookingsDay}
        value={stats ? fmt.number(stats.bookings) : null}
        hint={stats ? (upcoming > 0 ? copy.upcoming(upcoming) : copy.allDone) : null}
      />
      <MetricTile
        icon={Banknote}
        label={copy.revenue}
        value={stats ? fmt.price(stats.expectedRevenue) : null}
        hint={
          stats
            ? copy.revenueHint(
                fmt.price(
                  stats.bookings > 0
                    ? Math.round(stats.expectedRevenue / stats.bookings)
                    : 0
                )
              )
            : null
        }
      />
      <MetricTile
        icon={Armchair}
        label={copy.occupancy}
        value={stats ? fmt.percent(stats.occupancy) : null}
        hint={stats ? copy.occupancyHint(stats.barbersWorking, BARBERS.length) : null}
      >
        {stats && (
          <div
            role="meter"
            aria-label={copy.occupancy}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(stats.occupancy * 100)}
            className="h-1.5 overflow-hidden rounded-full bg-amber-500/20"
          >
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-500"
              style={{ width: `${Math.round(stats.occupancy * 100)}%` }}
            />
          </div>
        )}
      </MetricTile>
      <MetricTile
        icon={CircleCheck}
        label={copy.completion}
        value={
          stats
            ? stats.completionRate === null
              ? "–"
              : fmt.percent(stats.completionRate)
            : null
        }
        hint={
          stats
            ? stats.completionRate === null
              ? copy.completionEmpty
              : copy.completionHint(stats.byStatus.completed, settled)
            : null
        }
      />
    </section>
  )
}

interface MetricTileProps {
  icon: LucideIcon
  label: string
  /** `null` renders a skeleton. */
  value: string | null
  hint: string | null
  /** Optional figure under the value, e.g. a meter. */
  children?: ReactNode
}

function MetricTile({ icon: Icon, label, value, hint, children }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-3 bg-slate-900 p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden className="size-4 shrink-0" />
        {label}
      </p>
      {value === null ? (
        <Skeleton className="h-12 w-28" />
      ) : (
        <p className="numerals text-5xl leading-none">{value}</p>
      )}
      {children}
      {hint === null ? (
        <Skeleton className="h-4 w-36" />
      ) : (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
