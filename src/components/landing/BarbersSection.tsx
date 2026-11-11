import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import { SectionHeading } from "@/components/landing/SectionHeading"
import type { I18n } from "@/i18n/create-i18n"
import { BARBERS } from "@/lib/mock-data"
import type { Barber } from "@/lib/types"

interface BarbersSectionProps {
  i18n: I18n
}

/** The four barbers: who they are, what they're best at, how to book them. */
export function BarbersSection({ i18n }: BarbersSectionProps) {
  const { t } = i18n

  return (
    <section
      id="barbers"
      aria-labelledby="barbers-title"
      className="border-y border-white/10 bg-slate-900/50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading id="barbers-title" title={t.barbers.title} lead={t.barbers.lead} />

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {BARBERS.map((barber) => (
            <li key={barber.id}>
              <BarberProfile barber={barber} i18n={i18n} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

interface BarberProfileProps {
  barber: Barber
  i18n: I18n
}

function BarberProfile({ barber, i18n }: BarberProfileProps) {
  const { t, tr, fmt, href } = i18n
  const name = tr(barber.name)

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-800">
        <Image
          src={barber.photo}
          alt={name}
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold">
          {tr(barber.title)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="display text-4xl">{name}</h3>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Star aria-hidden className="size-4 fill-amber-400 text-amber-400" />
              <span className="sr-only">
                {t.common.ratingOutOfFive(fmt.number(barber.rating, 1))}
              </span>
              <span aria-hidden>{fmt.number(barber.rating, 1)}</span>
            </span>
            <span>{t.barbers.reviews(barber.reviewCount)}</span>
          </p>
        </div>

        <p className="leading-relaxed text-slate-300">{tr(barber.bio)}</p>

        <ul className="flex flex-wrap gap-1.5">
          {barber.specialties.map((specialty) => (
            <li
              key={specialty.en}
              className="rounded-md border border-white/12 px-2 py-1 text-xs text-slate-300"
            >
              {tr(specialty)}
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          {t.barbers.experience(barber.yearsExperience)}
        </p>

        <Link
          href={`${href("/book")}?barber=${barber.id}`}
          className="focus-ring mt-auto inline-flex h-11 w-fit items-center rounded-lg border border-white/25 px-4 text-sm font-semibold transition-colors hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950"
        >
          {tr(barber.bookingCta)}
        </Link>
      </div>
    </article>
  )
}
