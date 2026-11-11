import { z } from "zod"

import { getBarber, getService, SLOT_RULES, totalsFor } from "@/lib/mock-data"
import {
  ANY_BARBER,
  type BarberChoice,
  type ClientDetailsFormValues,
} from "@/lib/types"

/** The wizard's steps, in order. The ticket is shown once a booking exists. */
export const WIZARD_STEPS = ["services", "barber", "time", "details", "ticket"] as const
export type WizardStepId = (typeof WIZARD_STEPS)[number]

/** Index of the last step the client fills in before confirming. */
export const DETAILS_STEP = 3

export const EMPTY_DETAILS: ClientDetailsFormValues = {
  fullName: "",
  phone: "",
  email: "",
  notes: "",
}

export interface WizardState {
  /** 0–3. The ticket step is driven by the `booking` query parameter. */
  step: number
  /** Which way the last move went, so steps slide the right way. */
  direction: 1 | -1
  serviceIds: string[]
  barberId: BarberChoice | null
  /** "2026-11-12" */
  dateKey: string | null
  /** ISO start of the chosen slot. */
  slotStart: string | null
  /** What the client has typed so far in step 4. */
  details: ClientDetailsFormValues
}

export const EMPTY_WIZARD_STATE: WizardState = {
  step: 0,
  direction: 1,
  serviceIds: [],
  barberId: null,
  dateKey: null,
  slotStart: null,
  details: EMPTY_DETAILS,
}

export type WizardAction =
  | { type: "toggleService"; serviceId: string }
  | { type: "selectBarber"; barberId: BarberChoice }
  | { type: "selectDate"; dateKey: string }
  | { type: "selectSlot"; dateKey: string; slotStart: string }
  | { type: "clearSlot" }
  | { type: "saveDetails"; details: ClientDetailsFormValues }
  | { type: "next" }
  | { type: "back" }
  | { type: "goTo"; step: number }

/** Whether a service can still be added without exceeding the time limit. */
export function canAddService(serviceIds: readonly string[], serviceId: string): boolean {
  const service = getService(serviceId)
  if (!service) return false
  return (
    totalsFor(serviceIds).durationMin + service.durationMin <=
    SLOT_RULES.maxDurationMin
  )
}

/** The furthest step the client may open with what they've chosen so far. */
export function maxReachableStep(state: WizardState): number {
  if (state.serviceIds.length === 0) return 0
  if (state.barberId === null) return 1
  if (state.slotStart === null) return 2
  return DETAILS_STEP
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "toggleService": {
      const selected = state.serviceIds.includes(action.serviceId)
      if (!selected && !canAddService(state.serviceIds, action.serviceId)) {
        return state
      }
      return {
        ...state,
        serviceIds: selected
          ? state.serviceIds.filter((id) => id !== action.serviceId)
          : [...state.serviceIds, action.serviceId],
        // A different duration fits different slots.
        slotStart: null,
      }
    }
    case "selectBarber":
      if (state.barberId === action.barberId) return state
      return { ...state, barberId: action.barberId, slotStart: null }
    case "selectDate":
      if (state.dateKey === action.dateKey) return state
      return { ...state, dateKey: action.dateKey, slotStart: null }
    case "selectSlot":
      return { ...state, dateKey: action.dateKey, slotStart: action.slotStart }
    case "clearSlot":
      // Without a time the client belongs back on the date step.
      return {
        ...state,
        slotStart: null,
        step: Math.min(state.step, 2),
        direction: state.step > 2 ? -1 : state.direction,
      }
    case "saveDetails":
      return { ...state, details: action.details }
    case "next":
      return {
        ...state,
        step: Math.min(state.step + 1, maxReachableStep(state)),
        direction: 1,
      }
    case "back":
      return { ...state, step: Math.max(state.step - 1, 0), direction: -1 }
    case "goTo": {
      const step = Math.max(0, Math.min(action.step, maxReachableStep(state)))
      if (step === state.step) return state
      return { ...state, step, direction: step > state.step ? 1 : -1 }
    }
  }
}

/* ---------------------------- Draft persistence --------------------------- */

/*
 * An unfinished booking is kept for the browser tab, so a refresh or a
 * language switch doesn't send the client back to step one.
 */
const DRAFT_KEY = "strop-and-steel.booking-draft.v1"

const draftSchema = z.object({
  step: z.number().int().min(0).max(DETAILS_STEP),
  serviceIds: z.array(z.string()),
  barberId: z.string().nullable(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  slotStart: z.iso.datetime().nullable(),
  details: z.object({
    fullName: z.string(),
    phone: z.string(),
    email: z.string(),
    notes: z.string(),
  }),
})

/** Drops anything that no longer exists or has already passed. */
function sanitize(draft: z.infer<typeof draftSchema>): WizardState {
  const serviceIds = draft.serviceIds.filter((id) => getService(id) !== undefined)
  const barberId =
    draft.barberId === ANY_BARBER || (draft.barberId && getBarber(draft.barberId))
      ? draft.barberId
      : null
  const slotIsAhead =
    draft.slotStart !== null && new Date(draft.slotStart).getTime() > Date.now()

  const state: WizardState = {
    step: draft.step,
    direction: 1,
    serviceIds,
    barberId,
    dateKey: draft.dateKey,
    slotStart: slotIsAhead ? draft.slotStart : null,
    details: draft.details,
  }
  return { ...state, step: Math.min(state.step, maxReachableStep(state)) }
}

export function loadDraft(): WizardState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? sanitize(parsed.data) : null
  } catch {
    return null
  }
}

export function saveDraft(state: WizardState): void {
  try {
    const { step, serviceIds, barberId, dateKey, slotStart, details } = state
    window.sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step, serviceIds, barberId, dateKey, slotStart, details })
    )
  } catch {
    // Storage may be unavailable (private mode). The wizard still works.
  }
}

export function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing to clear.
  }
}

export interface WizardPreselection {
  serviceIds: string[]
  barberId: BarberChoice | null
}

/**
 * Starting state. Arriving with a preselected service or barber (from the
 * landing page) starts a fresh booking; otherwise an unfinished one resumes.
 */
export function createInitialState(preselection: WizardPreselection): WizardState {
  const serviceIds = preselection.serviceIds.filter(
    (id) => getService(id) !== undefined
  )
  const barberId =
    preselection.barberId === ANY_BARBER ||
    (preselection.barberId && getBarber(preselection.barberId))
      ? preselection.barberId
      : null

  if (serviceIds.length > 0 || barberId !== null) {
    return { ...EMPTY_WIZARD_STATE, serviceIds, barberId }
  }
  return loadDraft() ?? EMPTY_WIZARD_STATE
}
