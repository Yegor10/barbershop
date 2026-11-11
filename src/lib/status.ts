import {
  Ban,
  CalendarCheck,
  CircleCheck,
  Hourglass,
  Scissors,
  UserX,
  type LucideIcon,
} from "lucide-react"

import type { AppointmentStatus } from "@/lib/types"

export interface StatusMeta {
  icon: LucideIcon
  /** Pill badge: border, tint and text colour. */
  badge: string
  /** Solid swatch for dots and the edge of schedule blocks. */
  swatch: string
  /** Schedule block: border and tint. */
  block: string
}

/**
 * One look per status, shared by badges, filters and schedule blocks.
 * Each status has its own hue and its own icon, so colour is never the only
 * cue. Labels come from the dictionary (`t.status`).
 */
export const STATUS_META: Readonly<Record<AppointmentStatus, StatusMeta>> = {
  pending: {
    icon: Hourglass,
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    swatch: "bg-amber-400",
    block: "border-amber-400/45 bg-amber-950/80 hover:bg-amber-900/70",
  },
  confirmed: {
    icon: CalendarCheck,
    badge: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    swatch: "bg-sky-400",
    block: "border-sky-400/40 bg-sky-950/90 hover:bg-sky-900/70",
  },
  in_progress: {
    icon: Scissors,
    badge: "border-violet-400/45 bg-violet-400/10 text-violet-300",
    swatch: "bg-violet-400",
    block: "border-violet-400/50 bg-violet-950/90 hover:bg-violet-900/70",
  },
  completed: {
    icon: CircleCheck,
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    swatch: "bg-emerald-400",
    block: "border-emerald-400/30 bg-emerald-950/70 hover:bg-emerald-900/60",
  },
  cancelled: {
    icon: Ban,
    badge: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    swatch: "bg-rose-400",
    block: "border-dashed border-rose-400/40 bg-rose-950/50 hover:bg-rose-900/50",
  },
  no_show: {
    icon: UserX,
    badge: "border-slate-400/40 bg-slate-400/10 text-slate-300",
    swatch: "bg-slate-400",
    block: "border-dashed border-slate-400/45 bg-slate-800/70 hover:bg-slate-800",
  },
}
