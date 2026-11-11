import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import heroImage from "@/assets/images/hero.jpg"
import { OpenChairs } from "@/components/landing/OpenChairs"
import { Button } from "@/components/ui/button"
import type { I18n } from "@/i18n/create-i18n"
import { SHOP } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface HeroProps {
  i18n: I18n
}

/** Staggers the one page-load reveal. */
function riseOrder(order: number): CSSProperties {
  return { "--rise-order": order } as CSSProperties
}

/**
 * Opening screen: the shop's promise set as signage over a photo of the
 * work, with the next free chairs one tap away.
 */
export function Hero({ i18n }: HeroProps) {
  const { t, fmt, href } = i18n
  const longestWord = Math.max(...t.hero.title.split(/\s+/).map((word) => word.length))

  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <Image
        src={heroImage}
        alt={t.hero.imageAlt}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-[68%_center]"
      />
      {/* Darken the left and the bottom so type stays readable on any crop. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#020617_4%,rgb(2_6_23/0.72)_38%,rgb(2_6_23/0.25)_70%,rgb(2_6_23/0.55)),linear-gradient(to_right,rgb(2_6_23/0.75),transparent_65%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 pt-28 pb-10 sm:px-6 sm:pb-14 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end lg:gap-14">
        <div className="flex flex-col gap-6">
          <h1
            style={riseOrder(0)}
            className={cn(
              "rise display text-balance",
              // A long word ("Craftsmanship") needs a smaller size to stay
              // on one line and clear of the photo's subject.
              longestWord > 10
                ? "max-w-[15ch] text-[clamp(3.25rem,10.5vw,7.5rem)]"
                : "max-w-[11ch] text-[clamp(4.25rem,14vw,10rem)]"
            )}
          >
            {t.hero.title}
          </h1>

          <p
            style={riseOrder(1)}
            className="rise max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl"
          >
            {t.hero.lead}
          </p>

          <div style={riseOrder(2)} className="rise flex flex-wrap gap-3">
            <Button asChild size="xl" className="h-14 px-7 text-lg">
              <Link href={href("/book")}>{t.common.bookAppointment}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="h-14 border-white/30 bg-white/5 px-7 text-lg backdrop-blur-sm hover:bg-white/15 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
            >
              <a href="#services">{t.common.exploreServices}</a>
            </Button>
          </div>

          <p
            style={riseOrder(3)}
            className="rise flex items-center gap-2 text-sm text-slate-300"
          >
            <Star aria-hidden className="size-4 fill-amber-400 text-amber-400" />
            {t.hero.ratingLine(
              fmt.number(SHOP.rating, 1),
              fmt.number(SHOP.reviewCount)
            )}
          </p>
        </div>

        <div style={riseOrder(4)} className="rise">
          <OpenChairs />
        </div>
      </div>
    </section>
  )
}
