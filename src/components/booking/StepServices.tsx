"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { canAddService } from "@/components/booking/wizard-state"
import { useI18n } from "@/i18n/locale-provider"
import { SERVICES, SLOT_RULES } from "@/lib/mock-data"
import { SERVICE_CATEGORIES, type Service } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepServicesProps {
  selectedIds: readonly string[]
  onToggle: (serviceId: string) => void
}

/** Step 1: pick one or more services. */
export function StepServices({ selectedIds, onToggle }: StepServicesProps) {
  const { t, fmt } = useI18n()
  const hasLockedOption = SERVICES.some(
    (service) =>
      !selectedIds.includes(service.id) && !canAddService(selectedIds, service.id)
  )

  return (
    <div className="flex flex-col gap-7">
      {SERVICE_CATEGORIES.map((category) => (
        <section key={category} aria-labelledby={`services-${category}`}>
          <h3
            id={`services-${category}`}
            className="pb-2.5 text-sm font-medium text-muted-foreground"
          >
            {t.services.categories[category]}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {SERVICES.filter((service) => service.category === category).map(
              (service) => {
                const selected = selectedIds.includes(service.id)
                return (
                  <li key={service.id}>
                    <ServiceOption
                      service={service}
                      selected={selected}
                      locked={!selected && !canAddService(selectedIds, service.id)}
                      onToggle={onToggle}
                    />
                  </li>
                )
              }
            )}
          </ul>
        </section>
      ))}

      <AnimatePresence>
        {hasLockedOption && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            {t.booking.services.limitReached(
              fmt.duration(SLOT_RULES.maxDurationMin)
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ServiceOptionProps {
  service: Service
  selected: boolean
  /** Adding it would push the booking past the time limit. */
  locked: boolean
  onToggle: (serviceId: string) => void
}

function ServiceOption({ service, selected, locked, onToggle }: ServiceOptionProps) {
  const { tr, fmt } = useI18n()

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={locked}
      onClick={() => {
        if (!locked) onToggle(service.id)
      }}
      whileTap={locked ? undefined : { scale: 0.985 }}
      className={cn(
        "focus-ring flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-amber-500 bg-amber-500/10"
          : "border-white/10 bg-slate-900/60 hover:border-white/25 hover:bg-slate-900",
        locked && "cursor-not-allowed opacity-45 hover:border-white/10 hover:bg-slate-900/60"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
          selected ? "border-amber-500 bg-amber-500 text-slate-950" : "border-white/25"
        )}
      >
        <AnimatePresence initial={false}>
          {selected && (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
            >
              <Check className="size-4" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-semibold leading-snug">{tr(service.name)}</span>
        <span className="text-sm leading-snug text-muted-foreground">
          {tr(service.description)}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="numerals text-2xl leading-none">
          {fmt.price(service.price)}
        </span>
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {fmt.duration(service.durationMin)}
        </span>
      </span>
    </motion.button>
  )
}
