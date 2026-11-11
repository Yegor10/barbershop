"use client"

import { useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { addMinutes, isSameDay, startOfDay } from "date-fns"
import { Plus } from "lucide-react"

import type { StatusFilter } from "@/components/admin/StatusFilterTabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/i18n/locale-provider"
import { getShopHours, isBarberWorking } from "@/lib/availability"
import { BARBERS, getServices } from "@/lib/mock-data"
import { STATUS_META } from "@/lib/status"
import type { Appointment, Barber, DayHours } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Vertical scale of the timeline. */
const PX_PER_MIN = 1.7
/** Breathing room above the first and below the last hour line. */
const EDGE_PX = 14
/** Empty cells that can be clicked to add a booking. */
const ADD_SLOT_MIN = 30

const GRID_COLUMNS = `4rem repeat(${BARBERS.length}, minmax(11.5rem, 1fr))`

function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

interface PlacedAppointment {
  appointment: Appointment
  lane: number
  lanes: number
}

/**
 * Appointments that overlap in one chair (a cancelled visit and the walk-in
 * that took its place) are laid side by side instead of on top of each other.
 */
function placeInLanes(appointments: readonly Appointment[]): PlacedAppointment[] {
  const sorted = [...appointments].sort(
    (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end)
  )
  const placed: PlacedAppointment[] = []
  let cluster: PlacedAppointment[] = []
  let laneEnds: string[] = []
  let clusterEnd = ""

  const closeCluster = () => {
    for (const item of cluster) item.lanes = laneEnds.length
    cluster = []
    laneEnds = []
    clusterEnd = ""
  }

  for (const appointment of sorted) {
    if (cluster.length > 0 && appointment.start >= clusterEnd) closeCluster()

    let lane = laneEnds.findIndex((end) => end <= appointment.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(appointment.end)
    } else {
      laneEnds[lane] = appointment.end
    }

    const item: PlacedAppointment = { appointment, lane, lanes: 1 }
    cluster.push(item)
    placed.push(item)
    if (appointment.end > clusterEnd) clusterEnd = appointment.end
  }
  closeCluster()

  return placed
}

interface ScheduleGridProps {
  date: Date
  now: Date
  /** Every appointment on `date`. */
  appointments: readonly Appointment[]
  /** Appointments with another status are dimmed, not hidden. */
  statusFilter: StatusFilter
  onOpenAppointment: (appointmentId: string) => void
  /** A free cell was clicked: start a booking for that barber and time. */
  onAddAt: (barberId: string, start: string) => void
}

/** The day as a timeline: one column per barber, one block per appointment. */
export function ScheduleGrid({
  date,
  now,
  appointments,
  statusFilter,
  onOpenAppointment,
  onAddAt,
}: ScheduleGridProps) {
  const { t, fmt } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const hours = getShopHours(date)
  const isToday = isSameDay(date, now)
  const dateTime = date.getTime()

  const byBarber = useMemo(() => {
    const groups = new Map<string, PlacedAppointment[]>()
    for (const barber of BARBERS) {
      groups.set(
        barber.id,
        placeInLanes(appointments.filter((item) => item.barberId === barber.id))
      )
    }
    return groups
  }, [appointments])

  const nowMinute = minuteOfDay(now)
  const nowOffset =
    hours && isToday && nowMinute >= hours.openMin && nowMinute <= hours.closeMin
      ? EDGE_PX + (nowMinute - hours.openMin) * PX_PER_MIN
      : null
  const hasNowLine = nowOffset !== null

  // Open the day at the current time rather than at opening time.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const marker = container.querySelector<HTMLElement>("[data-now-marker]")
    container.scrollTop = marker ? Math.max(0, marker.offsetTop - 150) : 0
  }, [dateTime, hasNowLine])

  if (!hours) return null

  const bodyHeight = (hours.closeMin - hours.openMin) * PX_PER_MIN + EDGE_PX * 2
  const hourMarks: number[] = []
  for (let minute = hours.openMin; minute <= hours.closeMin; minute += 60) {
    hourMarks.push(minute)
  }

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={t.admin.grid.label}
      tabIndex={0}
      className="focus-ring relative max-h-[max(30rem,calc(100dvh-11rem))] overflow-auto rounded-xl border border-white/10 bg-slate-900/60"
    >
      <div className="grid min-w-[50rem]" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        {/* Header row */}
        <div className="sticky top-0 left-0 z-30 border-r border-b border-white/10 bg-slate-900">
          <span className="sr-only">{t.admin.grid.timeColumn}</span>
        </div>
        {BARBERS.map((barber) => (
          <BarberHeader
            key={barber.id}
            barber={barber}
            working={isBarberWorking(barber, date)}
            count={
              byBarber
                .get(barber.id)
                ?.filter(({ appointment }) => appointment.status !== "cancelled").length ?? 0
            }
          />
        ))}

        {/* Time gutter */}
        <div
          className="sticky left-0 z-20 border-r border-white/10 bg-slate-900"
          style={{ height: bodyHeight }}
        >
          {hourMarks.map((minute) => (
            <span
              key={minute}
              className="numerals absolute right-2.5 -translate-y-1/2 text-lg leading-none text-slate-400"
              style={{ top: EDGE_PX + (minute - hours.openMin) * PX_PER_MIN }}
            >
              {fmt.minuteOfDay(minute)}
            </span>
          ))}
          {nowOffset !== null && (
            <span
              data-now-marker
              className="numerals absolute right-1.5 z-10 -translate-y-1/2 rounded bg-amber-500 px-1.5 py-0.5 text-base leading-none text-slate-950"
              style={{ top: nowOffset }}
            >
              <span className="sr-only">{t.admin.grid.now}: </span>
              {fmt.time(now)}
            </span>
          )}
        </div>

        {/* One column per barber */}
        {BARBERS.map((barber) => (
          <BarberColumn
            key={barber.id}
            barber={barber}
            date={date}
            now={now}
            hours={hours}
            height={bodyHeight}
            nowOffset={nowOffset}
            placed={byBarber.get(barber.id) ?? []}
            statusFilter={statusFilter}
            onOpenAppointment={onOpenAppointment}
            onAddAt={onAddAt}
          />
        ))}
      </div>
    </div>
  )
}

interface BarberHeaderProps {
  barber: Barber
  working: boolean
  count: number
}

function BarberHeader({ barber, working, count }: BarberHeaderProps) {
  const { t, tr } = useI18n()
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-l border-white/10 bg-slate-900 px-3 py-2.5">
      <Image
        src={barber.avatar}
        alt=""
        width={36}
        height={36}
        className={cn("size-9 shrink-0 rounded-full object-cover", !working && "opacity-40 grayscale")}
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{tr(barber.name)}</span>
        <span className="truncate text-xs text-muted-foreground">
          {working ? t.admin.grid.appointments(count) : t.admin.grid.dayOff}
        </span>
      </div>
    </div>
  )
}

interface BarberColumnProps {
  barber: Barber
  date: Date
  now: Date
  hours: DayHours
  height: number
  nowOffset: number | null
  placed: readonly PlacedAppointment[]
  statusFilter: StatusFilter
  onOpenAppointment: (appointmentId: string) => void
  onAddAt: (barberId: string, start: string) => void
}

function BarberColumn({
  barber,
  date,
  now,
  hours,
  height,
  nowOffset,
  placed,
  statusFilter,
  onOpenAppointment,
  onAddAt,
}: BarberColumnProps) {
  const { t, tr, fmt } = useI18n()
  const working = isBarberWorking(barber, date)
  const dayStart = startOfDay(date)

  const addSlots: Date[] = []
  if (working) {
    for (
      let minute = hours.openMin;
      minute + ADD_SLOT_MIN <= hours.closeMin;
      minute += ADD_SLOT_MIN
    ) {
      const start = addMinutes(dayStart, minute)
      // A cell stays clickable until it is over.
      if (addMinutes(start, ADD_SLOT_MIN) > now) addSlots.push(start)
    }
  }

  return (
    <div
      className={cn(
        "relative border-l border-white/10",
        !working &&
          "bg-[repeating-linear-gradient(-45deg,transparent_0_10px,rgb(148_163_184/0.06)_10px_20px)]"
      )}
      style={{
        height,
        backgroundImage: working
          ? "linear-gradient(to bottom, rgb(148 163 184 / 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.07) 1px, transparent 1px)"
          : undefined,
        backgroundSize: working
          ? `100% ${60 * PX_PER_MIN}px, 100% ${30 * PX_PER_MIN}px`
          : undefined,
        backgroundPosition: working ? `0 ${EDGE_PX}px` : undefined,
      }}
    >
      {!working && (
        <p className="sticky top-16 px-3 pt-6 text-center text-sm text-muted-foreground">
          {t.admin.grid.dayOff}
        </p>
      )}

      {addSlots.map((start) => {
        const time = fmt.time(start)
        return (
          <button
            key={start.getTime()}
            type="button"
            tabIndex={-1}
            aria-label={t.admin.grid.addAt(tr(barber.name), time)}
            onClick={() => onAddAt(barber.id, start.toISOString())}
            className="group/slot absolute inset-x-0 text-left transition-colors hover:bg-amber-500/10"
            style={{
              top: EDGE_PX + (minuteOfDay(start) - hours.openMin) * PX_PER_MIN,
              height: ADD_SLOT_MIN * PX_PER_MIN,
            }}
          >
            <span className="hidden items-center gap-1 px-2 pt-1.5 text-xs font-medium text-amber-300 group-hover/slot:flex">
              <Plus aria-hidden className="size-3.5" />
              {time}
            </span>
          </button>
        )
      })}

      {placed.map(({ appointment, lane, lanes }) => (
        <AppointmentBlock
          key={appointment.id}
          appointment={appointment}
          top={
            EDGE_PX +
            (minuteOfDay(new Date(appointment.start)) - hours.openMin) * PX_PER_MIN
          }
          height={appointment.durationMin * PX_PER_MIN}
          lane={lane}
          lanes={lanes}
          dimmed={statusFilter !== "all" && appointment.status !== statusFilter}
          onOpen={onOpenAppointment}
        />
      ))}

      {nowOffset !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-10 h-0.5 -translate-y-1/2 bg-amber-500"
          style={{ top: nowOffset }}
        />
      )}
    </div>
  )
}

interface AppointmentBlockProps {
  appointment: Appointment
  top: number
  height: number
  lane: number
  lanes: number
  dimmed: boolean
  onOpen: (appointmentId: string) => void
}

function AppointmentBlock({
  appointment,
  top,
  height,
  lane,
  lanes,
  dimmed,
  onOpen,
}: AppointmentBlockProps) {
  const { t, tr, fmt } = useI18n()
  const meta = STATUS_META[appointment.status]
  const Icon = meta.icon
  const name = fmt.personName(appointment.client.fullName)
  const timeRange = fmt.timeRange(appointment.start, appointment.end)
  const struck = appointment.status === "cancelled" || appointment.status === "no_show"

  return (
    <button
      type="button"
      onClick={() => onOpen(appointment.id)}
      aria-label={t.admin.grid.openAppointment(name, timeRange, t.status[appointment.status])}
      className={cn(
        "focus-ring absolute z-[5] flex overflow-hidden rounded-md border text-left transition-[background-color,opacity]",
        meta.block,
        dimmed && "opacity-25 hover:opacity-70"
      )}
      style={{
        top: top + 1,
        height: height - 2,
        left: `calc(${(lane / lanes) * 100}% + 3px)`,
        width: `calc(${100 / lanes}% - 6px)`,
      }}
    >
      <span aria-hidden className={cn("w-1 shrink-0", meta.swatch)} />
      <span
        className={cn(
          "flex min-w-0 flex-1 flex-col px-2",
          height < 40 ? "justify-center" : "gap-0.5 py-1.5"
        )}
      >
        <span className="flex items-center justify-between gap-1.5">
          <span
            className={cn(
              "truncate text-[0.8125rem] leading-tight font-semibold",
              struck && "text-slate-300 line-through"
            )}
          >
            {name}
          </span>
          <Icon aria-hidden className="size-3.5 shrink-0 opacity-80" />
        </span>
        {height >= 40 && (
          <span className="truncate text-xs leading-tight text-slate-300 tabular-nums">
            {timeRange}
          </span>
        )}
        {height >= 70 && (
          <span className="truncate text-xs leading-tight text-slate-400">
            {getServices(appointment.serviceIds)
              .map((service) => tr(service.name))
              .join(", ")}
          </span>
        )}
      </span>
    </button>
  )
}

/** Placeholder with the grid's shape, shown while a day loads. */
export function ScheduleGridSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60"
    >
      <div className="grid min-w-[50rem]" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        <div className="border-r border-b border-white/10 bg-slate-900" />
        {BARBERS.map((barber) => (
          <div
            key={barber.id}
            className="flex items-center gap-3 border-b border-l border-white/10 bg-slate-900 px-3 py-2.5"
          >
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-[4.4rem] border-r border-white/10 px-2 py-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-10" />
          ))}
        </div>
        {BARBERS.map((barber, column) => (
          <div
            key={barber.id}
            className="flex h-[30rem] flex-col gap-3 border-l border-white/10 p-2"
          >
            {[72, 104, 56, 88].map((blockHeight, index) => (
              <Skeleton
                key={index}
                className="rounded-md"
                style={{
                  height: blockHeight,
                  marginTop: (index + column) % 2 === 0 ? 0 : 28,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
