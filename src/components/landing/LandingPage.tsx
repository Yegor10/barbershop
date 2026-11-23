import { BarbersSection } from "@/components/landing/BarbersSection"
import { ClipperBackdrop } from "@/components/landing/ClipperBackdrop"
import { GallerySection } from "@/components/landing/GallerySection"
import { Hero } from "@/components/landing/Hero"
import { LocationSection } from "@/components/landing/LocationSection"
import { ReviewsSection } from "@/components/landing/ReviewsSection"
import { ServicesShowcase } from "@/components/landing/ServicesShowcase"
import { SiteFooter } from "@/components/landing/SiteFooter"
import { SiteHeader } from "@/components/landing/SiteHeader"
import type { Locale } from "@/i18n/config"
import { createI18n } from "@/i18n/create-i18n"

interface LandingPageProps {
  locale: Locale
}

/** The landing page, rendered once per language at build time. */
export function LandingPage({ locale }: LandingPageProps) {
  const i18n = createI18n(locale)

  return (
    <>
      <a href="#main-content" className="skip-link">
        {i18n.t.common.skipToContent}
      </a>
      <ClipperBackdrop />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero i18n={i18n} />
        <ServicesShowcase i18n={i18n} />
        <BarbersSection i18n={i18n} />
        <GallerySection i18n={i18n} />
        <ReviewsSection i18n={i18n} />
        <LocationSection i18n={i18n} />
      </main>
      <SiteFooter i18n={i18n} />
    </>
  )
}
