import type { Metadata } from "next"

import { fontVariables } from "@/app/fonts"
import { Wordmark } from "@/components/shared/Wordmark"
import { getDictionary } from "@/i18n/dictionaries"
import "./globals.css"

/*
 * A static host serves this one page for every unknown address, whatever the
 * language, so it speaks both. Plain <a> links keep it independent of the
 * app's layouts; the base path is added by hand for the same reason.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const metadata: Metadata = {
  title: "Сторінку не знайдено | Strop & Steel",
}

export default function GlobalNotFound() {
  const uk = getDictionary("uk").notFound
  const en = getDictionary("en").notFound

  return (
    <html lang="uk" className={`dark ${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-10 px-5 py-16">
          <a href={`${basePath}/`} className="focus-ring w-fit rounded-sm">
            <Wordmark />
          </a>

          <div className="flex flex-col gap-3">
            <p className="numerals text-7xl text-amber-500">404</p>
            <h1 className="display text-5xl sm:text-6xl">{uk.title}</h1>
            <p className="text-muted-foreground">{uk.lead}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={`${basePath}/book/`}
                className="focus-ring inline-flex h-12 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-amber-400"
              >
                {uk.book}
              </a>
              <a
                href={`${basePath}/`}
                className="focus-ring inline-flex h-12 items-center rounded-lg border border-white/20 px-5 font-semibold hover:bg-white/5"
              >
                {uk.home}
              </a>
            </div>
          </div>

          <div lang="en" className="flex flex-col gap-2 border-t pt-8">
            <h2 className="text-lg font-semibold">{en.title}</h2>
            <p className="text-muted-foreground">{en.lead}</p>
            <a
              href={`${basePath}/en/`}
              className="focus-ring w-fit rounded-sm font-medium text-amber-400 underline underline-offset-4 hover:text-amber-300"
            >
              {en.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
