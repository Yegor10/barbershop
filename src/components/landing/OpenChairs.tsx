"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useDayAppointments } from "@/hooks/use-day-appointments"
import { useNow } from "@/hooks/use-now"
import { useI18n } from "@/i18n/locale-provider"
import { findNextOpening } from "@/lib/availability"
import { BARBERS, SLOT_RULES } from "@/lib/mock-data"

/**
 * Live board of each barber's next free time, read from the same schedule the
 * booking flow uses. Every row opens the wizard with that barber chosen.
 */
export function OpenChairs() {
  const { t, tr, fmt, href } = useI18n()
  const now = useNow()
  const getAppointments = useDayAppointments(now)
  const durationMin = SLOT_RULES.previewDurationMin

  const openings = useMemo(() => {
    if (!now) return null
    return BARBERS.map((barber) => ({
      barber,
      slot: findNextOpening({ barberId: barber.id, durationMin, now, getAppointments }),
    })).sort((a, b) => {
      if (!a.slot) return 1
      if (!b.slot) return -1
      return a.slot.start.localeCompare(b.slot.start)
    })
  }, [now, durationMin, getAppointments])

  return (
    <section
      aria-labelledby="open-chairs-title"
      className="glass rounded-2xl p-2 shadow-2xl shadow-black/40"
    >
      <div className="flex flex-col gap-0.5 px-3 pt-3 pb-2">
        <h2 id="open-chairs-title" className="text-base font-semibold">
          {t.hero.openChairsTitle}
        </h2>
        <p className="text-sm text-slate-300">
          {t.hero.openChairsHint(fmt.duration(durationMin))}
        </p>
      </div>

      <ul className="flex flex-col">
        {openings && now
          ? openings.map(({ barber, slot }) => {
              const name = tr(barber.name)
              const when = slot ? fmt.relativeDayTime(slot.start, now) : null
              return (
                <li key={barber.id}>
                  <Link
                    href={`${href("/book")}?barber=${barber.id}`}
                    aria-label={
                      when ? t.hero.openChairsBookAria(name, when) : `${name}`
                    }
                    className="focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10"
                  >
                    <Image
                      src={barber.avatar}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full object-cover"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{name}</span>
                      <span className="truncate text-sm text-slate-300">
                        {slot ? fmt.relativeDay(slot.start, now) : t.hero.openChairsNone}
                      </span>
                    </span>
                    {slot && (
                      <span className="numerals text-3xl leading-none">
                        {fmt.time(slot.start)}
                      </span>
                    )}
                    <ChevronRight
                      aria-hidden
                      className="size-4 shrink-0 text-slate-400 transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-amber-400"
                    />
                  </Link>
                </li>
              )
            })
          : BARBERS.map((barber) => (
              <li key={barber.id} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="size-11 rounded-full bg-white/10" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-28 bg-white/10" />
                  <Skeleton className="h-3.5 w-20 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-20 bg-white/10" />
              </li>
            ))}
      </ul>
    </section>
  )
}
