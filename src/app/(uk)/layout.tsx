import type { ReactNode } from "react"

import {
  RootShell,
  buildRootMetadata,
  rootViewport,
} from "@/components/shared/RootShell"
import "../globals.css"

/** Root layout for the Ukrainian site, served at `/`. */
export const metadata = buildRootMetadata("uk")
export const viewport = rootViewport

export default function UkrainianRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <RootShell locale="uk">{children}</RootShell>
}
