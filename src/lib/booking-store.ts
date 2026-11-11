/**
 * Client-side appointment store.
 *
 * There is no backend, so appointments created or edited here are kept in
 * localStorage and layered over the seeded schedule. The store notifies React
 * through `useSyncExternalStore` and listens for `storage` events, so a
 * booking made in one tab shows up in the dashboard open in another.
 */
import { useSyncExternalStore } from "react"

import {
  storedAppointmentsSchema,
  type Appointment,
  type StoredAppointments,
} from "@/lib/types"

const STORAGE_KEY = "strop-and-steel.appointments.v1"
const EMPTY: StoredAppointments = Object.freeze({})

let cache: StoredAppointments | null = null
const listeners = new Set<() => void>()

function load(): StoredAppointments {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = storedAppointmentsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : EMPTY
  } catch {
    // Storage can be blocked (private mode) or hold junk. Start clean.
    return EMPTY
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

function handleStorage(event: StorageEvent): void {
  if (event.key === null || event.key === STORAGE_KEY) {
    cache = null
    emit()
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener("storage", handleStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage)
    }
  }
}

function commit(next: StoredAppointments): void {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Keep working from memory if the write is refused.
  }
  emit()
}

/** Current stored appointments. Safe to call outside React. */
export function getStoredAppointments(): StoredAppointments {
  cache ??= load()
  return cache
}

function getServerSnapshot(): StoredAppointments {
  return EMPTY
}

/** Subscribes a component to stored appointments. */
export function useStoredAppointments(): StoredAppointments {
  return useSyncExternalStore(subscribe, getStoredAppointments, getServerSnapshot)
}

/** Creates or replaces an appointment. */
export function saveAppointment(appointment: Appointment): void {
  commit({ ...getStoredAppointments(), [appointment.id]: appointment })
}

/** Forgets everything created in this browser and restores the seeded day. */
export function resetStoredAppointments(): void {
  commit(EMPTY)
}
