import type { ReactNode } from "react"

import {
  RootShell,
  buildRootMetadata,
  rootViewport,
} from "@/components/shared/RootShell"
import "../globals.css"

/** Root layout for the English site, served under `/en`. */
export const metadata = buildRootMetadata("en")
export const viewport = rootViewport

export default function EnglishRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <RootShell locale="en">{children}</RootShell>
}
