"use client"

import { useI18n } from "@/i18n/locale-provider"
import { STATUS_META } from "@/lib/status"
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export type StatusFilter = AppointmentStatus | "all"

interface StatusFilterTabsProps {
  value: StatusFilter
  counts: Readonly<Record<AppointmentStatus, number>>
  onChange: (value: StatusFilter) => void
}

/** Quick filter over the day's appointments, with a count per status. */
export function StatusFilterTabs({ value, counts, onChange }: StatusFilterTabsProps) {
  const { t } = useI18n()
  const total = APPOINTMENT_STATUSES.reduce((sum, status) => sum + counts[status], 0)

  return (
    <div
      role="group"
      aria-label={t.admin.filters.label}
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:px-0.5"
    >
      <FilterChip
        label={t.admin.filters.all}
        count={total}
        pressed={value === "all"}
        onClick={() => onChange("all")}
      />
      {APPOINTMENT_STATUSES.map((status) => (
        <FilterChip
          key={status}
          label={t.status[status]}
          count={counts[status]}
          swatch={STATUS_META[status].swatch}
          pressed={value === status}
          onClick={() => onChange(value === status ? "all" : status)}
        />
      ))}
    </div>
  )
}

interface FilterChipProps {
  label: string
  count: number
  /** Colour class of the status dot. Omitted for "All". */
  swatch?: string
  pressed: boolean
  onClick: () => void
}

function FilterChip({ label, count, swatch, pressed, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        pressed
          ? "border-slate-100 bg-slate-100 text-slate-950"
          : "border-white/15 text-slate-200 hover:border-white/35 hover:bg-white/5"
      )}
    >
      {swatch && <span aria-hidden className={cn("size-2.5 rounded-full", swatch)} />}
      {label}
      <span
        className={cn(
          "tabular-nums",
          pressed ? "text-slate-600" : "text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  )
}
