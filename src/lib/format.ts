/**
 * Language-neutral helpers. Anything that reads differently in Ukrainian and
 * English (prices, durations, dates) lives in `@/i18n/formatters`.
 */
import { format } from "date-fns"

import { PHONE_COUNTRY_PREFIX } from "@/lib/types"

/** Local calendar day as a sortable key, "2026-11-11". */
export function toDateKey(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd")
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Phone mask for the digits after +380.
 * Accepts whatever people type or paste ("0671234567", "+380 67 123 45 67")
 * and returns "(67) 123-45-67".
 */
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("380") && digits.length > 9) digits = digits.slice(3)
  if (digits.startsWith("0")) digits = digits.slice(1)
  digits = digits.slice(0, 9)

  if (digits.length === 0) return ""
  if (digits.length < 3) return `(${digits}`
  if (digits.length < 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length < 8) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`
}

/** "(67) 123-45-67" → "+380 (67) 123-45-67"; empty stays empty. */
export function toFullPhone(national: string): string {
  return national ? `${PHONE_COUNTRY_PREFIX} ${national}` : ""
}

/** "+380 (67) 123-45-67" → "(67) 123-45-67" */
export function toNationalPhone(full: string): string {
  return full.startsWith(PHONE_COUNTRY_PREFIX)
    ? full.slice(PHONE_COUNTRY_PREFIX.length).trim()
    : full
}

/** "+380 (67) 123-45-67" → "tel:+380671234567" */
export function toTelHref(phone: string): string {
  return `tel:+${phone.replace(/\D/g, "")}`
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toLocaleUpperCase()
}

function toCalendarStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

/** A prefilled "create event" link for Google Calendar. */
export function buildGoogleCalendarUrl(event: {
  title: string
  start: string
  end: string
  details: string
  location: string
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarStamp(event.start)}/${toCalendarStamp(event.end)}`,
    details: event.details,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
