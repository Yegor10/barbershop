import Link from "next/link"

import { SectionHeading } from "@/components/landing/SectionHeading"
import type { I18n } from "@/i18n/create-i18n"
import { SERVICES } from "@/lib/mock-data"
import type { Service } from "@/lib/types"

interface ServicesShowcaseProps {
  i18n: I18n
}

/** The price board: every service with its time, price and a way to book it. */
export function ServicesShowcase({ i18n }: ServicesShowcaseProps) {
  const { t } = i18n

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
    >
      <SectionHeading id="services-title" title={t.services.title} lead={t.services.lead} />

      <ul className="mt-12 grid gap-x-12 border-t border-white/15 lg:grid-cols-2">
        {SERVICES.map((service) => (
          <li key={service.id} className="border-b border-white/15">
            <ServiceRow service={service} i18n={i18n} />
          </li>
        ))}
      </ul>
    </section>
  )
}

interface ServiceRowProps {
  service: Service
  i18n: I18n
}

function ServiceRow({ service, i18n }: ServiceRowProps) {
  const { t, tr, fmt, href } = i18n
  const name = tr(service.name)

  return (
    <article className="group relative flex h-full gap-5 py-6 pr-1 pl-4 transition-colors duration-200 hover:bg-white/[0.04]">
      {/* The rule on the left fills with amber on hover. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-amber-500 transition-transform duration-300 group-hover:scale-y-100"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-xl leading-snug font-semibold">{name}</h3>
        <p className="max-w-md leading-relaxed text-muted-foreground">
          {tr(service.description)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-4">
        <p className="flex flex-col items-end">
          <span className="numerals text-4xl leading-none">
            {fmt.price(service.price)}
          </span>
          <span className="pt-1.5 text-sm text-muted-foreground">
            {fmt.duration(service.durationMin)}
          </span>
        </p>
        <Link
          href={`${href("/book")}?service=${service.id}`}
          aria-label={t.services.selectAria(name)}
          className="focus-ring inline-flex h-11 items-center rounded-lg border border-white/25 px-4 text-sm font-semibold transition-colors hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950"
        >
          {t.services.select}
        </Link>
      </div>
    </article>
  )
}
