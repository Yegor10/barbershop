"use client"

import { SkeletonText } from "@/components/ui/skeleton"
import { useNow } from "@/hooks/use-now"
import { useI18n } from "@/i18n/locale-provider"
import { getOpenState } from "@/lib/availability"
import { SHOP_HOURS, WEEK_ORDER } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/**
 * Weekly opening hours. Once the visitor's clock is known, today's row is
 * marked and a line above says whether the shop is open right now.
 */
export function OpeningHours() {
  const { t, fmt } = useI18n()
  const now = useNow()
  const today = now?.getDay()
  const openState = now ? getOpenState(now) : null

  let statusLine: string | null = null
  if (now && openState && openState.changesAtMin !== null) {
    const time = fmt.minuteOfDay(openState.changesAtMin)
    if (openState.isOpen) {
      statusLine = t.location.openNow(time)
    } else if (openState.opensOn) {
      const day = fmt.relativeDay(openState.opensOn, now).toLocaleLowerCase()
      statusLine = t.location.closedNow(t.common.dayAtTime(day, time))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p aria-live="polite" className="flex min-h-6 items-center gap-2.5 font-medium">
        {statusLine ? (
          <>
            <span
              aria-hidden
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                openState?.isOpen ? "bg-emerald-400" : "bg-slate-500"
              )}
            />
            {statusLine}
          </>
        ) : (
          <SkeletonText className="h-5 w-64 max-w-full" />
        )}
      </p>

      <table className="w-full max-w-md border-collapse text-left">
        <caption className="sr-only">{t.location.hours}</caption>
        <tbody>
          {WEEK_ORDER.map((dayIndex) => {
            const hours = SHOP_HOURS[dayIndex]
            const isToday = dayIndex === today
            return (
              <tr
                key={dayIndex}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "border-b border-white/10",
                  isToday ? "text-foreground" : "text-slate-400"
                )}
              >
                <th scope="row" className="py-2.5 pr-4 font-normal">
                  <span className={cn(isToday && "font-semibold")}>
                    {fmt.weekday(dayIndex)}
                  </span>
                  {isToday && (
                    <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                      {t.location.todayMark}
                    </span>
                  )}
                </th>
                <td
                  className={cn(
                    "numerals py-2.5 text-right text-2xl leading-none",
                    isToday ? "text-foreground" : "text-slate-300"
                  )}
                >
                  {hours
                    ? `${fmt.minuteOfDay(hours.openMin)}–${fmt.minuteOfDay(hours.closeMin)}`
                    : t.location.closedDay}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
