import type { ReactNode } from "react"

import {
  RootShell,
  buildRootMetadata,
  rootViewport,
} from "@/components/shared/RootShell"
import "../globals.css"

/** Root layout for the Dutch site, served at `/`. */
export const metadata = buildRootMetadata("nl")
export const viewport = rootViewport

export default function DutchRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <RootShell locale="nl">{children}</RootShell>
}
