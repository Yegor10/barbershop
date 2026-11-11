import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * Skeleton for use inside text (`<p>`, `<span>`, `<label>`), where a `<div>`
 * is not allowed and would break hydration.
 */
function SkeletonText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton"
      className={cn("block animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText }
