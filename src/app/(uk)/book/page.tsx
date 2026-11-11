import type { Metadata } from "next"

import { BookingScreen } from "@/components/booking/BookingScreen"
import { getDictionary } from "@/i18n/dictionaries"

export const metadata: Metadata = {
  title: getDictionary("uk").meta.bookTitle,
}

export default function BookPage() {
  return <BookingScreen />
}
