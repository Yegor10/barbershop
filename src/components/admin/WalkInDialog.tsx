"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DayAppointmentsLookup } from "@/hooks/use-day-appointments"
import { useI18n } from "@/i18n/locale-provider"
import { getDaySlots, getWorkingBarbers } from "@/lib/availability"
import { SlotUnavailableError, createManualBooking } from "@/lib/booking-api"
import { formatPhoneInput, toFullPhone, toNationalPhone } from "@/lib/format"
import { SERVICES, SLOT_RULES, totalsFor } from "@/lib/mock-data"
import {
  PHONE_COUNTRY_PREFIX,
  createWalkInSchema,
  type Appointment,
  type WalkInFormValues,
} from "@/lib/types"
import { cn } from "@/lib/utils"

/** What the dialog starts with: a clicked cell, or a client from the directory. */
export interface WalkInPrefill {
  barberId?: string
  /** ISO time the booking should start at, or as soon after as possible. */
  start?: string
  fullName?: string
  phone?: string
  source?: WalkInFormValues["source"]
}

interface WalkInDialogProps {
  /** `null` keeps the dialog closed. */
  prefill: WalkInPrefill | null
  /** The day the booking is for. */
  date: Date
  now: Date
  getAppointments: DayAppointmentsLookup
  onClose: () => void
  onCreated: (appointment: Appointment) => void
}

/** Quick manual booking for walk-ins and phone calls. */
export function WalkInDialog({
  prefill,
  date,
  now,
  getAppointments,
  onClose,
  onCreated,
}: WalkInDialogProps) {
  const { t, fmt } = useI18n()

  return (
    <Dialog
      open={prefill !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto p-5 sm:max-w-xl sm:p-6">
        <DialogHeader className="gap-2 pr-8">
          <DialogTitle className="display font-display text-5xl">{t.admin.walkIn.title}</DialogTitle>
          <DialogDescription>
            {t.admin.walkIn.description} {fmt.dayLong(date)}.
          </DialogDescription>
        </DialogHeader>
        {prefill && (
          <WalkInForm
            prefill={prefill}
            date={date}
            now={now}
            getAppointments={getAppointments}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/** The first open start at or after `preferred`; otherwise the first one. */
function pickStart(starts: readonly string[], preferred?: string): string {
  if (preferred) {
    const next = starts.find((candidate) => candidate >= preferred)
    if (next) return next
  }
  return starts[0] ?? ""
}

interface WalkInFormProps {
  prefill: WalkInPrefill
  date: Date
  now: Date
  getAppointments: DayAppointmentsLookup
  onCreated: (appointment: Appointment) => void
}

function WalkInForm({ prefill, date, now, getAppointments, onCreated }: WalkInFormProps) {
  const { t, tr, fmt } = useI18n()
  const copy = t.admin.walkIn
  const workingBarbers = useMemo(() => getWorkingBarbers(date), [date])

  /** Open start times for a barber and a set of services on this day. */
  function startsFor(serviceIds: readonly string[], barberId: string): string[] {
    const { durationMin } = totalsFor(serviceIds)
    if (durationMin === 0 || !barberId) return []
    return getDaySlots({
      date,
      durationMin,
      barberId,
      appointments: getAppointments(date),
      now,
      stepMin: SLOT_RULES.adminStepMin,
      // Someone standing in the shop can start in the current quarter-hour.
      minLeadMin: -(SLOT_RULES.adminStepMin - 1),
    })
      .filter((slot) => slot.available)
      .map((slot) => slot.start)
  }

  // Start from the most common service, the clicked barber (or the first one
  // with room today) and the earliest time that fits.
  const [defaultValues] = useState<WalkInFormValues>(() => {
    const serviceIds = ["signature-haircut"]
    const barberId =
      prefill.barberId ??
      workingBarbers.find((barber) => startsFor(serviceIds, barber.id).length > 0)?.id ??
      workingBarbers[0]?.id ??
      ""
    return {
      fullName: prefill.fullName ?? "",
      phone: prefill.phone ? toNationalPhone(prefill.phone) : "",
      serviceIds,
      barberId,
      start: pickStart(startsFor(serviceIds, barberId), prefill.start),
      source: prefill.source ?? "walk_in",
    }
  })

  const schema = useMemo(() => createWalkInSchema(copy.errors), [copy.errors])
  const form = useForm<WalkInFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues,
  })

  const { errors, isSubmitting } = form.formState
  const serviceIds = useWatch({ control: form.control, name: "serviceIds" })
  const barberId = useWatch({ control: form.control, name: "barberId" })
  const start = useWatch({ control: form.control, name: "start" })
  const source = useWatch({ control: form.control, name: "source" })

  const starts = startsFor(serviceIds, barberId)
  const totals = totalsFor(serviceIds)

  /** After services or barber change, keep the start valid. */
  function syncStart(nextServiceIds: readonly string[], nextBarberId: string) {
    const nextStarts = startsFor(nextServiceIds, nextBarberId)
    const current = form.getValues("start")
    if (!nextStarts.includes(current)) {
      form.setValue("start", pickStart(nextStarts, current || prefill.start), {
        shouldValidate: form.formState.isSubmitted,
      })
    }
  }

  function toggleService(serviceId: string) {
    const current = form.getValues("serviceIds")
    const next = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId]
    form.setValue("serviceIds", next, { shouldValidate: true, shouldDirty: true })
    syncStart(next, form.getValues("barberId"))
  }

  function onSubmit(values: WalkInFormValues) {
    try {
      const appointment = createManualBooking({
        serviceIds: values.serviceIds,
        barberId: values.barberId,
        start: values.start,
        source: values.source,
        client: { fullName: values.fullName, phone: toFullPhone(values.phone) },
      })
      toast.success(copy.created(values.fullName, fmt.time(appointment.start)))
      onCreated(appointment)
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        toast.error(copy.conflict)
        form.setValue("start", pickStart(startsFor(values.serviceIds, values.barberId)))
      } else {
        throw error
      }
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.fullName)}>
          <FieldLabel htmlFor="walk-in-name">{copy.clientName}</FieldLabel>
          <Input
            id="walk-in-name"
            autoComplete="off"
            placeholder={copy.clientNamePlaceholder}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "walk-in-name-error" : undefined}
            className="h-11 px-3 text-base md:text-base"
            {...form.register("fullName")}
          />
          <FieldError id="walk-in-name-error" errors={[errors.fullName]} />
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="walk-in-phone">
            {copy.phone}{" "}
            <span className="font-normal text-muted-foreground">
              ({t.common.optional})
            </span>
          </FieldLabel>
          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-muted-foreground"
                >
                  {PHONE_COUNTRY_PREFIX}
                </span>
                <Input
                  id="walk-in-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="(67) 123-45-67"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "walk-in-phone-error" : undefined}
                  className="h-11 pr-3 pl-[3.4rem] text-base md:text-base"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(formatPhoneInput(event.target.value))
                  }
                />
              </div>
            )}
          />
          <FieldError id="walk-in-phone-error" errors={[errors.phone]} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-medium">{copy.source}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["walk_in", "phone"] as const).map((option) => (
            <label
              key={option}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-400",
                source === option
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-white/12 text-slate-300 hover:border-white/30"
              )}
            >
              <input
                type="radio"
                value={option}
                className="sr-only"
                {...form.register("source")}
              />
              {t.source[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-medium">{copy.services}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICES.map((service) => {
            const checked = serviceIds.includes(service.id)
            const locked =
              !checked &&
              totals.durationMin + service.durationMin > SLOT_RULES.maxDurationMin
            return (
              <label
                key={service.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-amber-400",
                  checked
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-white/12 hover:border-white/30",
                  locked && "cursor-not-allowed opacity-45 hover:border-white/12"
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  disabled={locked}
                  onChange={() => toggleService(service.id)}
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-amber-500 bg-amber-500 text-slate-950"
                      : "border-white/25"
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{tr(service.name)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {fmt.duration(service.durationMin)}, {fmt.price(service.price)}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <FieldError errors={[errors.serviceIds]} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.barberId)}>
          <FieldLabel id="walk-in-barber-label">{copy.barber}</FieldLabel>
          <Select
            value={barberId}
            onValueChange={(next) => {
              form.setValue("barberId", next, { shouldValidate: true })
              syncStart(form.getValues("serviceIds"), next)
            }}
          >
            <SelectTrigger
              aria-labelledby="walk-in-barber-label"
              aria-invalid={Boolean(errors.barberId)}
              className="h-11! w-full px-3"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workingBarbers.map((barber) => (
                <SelectItem key={barber.id} value={barber.id}>
                  {tr(barber.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.barberId]} />
        </Field>

        <Field data-invalid={Boolean(errors.start)}>
          <FieldLabel id="walk-in-start-label">{copy.start}</FieldLabel>
          <Select
            value={start}
            onValueChange={(next) =>
              form.setValue("start", next, { shouldValidate: true })
            }
            disabled={starts.length === 0}
          >
            <SelectTrigger
              aria-labelledby="walk-in-start-label"
              aria-invalid={Boolean(errors.start)}
              className="h-11! w-full px-3"
            >
              <SelectValue placeholder="–" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {starts.map((time) => (
                <SelectItem key={time} value={time}>
                  {fmt.time(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {starts.length === 0 ? (
            <p className="text-sm text-amber-300">
              {serviceIds.length === 0 ? copy.pickServicesFirst : copy.noTimes}
            </p>
          ) : (
            <FieldError errors={[errors.start]} />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <p className="flex items-baseline gap-3">
          <span className="numerals text-4xl leading-none">{fmt.price(totals.price)}</span>
          <span className="text-sm text-muted-foreground">
            {fmt.duration(totals.durationMin)}
          </span>
        </p>
        <Button type="submit" size="xl" disabled={isSubmitting}>
          {copy.submit}
        </Button>
      </div>
    </form>
  )
}
