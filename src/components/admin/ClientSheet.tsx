"use client"

import { Mail, Phone, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { useI18n } from "@/i18n/locale-provider"
import { toTelHref } from "@/lib/format"
import { getBarber, getServices } from "@/lib/mock-data"
import type { ClientRecord } from "@/lib/types"

interface ClientSheetProps {
  /** The client to show, or `null` when the sheet is closed. */
  client: ClientRecord | null
  onClose: () => void
  onNewBooking: (client: ClientRecord) => void
}

/** One client's contact details, totals and appointment history. */
export function ClientSheet({ client, onClose, onNewBooking }: ClientSheetProps) {
  const { t, tr, fmt } = useI18n()
  const copy = t.admin.clients

  return (
    <Sheet
      open={client !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {client && (
          <>
            <SheetHeader className="gap-1.5 pr-12">
              <SheetTitle className="display font-display text-5xl">
                {fmt.personName(client.fullName)}
              </SheetTitle>
              <SheetDescription>{copy.sheet.description}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-8">
              <ul className="flex flex-col gap-2 text-sm">
                {client.phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone aria-hidden className="size-4 text-muted-foreground" />
                    <a
                      href={toTelHref(client.phone)}
                      className="focus-ring rounded-sm underline-offset-4 hover:underline"
                    >
                      {client.phone}
                    </a>
                  </li>
                )}
                {client.email && (
                  <li className="flex items-center gap-2.5">
                    <Mail aria-hidden className="size-4 text-muted-foreground" />
                    <span className="break-all">{client.email}</span>
                  </li>
                )}
              </ul>

              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
                <SheetStat label={copy.columns.visits} value={fmt.number(client.visits)} />
                <SheetStat label={copy.columns.spent} value={fmt.price(client.totalSpent)} />
                <SheetStat
                  label={copy.columns.lastVisit}
                  value={client.lastVisit ? fmt.dayShort(client.lastVisit) : copy.none}
                  small
                />
                <SheetStat
                  label={copy.columns.nextVisit}
                  value={
                    client.nextVisit
                      ? `${fmt.dayShort(client.nextVisit)}, ${fmt.time(client.nextVisit)}`
                      : copy.none
                  }
                  small
                />
              </dl>

              <Button type="button" size="xl" onClick={() => onNewBooking(client)}>
                <Plus aria-hidden />
                {copy.sheet.newBooking}
              </Button>

              <section aria-labelledby="client-history-title" className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 id="client-history-title" className="text-sm font-semibold">
                    {copy.sheet.history}
                  </h3>
                  {client.noShows > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {copy.sheet.noShows(client.noShows)}
                    </p>
                  )}
                </div>
                <ol className="flex flex-col">
                  {client.history.map((appointment) => {
                    const barber = getBarber(appointment.barberId)
                    return (
                      <li
                        key={appointment.id}
                        className="flex flex-col gap-1.5 border-t border-white/10 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">
                            {fmt.dayShort(appointment.start)},{" "}
                            {fmt.time(appointment.start)}
                          </p>
                          <StatusBadge status={appointment.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getServices(appointment.serviceIds)
                            .map((service) => tr(service.name))
                            .join(", ")}
                        </p>
                        <p className="flex justify-between gap-3 text-sm text-muted-foreground">
                          <span>{barber ? tr(barber.name) : ""}</span>
                          <span className="tabular-nums">{fmt.price(appointment.price)}</span>
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface SheetStatProps {
  label: string
  value: string
  /** Text values (dates) are set smaller than figures. */
  small?: boolean
}

function SheetStat({ label, value, small = false }: SheetStatProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-slate-900 p-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={small ? "text-sm font-medium" : "numerals text-3xl leading-none"}>
        {value}
      </dd>
    </div>
  )
}
