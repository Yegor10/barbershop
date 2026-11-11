import { differenceInCalendarDays, format, type Locale as DateFnsLocale } from "date-fns"
import { enGB, uk as ukDateLocale } from "date-fns/locale"

import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"
import { transliterate } from "@/i18n/translit"

type DateInput = Date | string

export interface Formatters {
  /** date-fns locale, for components that format dates themselves. */
  dateLocale: DateFnsLocale
  /** 650 → "650 ₴" / "₴650" */
  price: (amount: number) => string
  /** 1453 → "1 453" / "1,453" */
  number: (value: number, fractionDigits?: number) => string
  /** 0.72 → "72%" */
  percent: (ratio: number) => string
  /** 75 → "1 год 15 хв" / "1 h 15 min" */
  duration: (minutes: number) => string
  /** "14:30" */
  time: (date: DateInput) => string
  /** "14:30–15:15" */
  timeRange: (start: DateInput, end: DateInput) => string
  /** Minutes after midnight → "09:00" */
  minuteOfDay: (minutes: number) => string
  /** "чт, 12 листоп." / "Thu, 12 Nov" */
  dayShort: (date: DateInput) => string
  /** Compact, for tight spots: "чт, 12.11" / "Thu, 12 Nov" */
  dayCompact: (date: DateInput) => string
  /** "Четвер, 12 листопада" / "Thursday, 12 November" */
  dayLong: (date: DateInput) => string
  /** "12 листопада 2026" / "12 November 2026" */
  dateFull: (date: DateInput) => string
  /** "Сьогодні" / "Завтра" / "Чт, 12 листоп." */
  relativeDay: (date: DateInput, now: Date) => string
  /** "сьогодні о 14:30" / "чт, 12 листоп., 14:30" */
  relativeDayTime: (date: DateInput, now: Date) => string
  /** 0 = Sunday … 6 = Saturday → "Неділя" / "Sunday" */
  weekday: (dayIndex: number) => string
  /** → "нд" / "Sun" */
  weekdayShort: (dayIndex: number) => string
  /** Client names are stored as typed; in English, Cyrillic is romanised. */
  personName: (name: string) => string
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

/** 2024-01-07 was a Sunday, so adding the weekday index gives that weekday. */
function sampleWeekday(dayIndex: number): Date {
  return new Date(2024, 0, 7 + dayIndex)
}

export function createFormatters(locale: Locale, t: Dictionary): Formatters {
  const isUk = locale === "uk"
  const dateLocale = isUk ? ukDateLocale : enGB
  const numberLocale = isUk ? "uk-UA" : "en-GB"
  const options = { locale: dateLocale }

  const time = (date: DateInput) => format(new Date(date), "HH:mm")
  const dayShort = (date: DateInput) =>
    format(new Date(date), isUk ? "EEEEEE, d MMM" : "EEE, d MMM", options)

  const number = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(numberLocale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)

  const relativeLabel = (date: DateInput, now: Date): string | null => {
    const diff = differenceInCalendarDays(new Date(date), now)
    if (diff === 0) return t.common.today
    if (diff === 1) return t.common.tomorrow
    if (diff === -1) return t.common.yesterday
    return null
  }

  return {
    dateLocale,
    price: (amount) => (isUk ? `${number(amount)} ₴` : `₴${number(amount)}`),
    number,
    percent: (ratio) => `${Math.round(ratio * 100)}%`,
    duration: (minutes) => {
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      const { hoursShort, minutesShort } = t.common
      if (hours === 0) return `${rest} ${minutesShort}`
      if (rest === 0) return `${hours} ${hoursShort}`
      return `${hours} ${hoursShort} ${rest} ${minutesShort}`
    },
    time,
    timeRange: (start, end) => `${time(start)}–${time(end)}`,
    minuteOfDay: (minutes) => time(new Date(2000, 0, 1, 0, minutes)),
    dayShort,
    dayCompact: (date) =>
      format(new Date(date), isUk ? "EEEEEE, dd.MM" : "EEE, d MMM", options),
    dayLong: (date) =>
      capitalize(format(new Date(date), "EEEE, d MMMM", options)),
    dateFull: (date) => format(new Date(date), "d MMMM yyyy", options),
    relativeDay: (date, now) =>
      relativeLabel(date, now) ?? capitalize(dayShort(date)),
    relativeDayTime: (date, now) => {
      const label = relativeLabel(date, now)
      return label
        ? t.common.dayAtTime(label.toLocaleLowerCase(), time(date))
        : `${dayShort(date)}, ${time(date)}`
    },
    weekday: (dayIndex) =>
      capitalize(format(sampleWeekday(dayIndex), "EEEE", options)),
    weekdayShort: (dayIndex) =>
      format(sampleWeekday(dayIndex), isUk ? "EEEEEE" : "EEE", options),
    personName: (name) => (isUk ? name : transliterate(name)),
  }
}
