"use client"

import { SearchX } from "lucide-react"

import { BookingHeader } from "@/components/booking/BookingHeader"
import { BookingTicket } from "@/components/booking/BookingTicket"
import { StepIndicator } from "@/components/booking/StepIndicator"
import { WIZARD_STEPS } from "@/components/booking/wizard-state"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/locale-provider"
import { useStoredAppointments } from "@/lib/booking-store"

interface TicketScreenProps {
  bookingId: string
  /** Leaves the ticket and opens an empty wizard. */
  onStartOver: () => void
}

/**
 * Step 5 on its own screen. It is addressed by booking id in the URL, so the
 * ticket survives a refresh and can be opened in the other language.
 */
export function TicketScreen({ bookingId, onStartOver }: TicketScreenProps) {
  const { t } = useI18n()
  const copy = t.booking.ticket
  const appointment = useStoredAppointments()[bookingId]
  const lastStep = WIZARD_STEPS.length - 1

  return (
    <div className="flex min-h-dvh flex-col">
      <BookingHeader />
      <StepIndicator
        current={lastStep}
        maxReachable={lastStep}
        interactive={false}
        onStepSelect={() => undefined}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-8 pb-16">
        {appointment ? (
          <>
            <h1 className="display text-center text-5xl sm:text-6xl">
              {t.booking.steps.ticket.title}
            </h1>
            <BookingTicket appointment={appointment} onBookAnother={onStartOver} />
          </>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-start gap-4 rounded-2xl border border-dashed border-white/15 p-6">
            <SearchX aria-hidden className="size-7 text-muted-foreground" />
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold">{copy.missingTitle}</h1>
              <p className="text-muted-foreground">{copy.missingHint}</p>
            </div>
            <Button type="button" size="xl" onClick={onStartOver}>
              {copy.startOver}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
