import { z } from "zod"

import type { LocalizedText } from "@/i18n/config"

/* -------------------------------------------------------------------------- */
/*  Shared domain types                                                       */
/*  Each record has a hand-written interface and a Zod schema that is checked */
/*  against it with `satisfies`, so the two can never drift apart.            */
/* -------------------------------------------------------------------------- */

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES)

export const SERVICE_CATEGORIES = ["hair", "beard", "package"] as const
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const APPOINTMENT_SOURCES = ["online", "walk_in", "phone"] as const
export type AppointmentSource = (typeof APPOINTMENT_SOURCES)[number]

/** Content written once per language (Ukrainian and English). */
export const localizedTextSchema = z.object({
  uk: z.string().min(1),
  en: z.string().min(1),
}) satisfies z.ZodType<LocalizedText>

/** A bundled image (what a static `import photo from "./photo.jpg"` returns). */
export interface ImageAsset {
  src: string
  width: number
  height: number
  blurDataURL?: string
}

export const imageAssetSchema = z.object({
  src: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  blurDataURL: z.string().optional(),
}) satisfies z.ZodType<ImageAsset>

/* --------------------------------- Service -------------------------------- */

export interface Service {
  id: string
  name: LocalizedText
  description: LocalizedText
  category: ServiceCategory
  /** Chair time in minutes. Always a multiple of 15. */
  durationMin: number
  /** Price in whole hryvnias. */
  price: number
}

export const serviceSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  description: localizedTextSchema,
  category: z.enum(SERVICE_CATEGORIES),
  durationMin: z.number().int().positive().multipleOf(15),
  price: z.number().nonnegative(),
}) satisfies z.ZodType<Service>

/* ---------------------------------- Barber -------------------------------- */

export interface Barber {
  id: string
  name: LocalizedText
  /** Shown as a badge, e.g. "Master Barber". */
  title: LocalizedText
  bio: LocalizedText
  /** Button label, e.g. "Book with Illia" (Ukrainian needs the name declined). */
  bookingCta: LocalizedText
  rating: number
  reviewCount: number
  yearsExperience: number
  specialties: LocalizedText[]
  /** Weekdays the barber does not work. 0 = Sunday … 6 = Saturday. */
  daysOff: number[]
  photo: ImageAsset
  avatar: ImageAsset
}

export const barberSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  title: localizedTextSchema,
  bio: localizedTextSchema,
  bookingCta: localizedTextSchema,
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  yearsExperience: z.number().int().nonnegative(),
  specialties: z.array(localizedTextSchema),
  daysOff: z.array(z.number().int().min(0).max(6)),
  photo: imageAssetSchema,
  avatar: imageAssetSchema,
}) satisfies z.ZodType<Barber>

/** In the booking flow a client picks one barber or lets the shop choose. */
export const ANY_BARBER = "any" as const
export type BarberChoice = string | typeof ANY_BARBER

/* ------------------------------- Booking slot ----------------------------- */

export type SlotUnavailableReason = "past" | "booked"

export interface BookingSlot {
  /** ISO 8601 start of the appointment. */
  start: string
  /** ISO 8601 end of the appointment (start + total service duration). */
  end: string
  available: boolean
  /** Barbers who are free for the whole slot. Empty when unavailable. */
  barberIds: string[]
  unavailableReason?: SlotUnavailableReason
}

export const bookingSlotSchema = z.object({
  start: z.iso.datetime(),
  end: z.iso.datetime(),
  available: z.boolean(),
  barberIds: z.array(z.string()),
  unavailableReason: z.enum(["past", "booked"]).optional(),
}) satisfies z.ZodType<BookingSlot>

/* -------------------------------- Client info ----------------------------- */

export interface ClientInfo {
  fullName: string
  /** Full number, "+380 (67) 123-45-67", or empty for a walk-in. */
  phone: string
  email?: string
  notes?: string
}

/** The part of a Ukrainian number the client types after +380. */
export const PHONE_NATIONAL_PATTERN = /^\(\d{2}\) \d{3}-\d{2}-\d{2}$/
export const PHONE_COUNTRY_PREFIX = "+380"

/** Stored shape: the front desk can add a walk-in with only a name. */
export const clientInfoSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string(),
  email: z.string().optional(),
  notes: z.string().optional(),
}) satisfies z.ZodType<ClientInfo>

export interface ClientDetailsMessages {
  nameRequired: string
  nameTooLong: string
  phoneInvalid: string
  emailRequired: string
  emailInvalid: string
  notesTooLong: string
}

/** Step 4 of the booking wizard. Messages come from the active dictionary. */
export function createClientDetailsSchema(messages: ClientDetailsMessages) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, messages.nameRequired)
      .max(60, messages.nameTooLong),
    /** National part only, as formatted by the phone mask. */
    phone: z.string().regex(PHONE_NATIONAL_PATTERN, messages.phoneInvalid),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .pipe(z.email(messages.emailInvalid)),
    notes: z.string().trim().max(240, messages.notesTooLong),
  })
}

export type ClientDetailsFormValues = z.infer<
  ReturnType<typeof createClientDetailsSchema>
>

/* -------------------------------- Appointment ----------------------------- */

export interface Appointment {
  /** Booking reference shown to the client, e.g. "SS-7K4Q2M". */
  id: string
  barberId: string
  serviceIds: string[]
  /** ISO 8601 */
  start: string
  /** ISO 8601 */
  end: string
  durationMin: number
  /** Total in whole hryvnias at the time of booking. */
  price: number
  status: AppointmentStatus
  source: AppointmentSource
  client: ClientInfo
  /** ISO 8601 */
  createdAt: string
}

export const appointmentSchema = z.object({
  id: z.string().min(1),
  barberId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).min(1),
  start: z.iso.datetime(),
  end: z.iso.datetime(),
  durationMin: z.number().int().positive(),
  price: z.number().nonnegative(),
  status: appointmentStatusSchema,
  source: z.enum(APPOINTMENT_SOURCES),
  client: clientInfoSchema,
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<Appointment>

/** Appointments created or edited in this browser, keyed by id. */
export type StoredAppointments = Readonly<Record<string, Appointment>>

export const storedAppointmentsSchema = z.record(z.string(), appointmentSchema)

/* ------------------------------- Admin forms ------------------------------ */

export interface WalkInMessages {
  nameRequired: string
  nameTooLong: string
  phoneInvalid: string
  servicesRequired: string
  barberRequired: string
  startRequired: string
}

/** Quick manual booking from the dashboard (walk-ins and phone bookings). */
export function createWalkInSchema(messages: WalkInMessages) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, messages.nameRequired)
      .max(60, messages.nameTooLong),
    /** National part, or empty: a walk-in doesn't have to leave a number. */
    phone: z
      .string()
      .refine((value) => value === "" || PHONE_NATIONAL_PATTERN.test(value), {
        message: messages.phoneInvalid,
      }),
    serviceIds: z.array(z.string()).min(1, messages.servicesRequired),
    barberId: z.string().min(1, messages.barberRequired),
    /** ISO start time. */
    start: z.string().min(1, messages.startRequired),
    source: z.enum(["walk_in", "phone"]),
  })
}

export type WalkInFormValues = z.infer<ReturnType<typeof createWalkInSchema>>

/** Moving an appointment to another barber, day or time. */
export const rescheduleSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  barberId: z.string().min(1),
  /** ISO start time. */
  start: z.iso.datetime(),
})

export type RescheduleValues = z.infer<typeof rescheduleSchema>

/* ------------------------------ Landing content --------------------------- */

export interface Testimonial {
  id: string
  quote: LocalizedText
  author: LocalizedText
  /** The service they had, shown under the name. */
  serviceId: string
  rating: number
}

export interface GalleryItem {
  id: string
  image: ImageAsset
  /** Describes the photo for screen readers. */
  alt: LocalizedText
  /** Short visible caption naming the style or moment. */
  caption: LocalizedText
}

export interface DayHours {
  /** Minutes after midnight. */
  openMin: number
  closeMin: number
}

/** One client as the front desk sees them, derived from appointments. */
export interface ClientRecord {
  key: string
  fullName: string
  phone: string
  email?: string
  /** Completed visits. */
  visits: number
  noShows: number
  totalSpent: number
  lastVisit: string | null
  nextVisit: string | null
  favouriteBarberId: string | null
  /** Newest first. */
  history: Appointment[]
}
