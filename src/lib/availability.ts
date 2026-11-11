/**
 * Time-slot logic: opening hours, who is working, which starts are free.
 * Pure functions over appointments, so the booking wizard and the dashboard
 * always agree on what "available" means.
 */
import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns"

import { BARBERS, SHOP_HOURS, SLOT_RULES } from "@/lib/mock-data"
import {
  ANY_BARBER,
  type Appointment,
  type AppointmentStatus,
  type Barber,
  type BarberChoice,
  type BookingSlot,
  type DayHours,
} from "@/lib/types"

/** Statuses that hold a chair. Cancelled and no-show appointments free it. */
const BLOCKING_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
])

export function isBlocking(appointment: Appointment): boolean {
  return BLOCKING_STATUSES.has(appointment.status)
}

export function getShopHours(date: Date): DayHours | null {
  return SHOP_HOURS[date.getDay()] ?? null
}

export function isBarberWorking(barber: Barber, date: Date): boolean {
  return getShopHours(date) !== null && !barber.daysOff.includes(date.getDay())
}

export function getWorkingBarbers(date: Date): Barber[] {
  return BARBERS.filter((barber) => isBarberWorking(barber, date))
}

/** Whether `barberId` has the chair free for the whole interval. */
export function isBarberFree(
  barberId: string,
  start: Date,
  end: Date,
  appointments: readonly Appointment[],
  ignoreAppointmentId?: string
): boolean {
  const startMs = start.getTime()
  const endMs = end.getTime()
  return !appointments.some(
    (appointment) =>
      appointment.barberId === barberId &&
      appointment.id !== ignoreAppointmentId &&
      isBlocking(appointment) &&
      new Date(appointment.start).getTime() < endMs &&
      new Date(appointment.end).getTime() > startMs
  )
}

export interface DaySlotsQuery {
  date: Date
  durationMin: number
  barberId: BarberChoice
  /** Every appointment on `date`, for all barbers. */
  appointments: readonly Appointment[]
  now: Date
  /** Minutes between slot starts. Defaults to the online booking grid. */
  stepMin?: number
  /** Notice required before a slot starts. Defaults to the online rule. */
  minLeadMin?: number
  /** Lets an appointment keep its own time while being rescheduled. */
  ignoreAppointmentId?: string
}

/** Every slot start on a day, each marked available or not. */
export function getDaySlots({
  date,
  durationMin,
  barberId,
  appointments,
  now,
  stepMin = SLOT_RULES.stepMin,
  minLeadMin = SLOT_RULES.minLeadMin,
  ignoreAppointmentId,
}: DaySlotsQuery): BookingSlot[] {
  const hours = getShopHours(date)
  if (!hours || durationMin <= 0) return []

  const candidates = getWorkingBarbers(date).filter(
    (barber) => barberId === ANY_BARBER || barber.id === barberId
  )
  if (candidates.length === 0) return []

  const dayStart = startOfDay(date)
  const earliest = addMinutes(now, minLeadMin).getTime()
  const slots: BookingSlot[] = []

  for (
    let minute = hours.openMin;
    minute + durationMin <= hours.closeMin;
    minute += stepMin
  ) {
    const start = addMinutes(dayStart, minute)
    const end = addMinutes(start, durationMin)
    const base = { start: start.toISOString(), end: end.toISOString() }

    if (start.getTime() < earliest) {
      slots.push({
        ...base,
        available: false,
        barberIds: [],
        unavailableReason: "past",
      })
      continue
    }

    const free = candidates
      .filter((barber) =>
        isBarberFree(barber.id, start, end, appointments, ignoreAppointmentId)
      )
      .map((barber) => barber.id)

    slots.push(
      free.length > 0
        ? { ...base, available: true, barberIds: free }
        : { ...base, available: false, barberIds: [], unavailableReason: "booked" }
    )
  }

  return slots
}

/** With "any barber", give the slot to whoever has the lightest day. */
export function pickBarberForSlot(
  slot: BookingSlot,
  appointments: readonly Appointment[]
): string | null {
  if (slot.barberIds.length === 0) return null

  const load = new Map<string, number>(slot.barberIds.map((id) => [id, 0]))
  for (const appointment of appointments) {
    if (isBlocking(appointment) && load.has(appointment.barberId)) {
      load.set(
        appointment.barberId,
        (load.get(appointment.barberId) ?? 0) + appointment.durationMin
      )
    }
  }

  return [...load.entries()].sort((a, b) => a[1] - b[1])[0][0]
}

/** Whether clients can pick this day at all (before looking at slots). */
export function isDateBookable(
  date: Date,
  barberId: BarberChoice,
  now: Date
): boolean {
  const daysAhead = differenceInCalendarDays(date, now)
  if (daysAhead < 0 || daysAhead > SLOT_RULES.horizonDays) return false
  if (!getShopHours(date)) return false
  if (barberId === ANY_BARBER) return getWorkingBarbers(date).length > 0
  const barber = BARBERS.find((candidate) => candidate.id === barberId)
  return barber ? isBarberWorking(barber, date) : false
}

export interface NextOpeningQuery {
  barberId: BarberChoice
  durationMin: number
  now: Date
  /** Looks up every appointment on a given day. */
  getAppointments: (date: Date) => readonly Appointment[]
  /** How many days to search, counting today. */
  maxDays?: number
}

/** The earliest bookable slot from now on, or null if nothing is open. */
export function findNextOpening({
  barberId,
  durationMin,
  now,
  getAppointments,
  maxDays = 14,
}: NextOpeningQuery): BookingSlot | null {
  const today = startOfDay(now)
  for (let offset = 0; offset < maxDays; offset += 1) {
    const date = addDays(today, offset)
    if (!isDateBookable(date, barberId, now)) continue
    const slot = getDaySlots({
      date,
      durationMin,
      barberId,
      appointments: getAppointments(date),
      now,
    }).find((candidate) => candidate.available)
    if (slot) return slot
  }
  return null
}

/** "Open until 8 PM", "Opens at 9 AM", … for the shop right now. */
export function getOpenState(now: Date): {
  isOpen: boolean
  /** Minutes after midnight of the next change (close today / next open). */
  changesAtMin: number | null
  /** The day the shop next opens, when it's closed. */
  opensOn: Date | null
} {
  const minuteNow = now.getHours() * 60 + now.getMinutes()
  const today = getShopHours(now)

  if (today && minuteNow >= today.openMin && minuteNow < today.closeMin) {
    return { isOpen: true, changesAtMin: today.closeMin, opensOn: null }
  }
  if (today && minuteNow < today.openMin) {
    return { isOpen: false, changesAtMin: today.openMin, opensOn: startOfDay(now) }
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const date = addDays(startOfDay(now), offset)
    const hours = getShopHours(date)
    if (hours) return { isOpen: false, changesAtMin: hours.openMin, opensOn: date }
  }
  return { isOpen: false, changesAtMin: null, opensOn: null }
}
