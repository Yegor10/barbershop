import { Onest, Sofia_Sans_Extra_Condensed } from "next/font/google"

/**
 * Both families cover Latin and Cyrillic, so Ukrainian and English pages
 * are set in the same type.
 */

/** Body and interface text. */
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

/** Signage: headlines, prices and times. */
const sofiaExtraCondensed = Sofia_Sans_Extra_Condensed({
  variable: "--font-sofia-condensed",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const fontVariables = `${onest.variable} ${sofiaExtraCondensed.variable}`
