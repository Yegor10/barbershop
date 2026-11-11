import { Wordmark } from "@/components/shared/Wordmark"
import { Skeleton } from "@/components/ui/skeleton"

/** Placeholder shown while the booking wizard loads in the browser. */
export function BookingSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Wordmark size="sm" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4">
        <Skeleton className="mb-2.5 h-7 w-56" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 pt-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-72 max-w-full" />
          <Skeleton className="mb-4 h-5 w-96 max-w-full" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-[5.5rem] rounded-xl" />
          ))}
        </div>
        <Skeleton className="hidden h-72 rounded-2xl lg:block" />
      </div>
    </div>
  )
}
