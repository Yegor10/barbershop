import Image from "next/image"
import { MapPin, Phone } from "lucide-react"

import shopRoom from "@/assets/images/shop-room.jpg"
import { OpeningHours } from "@/components/landing/OpeningHours"
import { SectionHeading } from "@/components/landing/SectionHeading"
import { Button } from "@/components/ui/button"
import type { I18n } from "@/i18n/create-i18n"
import { SHOP } from "@/lib/mock-data"

interface LocationSectionProps {
  i18n: I18n
}

/** Where the shop is, when it's open and how to reach it. */
export function LocationSection({ i18n }: LocationSectionProps) {
  const { t, tr } = i18n

  return (
    <section
      id="location"
      aria-labelledby="location-title"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
    >
      <SectionHeading id="location-title" title={t.location.title} lead={t.location.lead} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 lg:aspect-auto lg:min-h-[32rem]">
          <Image
            src={shopRoom}
            alt={t.location.imageAlt}
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-10">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden className="size-4" />
                {t.location.address}
              </dt>
              <dd className="text-lg leading-snug font-medium">
                {tr(SHOP.street)}
                <br />
                {tr(SHOP.city)}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone aria-hidden className="size-4" />
                {t.location.phone}
              </dt>
              <dd className="text-lg leading-snug font-medium">
                <a
                  href={SHOP.phoneHref}
                  className="focus-ring rounded-sm underline-offset-4 hover:underline"
                >
                  {SHOP.phone}
                </a>
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm text-muted-foreground">{t.location.hours}</h3>
            <OpeningHours />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl">
              <a href={SHOP.mapsUrl} target="_blank" rel="noopener noreferrer">
                {t.location.directions}
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href={SHOP.phoneHref}>{t.location.call}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
