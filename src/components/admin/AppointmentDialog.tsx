"use client"

import { useState } from "react"
import { isBefore, startOfDay } from "date-fns"
import { CalendarDays } from "lucide-react"
import { enGB as calendarEn, uk as calendarUk } from "react-day-picker/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import type { DayAppointmentsLookup } from "@/hooks/use-day-appointments"
import { useI18n } from "@/i18n/locale-provider"
import { getDaySlots, getWorkingBarbers } from "@/lib/availability"
import {
  SlotUnavailableError,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "@/lib/booking-api"
import { fromDateKey, toDateKey, toTelHref } from "@/lib/format"
import { getBarber, getServices, localizeClientNote, SLOT_RULES } from "@/lib/mock-data"
import { STATUS_META } from "@/lib/status"
import {
  APPOINTMENT_STATUSES,
  rescheduleSchema,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

interface AppointmentDialogProps {
  /** The appointment to show, or `null` when the dialog is closed. */
  appointment: Appointment | null
  now: Date
  getAppointments: DayAppointmentsLookup
  onClose: () => void
  /** Called after a move, so the dashboard can follow it to its new day. */
  onMoved: (appointment: Appointment) => void
}

/** Everything about one appointment, with status changes and rescheduling. */
export function AppointmentDialog({
  appointment,
  now,
  getAppointments,
  onClose,
  onMoved,
}: AppointmentDialogProps) {
  return (
    <Dialog
      open={appointment !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        // Focus the dialog itself, so no status button looks preselected.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus()
        }}
        className="max-h-[92dvh] gap-6 overflow-y-auto p-5 sm:max-w-xl sm:p-6"
      >
        {appointment && (
          <AppointmentDetails
            key={appointment.id}
            appointment={appointment}
            now={now}
            getAppointments={getAppointments}
            onMoved={onMoved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface AppointmentDetailsProps {
  appointment: Appointment
  now: Date
  getAppointments: DayAppointmentsLookup
  onMoved: (appointment: Appointment) => void
}

function AppointmentDetails({
  appointment,
  now,
  getAppointments,
  onMoved,
}: AppointmentDetailsProps) {
  const { t, tr, fmt, locale } = useI18n()
  const copy = t.admin.appointment

  const [dateKey, setDateKey] = useState(() => toDateKey(appointment.start))
  const [barberId, setBarberId] = useState(appointment.barberId)
  const [start, setStart] = useState(appointment.start)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const barber = getBarber(appointment.barberId)
  const services = getServices(appointment.serviceIds)
  const clientName = fmt.personName(appointment.client.fullName)

  /** Start times this appointment could move to for a given day and barber. */
  function timesFor(targetDateKey: string, targetBarberId: string): string[] {
    const date = fromDateKey(targetDateKey)
    const times = getDaySlots({
      date,
      durationMin: appointment.durationMin,
      barberId: targetBarberId,
      appointments: getAppointments(date),
      now,
      stepMin: SLOT_RULES.adminStepMin,
      minLeadMin: 0,
      ignoreAppointmentId: appointment.id,
    })
      .filter((slot) => slot.available)
      .map((slot) => slot.start)

    // Its current time stays selectable even once it has started.
    const keepsOwnTime =
      targetDateKey === toDateKey(appointment.start) &&
      targetBarberId === appointment.barberId
    if (keepsOwnTime && !times.includes(appointment.start)) {
      times.push(appointment.start)
      times.sort()
    }
    return times
  }

  const targetDate = fromDateKey(dateKey)
  const workingBarbers = getWorkingBarbers(targetDate)
  const times = timesFor(dateKey, barberId)
  const hasChanged = start !== appointment.start || barberId !== appointment.barberId
  const canMove = hasChanged && times.includes(start)

  /** Keeps the same time of day when the day or barber changes, if it's free. */
  function retarget(nextDateKey: string, nextBarberId: string) {
    const nextTimes = timesFor(nextDateKey, nextBarberId)
    const sameTime = nextTimes.find(
      (candidate) => fmt.time(candidate) === fmt.time(start || appointment.start)
    )
    setDateKey(nextDateKey)
    setBarberId(nextBarberId)
    setStart(sameTime ?? "")
  }

  function handleDateChange(date: Date) {
    const nextDateKey = toDateKey(date)
    const working = getWorkingBarbers(date)
    const nextBarberId = working.some((candidate) => candidate.id === barberId)
      ? barberId
      : (working[0]?.id ?? barberId)
    retarget(nextDateKey, nextBarberId)
    setCalendarOpen(false)
  }

  function handleStatusChange(status: AppointmentStatus) {
    if (status === appointment.status) return
    updateAppointmentStatus(appointment, status)
    toast.success(copy.statusChanged(t.status[status]))
  }

  function handleMove() {
    const parsed = rescheduleSchema.safeParse({ dateKey, barberId, start })
    if (!parsed.success) return
    try {
      const moved = rescheduleAppointment(appointment, {
        barberId: parsed.data.barberId,
        start: parsed.data.start,
      })
      toast.success(copy.moved(fmt.relativeDayTime(moved.start, now)))
      onMoved(moved)
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        toast.error(copy.conflict)
        setStart("")
      } else {
        throw error
      }
    }
  }

  return (
    <>
      <DialogHeader className="gap-3 pr-8">
        <div className="flex flex-wrap items-center gap-3">
          <DialogTitle className="numerals font-display text-4xl leading-none tracking-wide">
            {copy.title(appointment.id)}
          </DialogTitle>
          <StatusBadge status={appointment.status} />
        </div>
        <DialogDescription>{copy.description}</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
        <DetailRow label={copy.client}>{clientName}</DetailRow>
        <DetailRow label={copy.phone}>
          {appointment.client.phone ? (
            <a
              href={toTelHref(appointment.client.phone)}
              className="focus-ring rounded-sm underline underline-offset-4 hover:text-amber-300"
            >
              {appointment.client.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">{copy.noPhone}</span>
          )}
        </DetailRow>
        <DetailRow label={copy.services}>
          {services.map((service) => tr(service.name)).join(", ")}
        </DetailRow>
        <DetailRow label={copy.barber}>{barber ? tr(barber.name) : ""}</DetailRow>
        <DetailRow label={copy.when}>
          {fmt.relativeDay(appointment.start, now)},{" "}
          {fmt.timeRange(appointment.start, appointment.end)} (
          {fmt.duration(appointment.durationMin)})
        </DetailRow>
        <DetailRow label={copy.price}>{fmt.price(appointment.price)}</DetailRow>
        <DetailRow label={copy.source}>{t.source[appointment.source]}</DetailRow>
        {appointment.client.notes && (
          <DetailRow label={copy.notes}>
            {localizeClientNote(appointment.client.notes, locale)}
          </DetailRow>
        )}
      </dl>

      <section aria-labelledby="appointment-status-title" className="flex flex-col gap-3">
        <h3 id="appointment-status-title" className="text-sm font-semibold">
          {copy.status}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {APPOINTMENT_STATUSES.map((status) => {
            const meta = STATUS_META[status]
            const Icon = meta.icon
            const active = status === appointment.status
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  "focus-ring flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
                  active
                    ? meta.badge
                    : "border-white/12 text-slate-300 hover:border-white/30 hover:bg-white/5"
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                <span className="truncate">{t.status[status]}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section
        aria-labelledby="appointment-reschedule-title"
        className="flex flex-col gap-3 border-t pt-5"
      >
        <h3 id="appointment-reschedule-title" className="text-sm font-semibold">
          {copy.reschedule}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span id="reschedule-date-label" className="text-sm text-muted-foreground">
              {copy.date}
            </span>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-labelledby="reschedule-date-label reschedule-date-value"
                  className="h-11 justify-start gap-2 px-3 font-normal"
                >
                  <CalendarDays aria-hidden className="size-4 text-muted-foreground" />
                  <span id="reschedule-date-value">{fmt.dayShort(targetDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-1">
                <Calendar
                  mode="single"
                  required
                  selected={targetDate}
                  defaultMonth={targetDate}
                  onSelect={handleDateChange}
                  disabled={(date) => isBefore(date, startOfDay(now))}
                  weekStartsOn={1}
                  locale={locale === "uk" ? calendarUk : calendarEn}
                  className="[--cell-size:2.25rem]"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id="reschedule-barber-label" className="text-sm text-muted-foreground">
              {copy.barber}
            </span>
            <Select
              value={barberId}
              onValueChange={(next) => retarget(dateKey, next)}
            >
              <SelectTrigger
                aria-labelledby="reschedule-barber-label"
                className="h-11! w-full px-3"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workingBarbers.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {tr(candidate.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id="reschedule-time-label" className="text-sm text-muted-foreground">
              {copy.time}
            </span>
            <Select value={start} onValueChange={setStart} disabled={times.length === 0}>
              <SelectTrigger
                aria-labelledby="reschedule-time-label"
                className="h-11! w-full px-3"
              >
                <SelectValue placeholder={times.length === 0 ? copy.noTimes : "–"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {times.map((time) => (
                  <SelectItem key={time} value={time}>
                    {fmt.time(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          size="xl"
          disabled={!canMove}
          onClick={handleMove}
          className="sm:w-fit"
        >
          {copy.move}
        </Button>
      </section>
    </>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </>
  )
}
