import Image from "next/image"

import { SectionHeading } from "@/components/landing/SectionHeading"
import type { I18n } from "@/i18n/create-i18n"
import { GALLERY } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface GallerySectionProps {
  i18n: I18n
}

/**
 * How each photo sits in the mosaic. Portrait shots take two rows and the
 * wide shop-floor shot takes two columns, so nothing is cropped awkwardly.
 */
const TILE_SPAN: Readonly<Record<string, string>> = {
  "g-skin-fade": "row-span-2",
  "g-shop-floor": "col-span-2",
  "g-beard-scissor": "row-span-2",
  "g-taper": "col-span-2",
}

/** Recent work and the room it happens in. */
export function GallerySection({ i18n }: GallerySectionProps) {
  const { t, tr } = i18n

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
    >
      <SectionHeading id="gallery-title" title={t.gallery.title} lead={t.gallery.lead} />

      <ul className="mt-12 grid grid-flow-dense auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] lg:auto-rows-[17rem] lg:grid-cols-4 lg:gap-4">
        {GALLERY.map((item) => (
          <li key={item.id} className={cn("min-h-0", TILE_SPAN[item.id])}>
            <figure className="group relative h-full overflow-hidden rounded-xl bg-slate-800">
              <Image
                src={item.image}
                alt={tr(item.alt)}
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pt-10 pb-3 text-sm font-medium">
                {tr(item.caption)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
