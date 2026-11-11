"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { isBefore, isSameDay, startOfDay } from "date-fns"
import { CalendarPlus, FilterX, Plus, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/AdminHeader"
import { AppointmentDialog } from "@/components/admin/AppointmentDialog"
import { ClientsDirectory } from "@/components/admin/ClientsDirectory"
import { DateNavigator } from "@/components/admin/DateNavigator"
import { MetricsBar } from "@/components/admin/MetricsBar"
import { ScheduleGrid, ScheduleGridSkeleton } from "@/components/admin/ScheduleGrid"
import { StatusFilterTabs, type StatusFilter } from "@/components/admin/StatusFilterTabs"
import { WalkInDialog, type WalkInPrefill } from "@/components/admin/WalkInDialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useDayAppointments } from "@/hooks/use-day-appointments"
import { useNow } from "@/hooks/use-now"
import { useSimulatedLatency } from "@/hooks/use-simulated-latency"
import { useI18n } from "@/i18n/locale-provider"
import { getDayStats } from "@/lib/appointments"
import { getShopHours } from "@/lib/availability"
import { resetStoredAppointments } from "@/lib/booking-store"
import { fromDateKey, toDateKey } from "@/lib/format"
import type { Appointment, ClientRecord } from "@/lib/types"

type AdminView = "schedule" | "clients"

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * The staff dashboard: a day's schedule with metrics and filters, and the
 * client directory. The day and the open section live in the URL
 * (`?date=2026-11-12&view=clients`), so they survive a refresh and a
 * language switch.
 */
export function AdminDashboard() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const now = useNow()
  const getAppointments = useDayAppointments(now)

  const view: AdminView = searchParams.get("view") === "clients" ? "clients" : "schedule"
  const dateParam = searchParams.get("date")
  const todayKey = now ? toDateKey(now) : null
  const dateKey = dateParam && DATE_KEY_PATTERN.test(dateParam) ? dateParam : todayKey
  const date = useMemo(() => (dateKey ? fromDateKey(dateKey) : null), [dateKey])

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [openAppointmentId, setOpenAppointmentId] = useState<string | null>(null)
  const [walkIn, setWalkIn] = useState<WalkInPrefill | null>(null)

  const isLoadingDay = useSimulatedLatency(dateKey ?? "", 380)
  const appointments = useMemo(
    () => (date ? getAppointments(date) : []),
    [date, getAppointments]
  )
  const stats = useMemo(
    () => (date && now ? getDayStats(date, appointments) : null),
    [date, now, appointments]
  )

  function updateQuery(next: { view?: AdminView; dateKey?: string }) {
    const params = new URLSearchParams(window.location.search)
    if (next.view === "clients") params.set("view", "clients")
    if (next.view === "schedule") params.delete("view")
    if (next.dateKey) {
      if (next.dateKey === todayKey) params.delete("date")
      else params.set("date", next.dateKey)
    }
    const query = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    )
  }

  function showDay(nextDateKey: string) {
    setStatusFilter("all")
    setOpenAppointmentId(null)
    updateQuery({ dateKey: nextDateKey })
  }

  // Walk-ins can't be added to a day that has passed: those go on today.
  const bookingDate =
    date && now ? (isBefore(date, startOfDay(now)) ? startOfDay(now) : date) : null

  function handleCreated(appointment: Appointment) {
    setWalkIn(null)
    setStatusFilter("all")
    updateQuery({ view: "schedule", dateKey: toDateKey(appointment.start) })
  }

  function handleMoved(appointment: Appointment) {
    if (toDateKey(appointment.start) !== dateKey) setOpenAppointmentId(null)
  }

  function handleNewBookingFor(client: ClientRecord) {
    setWalkIn({ fullName: client.fullName, phone: client.phone, source: "phone" })
  }

  function handleReset() {
    resetStoredAppointments()
    setOpenAppointmentId(null)
    toast.success(t.admin.resetDone)
  }

  const isReady = now !== null && date !== null && stats !== null && !isLoadingDay
  const isToday = now !== null && date !== null && isSameDay(date, now)
  const upcoming = stats ? stats.byStatus.pending + stats.byStatus.confirmed : 0
  const filterIsEmpty =
    stats !== null && statusFilter !== "all" && stats.byStatus[statusFilter] === 0
  const openAppointment =
    appointments.find((appointment) => appointment.id === openAppointmentId) ?? null

  return (
    <Tabs
      value={view}
      onValueChange={(next) => updateQuery({ view: next as AdminView })}
      className="flex min-h-dvh flex-col gap-0"
    >
      <AdminHeader />

      <main className="mx-auto flex w-full max-w-[104rem] flex-1 flex-col px-4 pt-6 pb-28 sm:px-6">
        <TabsContent value="schedule" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            {now && date ? (
              <DateNavigator date={date} now={now} onChange={showDay} />
            ) : (
              <Skeleton className="h-14 w-96 max-w-full" />
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-sm text-muted-foreground">{t.admin.demoNote}</p>
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3.5"
                onClick={handleReset}
              >
                <RotateCcw aria-hidden />
                {t.admin.resetDemo}
              </Button>
            </div>
          </div>

          <MetricsBar stats={isReady ? stats : null} isToday={isToday} upcoming={upcoming} />

          {isReady ? (
            <StatusFilterTabs
              value={statusFilter}
              counts={stats.byStatus}
              onChange={setStatusFilter}
            />
          ) : (
            <div className="flex gap-2 overflow-hidden py-0.5">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-32 shrink-0 rounded-full" />
              ))}
            </div>
          )}

          {!isReady ? (
            <ScheduleGridSkeleton label={t.admin.grid.loading} />
          ) : !getShopHours(date) ? (
            <EmptyPanel
              icon={<CalendarPlus aria-hidden className="size-7 text-muted-foreground" />}
              title={t.admin.grid.closedTitle}
              hint={t.admin.grid.closedHint}
            />
          ) : filterIsEmpty ? (
            <EmptyPanel
              icon={<FilterX aria-hidden className="size-7 text-muted-foreground" />}
              title={t.admin.grid.emptyFilterTitle(t.status[statusFilter])}
              hint={t.admin.grid.emptyFilterHint}
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4"
                  onClick={() => setStatusFilter("all")}
                >
                  {t.admin.grid.showAll}
                </Button>
              }
            />
          ) : (
            <>
              {appointments.length === 0 && (
                <p
                  role="status"
                  className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm"
                >
                  <span className="font-semibold">{t.admin.grid.emptyDayTitle}.</span>{" "}
                  <span className="text-muted-foreground">{t.admin.grid.emptyDayHint}</span>
                </p>
              )}
              <ScheduleGrid
                date={date}
                now={now}
                appointments={appointments}
                statusFilter={statusFilter}
                onOpenAppointment={setOpenAppointmentId}
                onAddAt={(barberId, start) => setWalkIn({ barberId, start })}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <ClientsDirectory now={now} onNewBooking={handleNewBookingFor} />
        </TabsContent>
      </main>

      {/* Floating action: add a walk-in from anywhere in the dashboard. */}
      <Button
        type="button"
        size="xl"
        disabled={!bookingDate}
        onClick={() => setWalkIn({})}
        className="fixed right-4 bottom-4 z-30 h-14 rounded-full px-6 shadow-2xl shadow-black/60 sm:right-6 sm:bottom-6"
      >
        <Plus aria-hidden className="size-5" />
        {t.admin.walkIn.fab}
      </Button>

      {now && bookingDate && (
        <>
          <WalkInDialog
            prefill={walkIn}
            date={bookingDate}
            now={now}
            getAppointments={getAppointments}
            onClose={() => setWalkIn(null)}
            onCreated={handleCreated}
          />
          <AppointmentDialog
            appointment={openAppointment}
            now={now}
            getAppointments={getAppointments}
            onClose={() => setOpenAppointmentId(null)}
            onMoved={handleMoved}
          />
        </>
      )}
    </Tabs>
  )
}

interface EmptyPanelProps {
  icon: React.ReactNode
  title: string
  hint: string
  action?: React.ReactNode
}

function EmptyPanel({ icon, title, hint, action }: EmptyPanelProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-white/15 p-6">
      {icon}
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="max-w-lg text-muted-foreground">{hint}</p>
      </div>
      {action}
    </div>
  )
}
