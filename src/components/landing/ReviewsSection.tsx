import { Star } from "lucide-react"

import { SectionHeading } from "@/components/landing/SectionHeading"
import type { I18n } from "@/i18n/create-i18n"
import { getService, SHOP, TESTIMONIALS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ReviewsSectionProps {
  i18n: I18n
}

/** Client testimonials, each tied to the service it is about. */
export function ReviewsSection({ i18n }: ReviewsSectionProps) {
  const { t, tr, fmt } = i18n

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="border-y border-white/10 bg-slate-900/50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading
          id="reviews-title"
          title={t.reviews.title}
          lead={t.reviews.summary(
            fmt.number(SHOP.rating, 1),
            fmt.number(SHOP.reviewCount)
          )}
        />

        <ul className="mt-12 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => {
            const service = getService(testimonial.serviceId)
            const rating = fmt.number(testimonial.rating)
            return (
              <li key={testimonial.id} className="border-t border-white/15 py-8">
                <figure className="flex h-full flex-col gap-5">
                  <p
                    role="img"
                    aria-label={t.common.ratingOutOfFive(rating)}
                    className="flex gap-1"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        aria-hidden
                        className={cn(
                          "size-4",
                          index < testimonial.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        )}
                      />
                    ))}
                  </p>
                  <blockquote className="text-lg leading-relaxed text-slate-100">
                    {tr(testimonial.quote)}
                  </blockquote>
                  <figcaption className="mt-auto flex flex-col text-sm">
                    <span className="font-semibold">{tr(testimonial.author)}</span>
                    {service && (
                      <span className="text-muted-foreground">{tr(service.name)}</span>
                    )}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
