import { useMemo } from "react"

import {
  createDayAppointmentsLookup,
  type DayAppointmentsLookup,
} from "@/lib/appointments"
import { useStoredAppointments } from "@/lib/booking-store"

export type { DayAppointmentsLookup }

/**
 * A lookup for "every appointment on this day", combining the seeded schedule
 * with bookings made in this browser. The lookup is rebuilt whenever a booking
 * changes (in this tab or another), which is what keeps availability live.
 */
export function useDayAppointments(now: Date | null): DayAppointmentsLookup {
  const stored = useStoredAppointments()
  return useMemo(() => createDayAppointmentsLookup(now, stored), [now, stored])
}
