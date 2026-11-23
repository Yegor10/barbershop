import { Onest, Sofia_Sans_Extra_Condensed } from "next/font/google"

/**
 * Dutch and English pages are set in the same type. `latin` has the accented
 * letters Dutch needs (ë, é, ï); `latin-ext` has the hryvnia sign in prices.
 */

/** Body and interface text. */
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

/** Signage: headlines, prices and times. */
const sofiaExtraCondensed = Sofia_Sans_Extra_Condensed({
  variable: "--font-sofia-condensed",
  subsets: ["latin", "latin-ext"],
  display: "swap",
})

export const fontVariables = `${onest.variable} ${sofiaExtraCondensed.variable}`
