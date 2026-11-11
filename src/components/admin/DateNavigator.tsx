"use client"

import { useState } from "react"
import { addDays, isSameDay } from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { enGB as calendarEn, uk as calendarUk } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useI18n } from "@/i18n/locale-provider"
import { toDateKey } from "@/lib/format"

interface DateNavigatorProps {
  date: Date
  now: Date
  onChange: (dateKey: string) => void
}

/** The day on screen, with previous / next / today and a calendar to jump. */
export function DateNavigator({ date, now, onChange }: DateNavigatorProps) {
  const { t, fmt, locale } = useI18n()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const copy = t.admin.dateNav

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <h1 className="display text-5xl sm:text-6xl">{fmt.dayLong(date)}</h1>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10"
          aria-label={copy.previous}
          onClick={() => onChange(toDateKey(addDays(date, -1)))}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          disabled={isSameDay(date, now)}
          onClick={() => onChange(toDateKey(now))}
        >
          {copy.today}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10"
          aria-label={copy.next}
          onClick={() => onChange(toDateKey(addDays(date, 1)))}
        >
          <ChevronRight aria-hidden className="size-5" />
        </Button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10"
              aria-label={copy.pick}
            >
              <CalendarDays aria-hidden className="size-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-1">
            <Calendar
              mode="single"
              required
              selected={date}
              defaultMonth={date}
              onSelect={(next) => {
                onChange(toDateKey(next))
                setCalendarOpen(false)
              }}
              weekStartsOn={1}
              locale={locale === "uk" ? calendarUk : calendarEn}
              className="[--cell-size:2.25rem]"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
