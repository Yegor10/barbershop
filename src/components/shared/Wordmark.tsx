import { cn } from "@/lib/utils"

interface WordmarkProps {
  className?: string
  /** Text size utility for the name; the pole mark scales with it. */
  size?: "sm" | "md"
}

/** The shop's name with its barber-pole mark. */
export function Wordmark({ className, size = "md" }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "pole-stripe shrink-0 rounded-full",
          size === "md" ? "h-6 w-2.5" : "h-5 w-2"
        )}
      />
      <span
        className={cn(
          "display whitespace-nowrap",
          size === "md" ? "text-[1.7rem]" : "text-2xl"
        )}
      >
        Strop &amp; Steel
      </span>
    </span>
  )
}
