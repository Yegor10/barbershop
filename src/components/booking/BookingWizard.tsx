"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronUp, Loader2, TriangleAlert } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { BookingHeader } from "@/components/booking/BookingHeader"
import { BookingSummary } from "@/components/booking/BookingSummary"
import { StepBarber } from "@/components/booking/StepBarber"
import { StepDateTime } from "@/components/booking/StepDateTime"
import { StepDetails } from "@/components/booking/StepDetails"
import { StepIndicator } from "@/components/booking/StepIndicator"
import { StepServices } from "@/components/booking/StepServices"
import { TicketScreen } from "@/components/booking/TicketScreen"
import {
  DETAILS_STEP,
  WIZARD_STEPS,
  clearDraft,
  createInitialState,
  maxReachableStep,
  saveDraft,
  wizardReducer,
  type WizardPreselection,
} from "@/components/booking/wizard-state"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDayAppointments } from "@/hooks/use-day-appointments"
import { useNow } from "@/hooks/use-now"
import { useI18n } from "@/i18n/locale-provider"
import { getDaySlots } from "@/lib/availability"
import { SlotUnavailableError, createBooking } from "@/lib/booking-api"
import { toFullPhone } from "@/lib/format"
import { totalsFor } from "@/lib/mock-data"
import type { BarberChoice, ClientDetailsFormValues } from "@/lib/types"

const DETAILS_FORM_ID = "booking-details-form"

/** Replaces the query string without a navigation. */
function setQuery(query: string): void {
  window.history.replaceState(null, "", `${window.location.pathname}${query}`)
  window.scrollTo({ top: 0 })
}

/**
 * The client booking flow: services → barber → date & time → details → ticket.
 *
 * Steps 1–4 live in a reducer (and a per-tab draft). Step 5 is addressed by
 * `?booking=<id>`, so the ticket survives a refresh. Arriving with
 * `?service=<id>` or `?barber=<id>` preselects them.
 */
export function BookingWizard() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking")

  const preselection = useMemo<WizardPreselection>(
    () => ({
      serviceIds: searchParams.getAll("service"),
      barberId: searchParams.get("barber"),
    }),
    [searchParams]
  )

  if (bookingId) {
    return <TicketScreen bookingId={bookingId} onStartOver={() => setQuery("")} />
  }
  return <WizardFlow preselection={preselection} />
}

const stepMotion = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -28 }),
}

interface WizardFlowProps {
  /** Read once, when the flow starts. */
  preselection: WizardPreselection
}

function WizardFlow({ preselection }: WizardFlowProps) {
  const { t, fmt } = useI18n()
  const [state, dispatch] = useReducer(wizardReducer, preselection, createInitialState)
  const [isSubmitting, setSubmitting] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Focus moves to the step title only after the client has navigated.
  const [hasNavigated, setHasNavigated] = useState(false)

  const now = useNow()
  const getAppointments = useDayAppointments(now)

  const stepId = WIZARD_STEPS[state.step]
  const stepCopy = t.booking.steps[stepId]
  const { durationMin, price } = totalsFor(state.serviceIds)

  useEffect(() => {
    saveDraft(state)
  }, [state])

  // The preselection has been applied; a refresh should resume, not restart.
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])

  // Someone else may take the chosen time while the client is still deciding.
  const slotLost = useMemo(() => {
    if (!now || !state.slotStart || state.barberId === null) return false
    const date = new Date(state.slotStart)
    const slot = getDaySlots({
      date,
      durationMin: totalsFor(state.serviceIds).durationMin,
      barberId: state.barberId,
      appointments: getAppointments(date),
      now,
    }).find((candidate) => candidate.start === state.slotStart)
    return !slot?.available
  }, [now, state.slotStart, state.barberId, state.serviceIds, getAppointments])

  const canContinue =
    (state.step === 0 && state.serviceIds.length > 0) ||
    (state.step === 1 && state.barberId !== null) ||
    (state.step === 2 && state.slotStart !== null && !slotLost)

  function go(action: { type: "next" } | { type: "back" } | { type: "goTo"; step: number }) {
    setHasNavigated(true)
    dispatch(action)
    window.scrollTo({ top: 0 })
  }

  const handleDraftChange = useCallback(
    (details: ClientDetailsFormValues) => dispatch({ type: "saveDetails", details }),
    []
  )

  async function handleConfirm(values: ClientDetailsFormValues) {
    if (!state.slotStart || state.barberId === null) return
    setSubmitting(true)
    try {
      const appointment = await createBooking({
        serviceIds: state.serviceIds,
        barberId: state.barberId,
        slotStart: state.slotStart,
        client: {
          fullName: values.fullName,
          phone: toFullPhone(values.phone),
          email: values.email,
          notes: values.notes || undefined,
        },
      })
      clearDraft()
      setQuery(`?booking=${encodeURIComponent(appointment.id)}`)
    } catch (error) {
      setSubmitting(false)
      if (error instanceof SlotUnavailableError) {
        toast.error(t.booking.actions.slotTaken)
        setHasNavigated(true)
        dispatch({ type: "clearSlot" })
      } else {
        toast.error(t.booking.actions.failed)
      }
    }
  }

  const primaryAction =
    state.step === DETAILS_STEP ? (
      <Button
        type="submit"
        form={DETAILS_FORM_ID}
        size="xl"
        disabled={isSubmitting || slotLost}
        className="min-w-40"
      >
        {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
        {isSubmitting ? t.booking.actions.confirming : t.booking.actions.confirm}
      </Button>
    ) : (
      <Button
        type="button"
        size="xl"
        disabled={!canContinue}
        onClick={() => go({ type: "next" })}
        className="min-w-32"
      >
        {t.common.continue}
      </Button>
    )

  return (
    <div className="flex min-h-dvh flex-col">
      <BookingHeader />
      <StepIndicator
        current={state.step}
        maxReachable={maxReachableStep(state)}
        interactive={!isSubmitting}
        onStepSelect={(step) => go({ type: "goTo", step })}
      />

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 pt-7 pb-32 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-16">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={state.direction} initial={false}>
            <motion.section
              key={stepId}
              custom={state.direction}
              variants={stepMotion}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-labelledby="booking-step-title"
            >
              <StepHeading
                title={stepCopy.title}
                hint={stepCopy.hint}
                autoFocus={hasNavigated}
              />

              {stepId === "services" && (
                <StepServices
                  selectedIds={state.serviceIds}
                  onToggle={(serviceId) => dispatch({ type: "toggleService", serviceId })}
                />
              )}

              {stepId === "barber" && (
                <StepBarber
                  selected={state.barberId}
                  onSelect={(barberId: BarberChoice) =>
                    dispatch({ type: "selectBarber", barberId })
                  }
                  durationMin={durationMin}
                  now={now}
                  getAppointments={getAppointments}
                />
              )}

              {stepId === "time" && state.barberId !== null && (
                <StepDateTime
                  barberId={state.barberId}
                  durationMin={durationMin}
                  dateKey={state.dateKey}
                  slotStart={state.slotStart}
                  now={now}
                  getAppointments={getAppointments}
                  onSelectDate={(dateKey) => dispatch({ type: "selectDate", dateKey })}
                  onSelectSlot={(dateKey, slotStart) =>
                    dispatch({ type: "selectSlot", dateKey, slotStart })
                  }
                />
              )}

              {stepId === "details" && (
                <div className="flex flex-col gap-6">
                  {slotLost && (
                    <div
                      role="alert"
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
                    >
                      <p className="flex items-center gap-2.5 text-sm font-medium text-red-200">
                        <TriangleAlert aria-hidden className="size-4 shrink-0" />
                        {t.booking.actions.slotTaken}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4"
                        onClick={() => go({ type: "goTo", step: 2 })}
                      >
                        {t.booking.steps.time.title}
                      </Button>
                    </div>
                  )}
                  <StepDetails
                    formId={DETAILS_FORM_ID}
                    defaultValues={state.details}
                    disabled={isSubmitting}
                    onDraftChange={handleDraftChange}
                    onSubmit={handleConfirm}
                  />
                </div>
              )}
            </motion.section>
          </AnimatePresence>

          {/* Desktop actions sit under the step; phones get the bar below. */}
          <div className="hidden items-center justify-between gap-4 pt-8 lg:flex">
            {state.step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="xl"
                disabled={isSubmitting}
                onClick={() => go({ type: "back" })}
              >
                <ArrowLeft aria-hidden />
                {t.common.back}
              </Button>
            ) : (
              <span />
            )}
            {primaryAction}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="glass sticky top-6 rounded-2xl p-6">
            <BookingSummary
              serviceIds={state.serviceIds}
              barberId={state.barberId}
              slotStart={slotLost ? null : state.slotStart}
              now={now}
            />
          </div>
        </aside>
      </main>

      {/* Phone: thumb-reach action bar with the running total. */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          {state.step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-12 shrink-0"
              disabled={isSubmitting}
              aria-label={t.common.back}
              onClick={() => go({ type: "back" })}
            >
              <ArrowLeft aria-hidden className="size-5" />
            </Button>
          )}

          {state.serviceIds.length > 0 ? (
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              aria-label={`${t.booking.summary.open}: ${fmt.price(price)}, ${fmt.duration(durationMin)}`}
              className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left"
            >
              <span className="flex min-w-0 flex-col">
                <motion.span
                  key={price}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="numerals text-[1.7rem] leading-none"
                >
                  {fmt.price(price)}
                </motion.span>
                <span className="truncate pt-1 text-xs text-muted-foreground">
                  {fmt.duration(durationMin)}
                </span>
              </span>
              <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <p className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
              {t.booking.summary.empty}
            </p>
          )}

          {primaryAction}
        </div>
      </div>

      <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t.booking.summary.title}</SheetTitle>
            <SheetDescription className="sr-only">
              {t.booking.summary.open}
            </SheetDescription>
          </SheetHeader>
          <BookingSummary
            serviceIds={state.serviceIds}
            barberId={state.barberId}
            slotStart={slotLost ? null : state.slotStart}
            now={now}
            showTitle={false}
            className="px-4 pb-8"
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface StepHeadingProps {
  title: string
  hint: string
  /** Move focus here when the step was reached by navigating, not on load. */
  autoFocus: boolean
}

function StepHeading({ title, hint, autoFocus }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true })
  }, [autoFocus])

  return (
    <div className="flex flex-col gap-2 pb-6">
      <h1
        id="booking-step-title"
        ref={ref}
        tabIndex={-1}
        className="display text-5xl outline-none sm:text-6xl"
      >
        {title}
      </h1>
      {hint && <p className="max-w-xl text-muted-foreground">{hint}</p>}
    </div>
  )
}
