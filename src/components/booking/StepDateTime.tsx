"use client"

import { useMemo, useState } from "react"
import { addDays } from "date-fns"
import { CalendarX, Check } from "lucide-react"
import { motion } from "motion/react"
import { enGB as calendarEn, uk as calendarUk } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import type { DayAppointmentsLookup } from "@/hooks/use-day-appointments"
import { useSimulatedLatency } from "@/hooks/use-simulated-latency"
import { useI18n } from "@/i18n/locale-provider"
import { findNextOpening, getDaySlots, isDateBookable } from "@/lib/availability"
import { fromDateKey, toDateKey } from "@/lib/format"
import { SLOT_RULES } from "@/lib/mock-data"
import type { BarberChoice, BookingSlot } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepDateTimeProps {
  barberId: BarberChoice
  durationMin: number
  /** The day the client picked, if any. Otherwise the next open day is shown. */
  dateKey: string | null
  slotStart: string | null
  now: Date | null
  getAppointments: DayAppointmentsLookup
  onSelectDate: (dateKey: string) => void
  onSelectSlot: (dateKey: string, slotStart: string) => void
}

type DayPart = "morning" | "afternoon" | "evening"
const DAY_PARTS: readonly DayPart[] = ["morning", "afternoon", "evening"]

function dayPartOf(slot: BookingSlot): DayPart {
  const hour = new Date(slot.start).getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

/** Step 3: pick a day on the calendar, then one of that day's open times. */
export function StepDateTime({
  barberId,
  durationMin,
  dateKey,
  slotStart,
  now,
  getAppointments,
  onSelectDate,
  onSelectSlot,
}: StepDateTimeProps) {
  const { t, fmt, locale } = useI18n()
  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(undefined)

  const nextOpening = useMemo(
    () =>
      now
        ? findNextOpening({
            barberId,
            durationMin,
            now,
            getAppointments,
            maxDays: SLOT_RULES.horizonDays + 1,
          })
        : null,
    [barberId, durationMin, now, getAppointments]
  )

  // Show the client's day if it is still bookable, else the first open one.
  const activeDateKey = useMemo(() => {
    if (!now) return null
    if (dateKey && isDateBookable(fromDateKey(dateKey), barberId, now)) return dateKey
    return nextOpening ? toDateKey(nextOpening.start) : null
  }, [now, dateKey, barberId, nextOpening])

  const slots = useMemo(() => {
    if (!now || !activeDateKey) return []
    const date = fromDateKey(activeDateKey)
    return getDaySlots({
      date,
      durationMin,
      barberId,
      appointments: getAppointments(date),
      now,
    }).filter((slot) => slot.unavailableReason !== "past")
  }, [now, activeDateKey, durationMin, barberId, getAppointments])

  const isLoading = useSimulatedLatency(`${activeDateKey}|${barberId}|${durationMin}`)
  const availableCount = slots.filter((slot) => slot.available).length
  const selectedSlot = slots.find((slot) => slot.start === slotStart && slot.available)
  const activeDate = activeDateKey ? fromDateKey(activeDateKey) : undefined

  if (!now) {
    return (
      <div className="grid gap-6 md:grid-cols-[21rem_minmax(0,1fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <SlotGridSkeleton label={t.booking.time.loading} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[21rem_minmax(0,1fr)] md:items-start">
      <section aria-label={t.booking.time.dateLabel}>
        <Calendar
          mode="single"
          required
          selected={activeDate}
          onSelect={(date) => {
            setVisibleMonth(undefined)
            onSelectDate(toDateKey(date))
          }}
          month={visibleMonth ?? activeDate ?? now}
          onMonthChange={setVisibleMonth}
          startMonth={now}
          endMonth={addDays(now, SLOT_RULES.horizonDays)}
          disabled={(date) => !isDateBookable(date, barberId, now)}
          weekStartsOn={1}
          showOutsideDays={false}
          locale={locale === "uk" ? calendarUk : calendarEn}
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3 [--cell-size:2.6rem]"
          classNames={{ root: "w-full" }}
        />
      </section>

      <section aria-label={t.booking.time.timeLabel} className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-3">
          <h3 className="text-base font-semibold">
            {activeDate ? fmt.dayLong(activeDate) : t.booking.time.timeLabel}
          </h3>
          {!isLoading && activeDate && availableCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.booking.time.available(availableCount)}
            </p>
          )}
        </div>

        {isLoading ? (
          <SlotGridSkeleton label={t.booking.time.loading} />
        ) : !activeDate || availableCount === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-white/15 p-5">
            <CalendarX aria-hidden className="size-6 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{t.booking.time.noSlotsTitle}</p>
              <p className="text-sm text-muted-foreground">
                {t.booking.time.noSlotsHint}
              </p>
            </div>
            {nextOpening && toDateKey(nextOpening.start) !== activeDateKey && (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4"
                onClick={() => {
                  setVisibleMonth(undefined)
                  onSelectSlot(toDateKey(nextOpening.start), nextOpening.start)
                }}
              >
                {t.booking.time.jumpToNext(
                  fmt.relativeDayTime(nextOpening.start, now)
                )}
              </Button>
            )}
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={t.booking.time.timeLabel}
            className="flex flex-col gap-5"
          >
            {DAY_PARTS.map((part) => {
              const partSlots = slots.filter((slot) => dayPartOf(slot) === part)
              if (partSlots.length === 0) return null
              return (
                <div key={part} className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    {t.booking.time[part]}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {partSlots.map((slot) => (
                      <SlotOption
                        key={slot.start}
                        slot={slot}
                        checked={slot.start === slotStart}
                        onSelect={() => onSelectSlot(toDateKey(slot.start), slot.start)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p aria-live="polite" className="min-h-6 pt-4 text-sm">
          {selectedSlot && !isLoading && (
            <motion.span
              key={selectedSlot.start}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 font-medium text-amber-300"
            >
              <Check aria-hidden className="size-4" />
              {fmt.relativeDay(selectedSlot.start, now)},{" "}
              {fmt.timeRange(selectedSlot.start, selectedSlot.end)}
            </motion.span>
          )}
        </p>
      </section>
    </div>
  )
}

interface SlotOptionProps {
  slot: BookingSlot
  checked: boolean
  onSelect: () => void
}

function SlotOption({ slot, checked, onSelect }: SlotOptionProps) {
  const { t, fmt } = useI18n()
  const time = fmt.time(slot.start)

  return (
    <motion.label
      whileTap={slot.available ? { scale: 0.95 } : undefined}
      className={cn(
        "numerals flex h-12 items-center justify-center rounded-lg border text-xl transition-colors",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-400",
        slot.available
          ? "cursor-pointer border-white/12 bg-slate-900/60 hover:border-white/35 hover:bg-slate-800"
          : "border-transparent text-slate-600 line-through",
        checked &&
          slot.available &&
          "border-amber-500 bg-amber-500 text-slate-950 hover:border-amber-500 hover:bg-amber-500"
      )}
    >
      <input
        type="radio"
        name="time-slot"
        value={slot.start}
        checked={checked && slot.available}
        disabled={!slot.available}
        onChange={onSelect}
        aria-label={slot.available ? time : `${time}, ${t.booking.time.bookedSuffix}`}
        className="sr-only"
      />
      <span aria-hidden>{time}</span>
    </motion.label>
  )
}

function SlotGridSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-5">
      {[6, 8].map((count, group) => (
        <div key={group} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: count }, (_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
