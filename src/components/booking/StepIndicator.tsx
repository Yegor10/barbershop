"use client"

import { Check } from "lucide-react"
import { motion } from "motion/react"

import { WIZARD_STEPS, type WizardStepId } from "@/components/booking/wizard-state"
import { useI18n } from "@/i18n/locale-provider"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  /** Index of the step on screen. */
  current: number
  /** Furthest step the client may jump to. Steps beyond it are locked. */
  maxReachable: number
  /** When false (on the ticket) the steps are no longer navigable. */
  interactive: boolean
  onStepSelect: (step: number) => void
}

/**
 * Progress through the booking. A barber-pole stripe fills the track as steps
 * are completed; on wider screens each step is also a labelled button.
 */
export function StepIndicator({
  current,
  maxReachable,
  interactive,
  onStepSelect,
}: StepIndicatorProps) {
  const { t } = useI18n()
  const total = WIZARD_STEPS.length
  const currentId: WizardStepId = WIZARD_STEPS[current]
  const progress = ((current + 1) / total) * 100

  return (
    <nav aria-label={t.booking.progressLabel} className="mx-auto w-full max-w-6xl px-4">
      {/* Phone: one line of text above the track. */}
      <p className="flex items-baseline justify-between gap-3 pb-2 text-sm sm:hidden">
        <span className="text-muted-foreground">
          {t.booking.stepOf(current + 1, total)}
        </span>
        <span className="font-semibold">{t.booking.steps[currentId].label}</span>
      </p>

      {/* Tablet and up: every step, numbered because the order matters. */}
      <ol className="hidden grid-cols-5 pb-2.5 sm:grid">
        {WIZARD_STEPS.map((stepId, index) => {
          const isDone = index < current
          const isCurrent = index === current
          const canOpen = interactive && index <= maxReachable && !isCurrent
          const label = t.booking.steps[stepId].label

          const marker = (
            <span
              className={cn(
                "numerals flex size-7 shrink-0 items-center justify-center rounded-full border text-base transition-colors",
                isCurrent && "border-amber-500 bg-amber-500 text-slate-950",
                isDone && "border-amber-500/60 text-amber-400",
                !isCurrent && !isDone && "border-white/15 text-muted-foreground"
              )}
            >
              {isDone ? <Check aria-hidden className="size-4" /> : index + 1}
            </span>
          )

          const text = (
            <span
              className={cn(
                "truncate text-sm transition-colors",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          )

          return (
            <li key={stepId} aria-current={isCurrent ? "step" : undefined}>
              {canOpen ? (
                <button
                  type="button"
                  onClick={() => onStepSelect(index)}
                  className="focus-ring group flex w-full items-center gap-2.5 rounded-md py-1 text-left hover:[&>span:last-child]:text-foreground"
                >
                  {marker}
                  {text}
                </button>
              ) : (
                <span className="flex items-center gap-2.5 py-1">
                  {marker}
                  {text}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`${t.booking.stepOf(current + 1, total)}: ${t.booking.steps[currentId].label}`}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <motion.div
          className="pole-stripe h-full rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
        />
      </div>
    </nav>
  )
}
