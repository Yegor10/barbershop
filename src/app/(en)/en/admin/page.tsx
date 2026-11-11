import type { Metadata } from "next"

import { AdminScreen } from "@/components/admin/AdminScreen"
import { getDictionary } from "@/i18n/dictionaries"

export const metadata: Metadata = {
  title: getDictionary("en").meta.adminTitle,
  robots: { index: false },
}

export default function AdminPage() {
  return <AdminScreen />
}
