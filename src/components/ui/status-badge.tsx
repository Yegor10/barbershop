"use client"

import { useI18n } from "@/i18n/locale-provider"
import { STATUS_META } from "@/lib/status"
import type { AppointmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: AppointmentStatus
  size?: "sm" | "md"
  /** Overrides the default label, e.g. "Awaiting confirmation" on a ticket. */
  label?: string
  className?: string
}

/** Appointment status as a pill with its own colour and icon. */
export function StatusBadge({
  status,
  size = "sm",
  label,
  className,
}: StatusBadgeProps) {
  const { t } = useI18n()
  const meta = STATUS_META[status]
  const Icon = meta.icon

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-2 text-xs" : "h-8 px-3 text-sm",
        meta.badge,
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          size === "sm" ? "size-3" : "size-4",
          status === "in_progress" && "animate-pulse"
        )}
      />
      {label ?? t.status[status]}
    </span>
  )
}
