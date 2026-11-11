/**
 * Simulated booking API.
 *
 * These functions stand in for server endpoints: they take a moment, check
 * availability again against the latest schedule, and only then write. That
 * second check is what prevents double booking when two people go for the
 * same slot.
 */
import { addMinutes } from "date-fns"

import { getAppointmentsForDate } from "@/lib/appointments"
import { getDaySlots, isBarberFree, pickBarberForSlot } from "@/lib/availability"
import { getStoredAppointments, saveAppointment } from "@/lib/booking-store"
import { createBookingId, totalsFor } from "@/lib/mock-data"
import {
  ANY_BARBER,
  type Appointment,
  type AppointmentSource,
  type AppointmentStatus,
  type BarberChoice,
  type ClientInfo,
} from "@/lib/types"

const NETWORK_DELAY_MS = 900
/** How long the shop "takes" to confirm an online booking. */
const CONFIRMATION_DELAY_MS = 2600

export class SlotUnavailableError extends Error {
  constructor() {
    super("That time was just taken")
    this.name = "SlotUnavailableError"
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export interface CreateBookingInput {
  serviceIds: string[]
  barberId: BarberChoice
  /** ISO start of the chosen slot. */
  slotStart: string
  client: ClientInfo
}

/** Books a slot for a client from the public booking flow. */
export async function createBooking(
  input: CreateBookingInput
): Promise<Appointment> {
  await wait(NETWORK_DELAY_MS)

  const now = new Date()
  const start = new Date(input.slotStart)
  const { durationMin, price } = totalsFor(input.serviceIds)
  const dayAppointments = getAppointmentsForDate(
    start,
    now,
    getStoredAppointments()
  )

  const slot = getDaySlots({
    date: start,
    durationMin,
    barberId: input.barberId,
    appointments: dayAppointments,
    now,
  }).find((candidate) => candidate.start === input.slotStart)

  if (!slot?.available) throw new SlotUnavailableError()

  const barberId =
    input.barberId === ANY_BARBER
      ? pickBarberForSlot(slot, dayAppointments)
      : input.barberId
  if (!barberId) throw new SlotUnavailableError()

  const appointment: Appointment = {
    id: createBookingId(),
    barberId,
    serviceIds: input.serviceIds,
    start: slot.start,
    end: slot.end,
    durationMin,
    price,
    status: "pending",
    source: "online",
    client: input.client,
    createdAt: now.toISOString(),
  }
  saveAppointment(appointment)

  // The shop confirms a moment later, unless someone changed it meanwhile.
  window.setTimeout(() => {
    const current = getStoredAppointments()[appointment.id]
    if (current?.status === "pending") {
      saveAppointment({ ...current, status: "confirmed" })
    }
  }, CONFIRMATION_DELAY_MS)

  return appointment
}

export interface CreateManualBookingInput {
  serviceIds: string[]
  barberId: string
  start: string
  client: ClientInfo
  source: AppointmentSource
}

/** Adds a walk-in or phone booking from the dashboard. */
export function createManualBooking(
  input: CreateManualBookingInput
): Appointment {
  const now = new Date()
  const start = new Date(input.start)
  const { durationMin, price } = totalsFor(input.serviceIds)
  const end = addMinutes(start, durationMin)
  const dayAppointments = getAppointmentsForDate(
    start,
    now,
    getStoredAppointments()
  )

  if (!isBarberFree(input.barberId, start, end, dayAppointments)) {
    throw new SlotUnavailableError()
  }

  // Someone who is already in the shop goes straight into the chair.
  const startsNow = start.getTime() <= now.getTime() + 5 * 60_000
  const appointment: Appointment = {
    id: createBookingId(),
    barberId: input.barberId,
    serviceIds: input.serviceIds,
    start: start.toISOString(),
    end: end.toISOString(),
    durationMin,
    price,
    status: startsNow ? "in_progress" : "confirmed",
    source: input.source,
    client: input.client,
    createdAt: now.toISOString(),
  }
  saveAppointment(appointment)
  return appointment
}

/** Changes the status of an appointment (seeded or stored). */
export function updateAppointmentStatus(
  appointment: Appointment,
  status: AppointmentStatus
): Appointment {
  const next = { ...appointment, status }
  saveAppointment(next)
  return next
}

/** Moves an appointment to another barber, day or time. */
export function rescheduleAppointment(
  appointment: Appointment,
  target: { barberId: string; start: string }
): Appointment {
  const now = new Date()
  const start = new Date(target.start)
  const end = addMinutes(start, appointment.durationMin)
  const dayAppointments = getAppointmentsForDate(
    start,
    now,
    getStoredAppointments()
  )

  if (
    !isBarberFree(target.barberId, start, end, dayAppointments, appointment.id)
  ) {
    throw new SlotUnavailableError()
  }

  const next: Appointment = {
    ...appointment,
    barberId: target.barberId,
    start: start.toISOString(),
    end: end.toISOString(),
  }
  saveAppointment(next)
  return next
}
