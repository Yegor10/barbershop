import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  /** `id` for the heading, referenced by the section's `aria-labelledby`. */
  id: string
  title: string
  lead?: string
  className?: string
}

/** Signage-style section title with an optional supporting sentence. */
export function SectionHeading({ id, title, lead, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h2 id={id} className="display text-6xl sm:text-7xl lg:text-8xl">
        {title}
      </h2>
      {lead && (
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {lead}
        </p>
      )}
    </div>
  )
}
