import { Suspense } from "react"

import { BookingSkeleton } from "@/components/booking/BookingSkeleton"
import { BookingWizard } from "@/components/booking/BookingWizard"

/**
 * The `/book` page body. The wizard reads the query string, which only exists
 * in the browser, so it renders behind a Suspense boundary with a skeleton.
 */
export function BookingScreen() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingWizard />
    </Suspense>
  )
}
