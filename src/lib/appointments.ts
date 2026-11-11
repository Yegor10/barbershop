/**
 * Read-side helpers that combine the seeded schedule with appointments
 * created or edited in this browser.
 */
import { addDays, startOfDay } from "date-fns"

import { getShopHours, getWorkingBarbers, isBlocking } from "@/lib/availability"
import { toDateKey } from "@/lib/format"
import { getSeedAppointments } from "@/lib/mock-data"
import type {
  Appointment,
  AppointmentStatus,
  ClientRecord,
  StoredAppointments,
} from "@/lib/types"

function byStart(a: Appointment, b: Appointment): number {
  return a.start < b.start ? -1 : a.start > b.start ? 1 : 0
}

/**
 * Every appointment on a calendar day. A stored appointment replaces the
 * seeded one with the same id, including when it was moved to another day.
 */
export function getAppointmentsForDate(
  date: Date,
  now: Date,
  stored: StoredAppointments
): Appointment[] {
  const dateKey = toDateKey(date)
  const seeded = getSeedAppointments(date, now).filter(
    (appointment) => !(appointment.id in stored)
  )
  const own = Object.values(stored).filter(
    (appointment) => toDateKey(appointment.start) === dateKey
  )
  return [...seeded, ...own].sort(byStart)
}

export type DayAppointmentsLookup = (date: Date) => readonly Appointment[]

/**
 * A memoised `getAppointmentsForDate` for one moment in time. Searching for
 * the next opening asks about the same days again and again; each day is
 * merged once per lookup.
 */
export function createDayAppointmentsLookup(
  now: Date | null,
  stored: StoredAppointments
): DayAppointmentsLookup {
  const cache = new Map<string, Appointment[]>()
  return (date) => {
    if (!now) return []
    const key = toDateKey(date)
    let appointments = cache.get(key)
    if (!appointments) {
      appointments = getAppointmentsForDate(date, now, stored)
      cache.set(key, appointments)
    }
    return appointments
  }
}

export interface DayStats {
  /** Appointments that are still going ahead or already happened. */
  bookings: number
  /** Value of those appointments in dollars. */
  expectedRevenue: number
  /** Booked chair time as a share of the chair time on offer, 0–1. */
  occupancy: number
  /** Completed visits as a share of visits that have an outcome, or null. */
  completionRate: number | null
  barbersWorking: number
  byStatus: Record<AppointmentStatus, number>
}

export function getDayStats(
  date: Date,
  appointments: readonly Appointment[]
): DayStats {
  const byStatus: Record<AppointmentStatus, number> = {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  }
  let expectedRevenue = 0
  let bookedMinutes = 0

  for (const appointment of appointments) {
    byStatus[appointment.status] += 1
    if (isBlocking(appointment)) {
      expectedRevenue += appointment.price
      bookedMinutes += appointment.durationMin
    }
  }

  const hours = getShopHours(date)
  const barbersWorking = getWorkingBarbers(date).length
  const capacity = hours ? (hours.closeMin - hours.openMin) * barbersWorking : 0
  const settled = byStatus.completed + byStatus.cancelled + byStatus.no_show

  return {
    bookings: appointments.filter(isBlocking).length,
    expectedRevenue,
    occupancy: capacity > 0 ? Math.min(1, bookedMinutes / capacity) : 0,
    completionRate: settled > 0 ? byStatus.completed / settled : null,
    barbersWorking,
    byStatus,
  }
}

/** How far back and ahead the client directory looks. */
export const CLIENT_HISTORY_DAYS = 45
export const CLIENT_LOOKAHEAD_DAYS = 14

function clientKey(appointment: Appointment): string {
  const phoneDigits = appointment.client.phone.replace(/\D/g, "")
  return `${appointment.client.fullName.trim().toLowerCase()}|${phoneDigits}`
}

/** Groups recent and upcoming appointments into one record per client. */
export function buildClientDirectory(
  now: Date,
  stored: StoredAppointments
): ClientRecord[] {
  const today = startOfDay(now)
  const nowIso = now.toISOString()
  const records = new Map<string, ClientRecord>()
  const barberCounts = new Map<string, Map<string, number>>()

  for (
    let offset = -CLIENT_HISTORY_DAYS;
    offset <= CLIENT_LOOKAHEAD_DAYS;
    offset += 1
  ) {
    for (const appointment of getAppointmentsForDate(
      addDays(today, offset),
      now,
      stored
    )) {
      const key = clientKey(appointment)
      let record = records.get(key)
      if (!record) {
        record = {
          key,
          fullName: appointment.client.fullName,
          phone: appointment.client.phone,
          email: appointment.client.email,
          visits: 0,
          noShows: 0,
          totalSpent: 0,
          lastVisit: null,
          nextVisit: null,
          favouriteBarberId: null,
          history: [],
        }
        records.set(key, record)
        barberCounts.set(key, new Map())
      }

      record.history.push(appointment)
      record.email ??= appointment.client.email

      if (appointment.status === "no_show") record.noShows += 1
      if (appointment.status === "completed") {
        record.visits += 1
        record.totalSpent += appointment.price
        if (!record.lastVisit || appointment.start > record.lastVisit) {
          record.lastVisit = appointment.start
        }
      }
      if (
        (appointment.status === "pending" || appointment.status === "confirmed") &&
        appointment.start > nowIso &&
        (!record.nextVisit || appointment.start < record.nextVisit)
      ) {
        record.nextVisit = appointment.start
      }
      if (appointment.status !== "cancelled") {
        const counts = barberCounts.get(key)
        counts?.set(appointment.barberId, (counts.get(appointment.barberId) ?? 0) + 1)
      }
    }
  }

  for (const record of records.values()) {
    record.history.sort((a, b) => -byStart(a, b))
    const counts = [...(barberCounts.get(record.key)?.entries() ?? [])]
    counts.sort((a, b) => b[1] - a[1])
    record.favouriteBarberId = counts[0]?.[0] ?? null
  }

  return [...records.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  )
}
