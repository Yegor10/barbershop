import { Suspense } from "react"

import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { Wordmark } from "@/components/shared/Wordmark"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The `/admin` page body. The dashboard reads the day and section from the
 * query string, which only exists in the browser, so it renders behind a
 * Suspense boundary with a skeleton of the same shape.
 */
export function AdminScreen() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminDashboard />
    </Suspense>
  )
}

function AdminSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-dvh flex-col">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-[104rem] items-center gap-5 px-4 sm:px-6">
          <Wordmark size="sm" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="ml-auto h-8 w-24" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[104rem] flex-col gap-5 px-4 pt-6 sm:px-6">
        <Skeleton className="h-14 w-96 max-w-full" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-10 w-full max-w-3xl rounded-full" />
        <Skeleton className="h-[30rem] rounded-xl" />
      </div>
    </div>
  )
}
