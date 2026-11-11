"use client"

import { motion } from "motion/react"

import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/locale-provider"
import { getBarber, getServices, totalsFor } from "@/lib/mock-data"
import { ANY_BARBER, type BarberChoice } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookingSummaryProps {
  serviceIds: readonly string[]
  barberId: BarberChoice | null
  slotStart: string | null
  now: Date | null
  /** Hide the heading when the surrounding sheet already has a title. */
  showTitle?: boolean
  className?: string
}

/** Live recap of the booking so far: services, barber, time and total. */
export function BookingSummary({
  serviceIds,
  barberId,
  slotStart,
  now,
  showTitle = true,
  className,
}: BookingSummaryProps) {
  const { t, tr, fmt } = useI18n()
  const copy = t.booking.summary
  const services = getServices(serviceIds)
  const { durationMin, price } = totalsFor(serviceIds)
  const barber = barberId && barberId !== ANY_BARBER ? getBarber(barberId) : undefined

  const barberLabel =
    barberId === ANY_BARBER
      ? t.common.anyBarber
      : barber
        ? tr(barber.name)
        : null

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showTitle && <h2 className="text-base font-semibold">{copy.title}</h2>}

      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {services.map((service) => (
              <motion.li
                key={service.id}
                layout="position"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <span className="leading-snug">{tr(service.name)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {fmt.price(service.price)}
                </span>
              </motion.li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2.5 border-t pt-4 text-sm">
            <SummaryRow label={copy.barber} value={barberLabel} />
            <SummaryRow
              label={copy.when}
              value={
                slotStart ? (
                  now ? (
                    `${fmt.relativeDay(slotStart, now)}, ${fmt.time(slotStart)}`
                  ) : (
                    <Skeleton className="h-4 w-28" />
                  )
                ) : null
              }
            />
            <SummaryRow label={copy.duration} value={fmt.duration(durationMin)} />
          </dl>

          <div className="flex items-end justify-between gap-4 border-t pt-4">
            <span className="text-sm text-muted-foreground">{copy.total}</span>
            <motion.span
              key={price}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="numerals text-4xl leading-none"
            >
              {fmt.price(price)}
            </motion.span>
          </div>
        </>
      )}
    </div>
  )
}

interface SummaryRowProps {
  label: string
  /** `null` renders the "not chosen yet" placeholder. */
  value: React.ReactNode | null
}

function SummaryRow({ label, value }: SummaryRowProps) {
  const { t } = useI18n()
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", value === null && "text-muted-foreground")}>
        {value ?? t.common.notChosen}
      </dd>
    </div>
  )
}
