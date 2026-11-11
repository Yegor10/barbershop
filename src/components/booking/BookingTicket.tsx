"use client"

import Link from "next/link"
import { CalendarPlus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Wordmark } from "@/components/shared/Wordmark"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { useI18n } from "@/i18n/locale-provider"
import { buildGoogleCalendarUrl } from "@/lib/format"
import { getBarber, getServices, SHOP } from "@/lib/mock-data"
import type { Appointment } from "@/lib/types"

interface BookingTicketProps {
  /** Live record from the store, so the status updates as the shop confirms. */
  appointment: Appointment
  onBookAnother: () => void
}

/** Step 5: the confirmation, laid out as a ticket to keep. */
export function BookingTicket({ appointment, onBookAnother }: BookingTicketProps) {
  const { t, tr, fmt, href } = useI18n()
  const copy = t.booking.ticket
  const barber = getBarber(appointment.barberId)
  const services = getServices(appointment.serviceIds)
  const barberName = barber ? tr(barber.name) : ""
  const serviceNames = services.map((service) => tr(service.name))
  const address = `${tr(SHOP.street)}, ${tr(SHOP.city)}`
  const isPending = appointment.status === "pending"

  const calendarUrl = buildGoogleCalendarUrl({
    title: `${SHOP.name}: ${serviceNames.join(", ")}`,
    start: appointment.start,
    end: appointment.end,
    details: copy.calendarDetails(barberName, appointment.id),
    location: address,
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <motion.article
        initial={{ opacity: 0, y: 28, rotate: -1.2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 20 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <div aria-hidden className="pole-stripe h-2.5" />

        <div className="flex flex-col gap-6 px-5 pt-5 pb-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Wordmark size="sm" />
            <span aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={appointment.status}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex"
                >
                  <StatusBadge
                    status={appointment.status}
                    size="md"
                    label={
                      isPending
                        ? copy.statusPending
                        : appointment.status === "confirmed"
                          ? copy.statusConfirmed
                          : undefined
                    }
                  />
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{copy.bookingId}</p>
            <p className="numerals text-4xl leading-none tracking-wider select-all">
              {appointment.id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{copy.date}</p>
              <p className="numerals text-3xl leading-none uppercase">
                {fmt.dayCompact(appointment.start)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{copy.time}</p>
              <p className="numerals text-3xl leading-none">
                {fmt.timeRange(appointment.start, appointment.end)}
              </p>
            </div>
          </div>
        </div>

        {/* Perforation: a dashed rule with a notch punched out of each edge. */}
        <div aria-hidden className="relative">
          <div className="mx-5 border-t border-dashed border-white/25 sm:mx-6" />
          <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        </div>

        <dl className="flex flex-col gap-3 px-5 pt-6 pb-5 text-sm sm:px-6">
          <TicketRow label={copy.barber} value={barberName} />
          <TicketRow
            label={copy.services}
            value={
              <ul className="flex flex-col gap-0.5">
                {serviceNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            }
          />
          <TicketRow label={copy.duration} value={fmt.duration(appointment.durationMin)} />
          <TicketRow label={copy.client} value={appointment.client.fullName} />
          <TicketRow label={copy.address} value={address} />
          <div className="mt-1 flex items-end justify-between gap-4 border-t pt-4">
            <dt className="text-muted-foreground">{copy.total}</dt>
            <dd className="numerals text-3xl leading-none">
              {fmt.price(appointment.price)}
            </dd>
          </div>
        </dl>
      </motion.article>

      <p aria-live="polite" className="text-center text-sm text-muted-foreground">
        {isPending ? copy.pendingHint : copy.confirmedHint}
      </p>

      <div className="flex flex-col gap-3">
        <Button asChild size="xl">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
            <CalendarPlus aria-hidden />
            {copy.addToCalendar}
          </a>
        </Button>
        <Button type="button" variant="outline" size="xl" onClick={onBookAnother}>
          {copy.bookAnother}
        </Button>
        <Button asChild variant="ghost" size="xl">
          <Link href={href("/")}>{t.common.home}</Link>
        </Button>
      </div>
    </div>
  )
}

function TicketRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
