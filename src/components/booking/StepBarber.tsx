"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Clock, Star, Users } from "lucide-react"

import { SkeletonText } from "@/components/ui/skeleton"
import type { DayAppointmentsLookup } from "@/hooks/use-day-appointments"
import { useI18n } from "@/i18n/locale-provider"
import { findNextOpening } from "@/lib/availability"
import { BARBERS } from "@/lib/mock-data"
import { ANY_BARBER, type Barber, type BarberChoice, type BookingSlot } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepBarberProps {
  selected: BarberChoice | null
  onSelect: (barberId: BarberChoice) => void
  /** Total length of the chosen services, to find each barber's next opening. */
  durationMin: number
  now: Date | null
  getAppointments: DayAppointmentsLookup
}

/** Step 2: pick a barber, or let the shop assign whoever is free first. */
export function StepBarber({
  selected,
  onSelect,
  durationMin,
  now,
  getAppointments,
}: StepBarberProps) {
  const { t } = useI18n()

  const openings = useMemo(() => {
    if (!now) return null
    const result = new Map<BarberChoice, BookingSlot | null>()
    for (const barberId of [ANY_BARBER, ...BARBERS.map((barber) => barber.id)]) {
      result.set(
        barberId,
        findNextOpening({ barberId, durationMin, now, getAppointments })
      )
    }
    return result
  }, [now, durationMin, getAppointments])

  return (
    <div
      role="radiogroup"
      aria-label={t.booking.barber.groupLabel}
      className="flex flex-col gap-2.5"
    >
      <BarberOption
        value={ANY_BARBER}
        checked={selected === ANY_BARBER}
        onSelect={onSelect}
        opening={openings?.get(ANY_BARBER)}
        now={now}
      />
      {BARBERS.map((barber) => (
        <BarberOption
          key={barber.id}
          value={barber.id}
          barber={barber}
          checked={selected === barber.id}
          onSelect={onSelect}
          opening={openings?.get(barber.id)}
          now={now}
        />
      ))}
    </div>
  )
}

interface BarberOptionProps {
  value: BarberChoice
  /** Omitted for the "any available barber" option. */
  barber?: Barber
  checked: boolean
  onSelect: (barberId: BarberChoice) => void
  /** `undefined` while availability is still loading, `null` if none. */
  opening: BookingSlot | null | undefined
  now: Date | null
}

function BarberOption({
  value,
  barber,
  checked,
  onSelect,
  opening,
  now,
}: BarberOptionProps) {
  const { t, tr, fmt } = useI18n()

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-400",
        checked
          ? "border-amber-500 bg-amber-500/10"
          : "border-white/10 bg-slate-900/60 hover:border-white/25 hover:bg-slate-900"
      )}
    >
      <input
        type="radio"
        name="barber"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />

      {barber ? (
        <Image
          src={barber.avatar}
          alt=""
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-800"
        >
          <Users className="size-6 text-slate-300" />
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-semibold leading-snug">
            {barber ? tr(barber.name) : t.common.anyBarber}
          </span>
          {barber && (
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-300">
              {tr(barber.title)}
            </span>
          )}
        </span>

        {barber ? (
          <>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                <span className="sr-only">
                  {t.common.ratingOutOfFive(fmt.number(barber.rating, 1))}
                </span>
                <span aria-hidden>{fmt.number(barber.rating, 1)}</span>
              </span>
              <span>{t.barbers.reviews(barber.reviewCount)}</span>
            </span>
            <span className="text-sm leading-snug text-muted-foreground">
              {barber.specialties.map(tr).join(", ")}
            </span>
          </>
        ) : (
          <span className="text-sm leading-snug text-muted-foreground">
            {t.booking.barber.anyHint}
          </span>
        )}

        <span className="flex items-center gap-1.5 pt-0.5 text-sm">
          <Clock aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          {opening === undefined || !now ? (
            <SkeletonText className="h-4 w-44" />
          ) : opening ? (
            <span>
              {t.booking.barber.nextOpening(fmt.relativeDayTime(opening.start, now))}
            </span>
          ) : (
            <span className="text-muted-foreground">{t.booking.barber.noOpening}</span>
          )}
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-amber-500" : "border-white/25"
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full bg-amber-500 transition-transform",
            checked ? "scale-100" : "scale-0"
          )}
        />
      </span>
    </label>
  )
}
