/**
 * Mock data layer.
 *
 * Everything the site reads as if it came from a database lives here: the
 * shop, its services and barbers, the landing-page content, and a generator
 * for existing appointments. Content fields are stored once per language.
 *
 * Appointments are generated deterministically per calendar day, so the
 * schedule looks the same on every visit and in every browser tab, without a
 * backend. Time-slot rules (opening hours, slot length, booking horizon) are
 * defined here and turned into bookable slots in `availability.ts`.
 */
import { addDays, addMinutes, differenceInCalendarDays, startOfDay } from "date-fns"

import avatarDanylo from "@/assets/images/avatar-danylo.jpg"
import avatarIllia from "@/assets/images/avatar-illia.jpg"
import avatarMark from "@/assets/images/avatar-mark.jpg"
import avatarSamir from "@/assets/images/avatar-samir.jpg"
import photoDanylo from "@/assets/images/barber-danylo.jpg"
import photoIllia from "@/assets/images/barber-illia.jpg"
import photoMark from "@/assets/images/barber-mark.jpg"
import photoSamir from "@/assets/images/barber-samir.jpg"
import galleryBeardDetail from "@/assets/images/gallery-beard-detail.jpg"
import galleryBeardScissor from "@/assets/images/gallery-beard-scissor.jpg"
import galleryHotLather from "@/assets/images/gallery-hot-lather.jpg"
import galleryNeckline from "@/assets/images/gallery-neckline.jpg"
import galleryShopFloor from "@/assets/images/gallery-shop-floor.jpg"
import gallerySkinFade from "@/assets/images/gallery-skin-fade.jpg"
import galleryTaper from "@/assets/images/gallery-taper.jpg"
import galleryTexturedCrop from "@/assets/images/gallery-textured-crop.jpg"

import type { Locale, LocalizedText } from "@/i18n/config"
import { transliterate } from "@/i18n/translit"
import { fromDateKey, toDateKey } from "@/lib/format"
import type {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
  Barber,
  ClientInfo,
  DayHours,
  GalleryItem,
  Service,
  Testimonial,
} from "@/lib/types"

/* ---------------------------------- Shop ---------------------------------- */

export const SHOP = {
  name: "Strop & Steel",
  tagline: { nl: "Barberwerkplaats", en: "Barber workshop" },
  street: { nl: "Kyrylivska-straat 41", en: "41 Kyrylivska St" },
  city: { nl: "Podil, Kyiv", en: "Podil, Kyiv" },
  // Fictional: Amsterdam subscriber numbers never start with 0.
  phone: "+31 20 058 3716",
  phoneHref: "tel:+31200583716",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Kyrylivska St 41, Kyiv"
  )}`,
  rating: 4.9,
  reviewCount: 1453,
} as const satisfies {
  name: string
  tagline: LocalizedText
  street: LocalizedText
  city: LocalizedText
  phone: string
  phoneHref: string
  mapsUrl: string
  rating: number
  reviewCount: number
}

/** Opening hours by weekday. 0 = Sunday … 6 = Saturday. */
export const SHOP_HOURS: Readonly<Record<number, DayHours | null>> = {
  0: { openMin: 11 * 60, closeMin: 18 * 60 },
  1: { openMin: 10 * 60, closeMin: 21 * 60 },
  2: { openMin: 10 * 60, closeMin: 21 * 60 },
  3: { openMin: 10 * 60, closeMin: 21 * 60 },
  4: { openMin: 10 * 60, closeMin: 21 * 60 },
  5: { openMin: 10 * 60, closeMin: 21 * 60 },
  6: { openMin: 10 * 60, closeMin: 20 * 60 },
}

/** Monday first, the way a week is read in the Netherlands. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

/** Rules that shape the bookable time slots. */
export const SLOT_RULES = {
  /** Online slots start every 30 minutes. */
  stepMin: 30,
  /** The front desk can place walk-ins on a 15-minute grid. */
  adminStepMin: 15,
  /** How far ahead clients can book. */
  horizonDays: 30,
  /** Online bookings need at least this much notice. */
  minLeadMin: 20,
  /** A single booking can't hold a chair longer than this. */
  maxDurationMin: 180,
  /** Length of the haircut used to preview "next open chair" times. */
  previewDurationMin: 45,
} as const

/* -------------------------------- Services -------------------------------- */

export const SERVICES: readonly Service[] = [
  {
    id: "signature-haircut",
    name: { nl: "Signature knipbeurt", en: "Signature Haircut" },
    description: {
      nl: "Advies, knippen met schaar of tondeuse, wassen en een stijl die je thuis makkelijk nadoet.",
      en: "Consultation, scissor or clipper cut, wash and a style you can repeat at home.",
    },
    category: "hair",
    durationMin: 45,
    price: 650,
  },
  {
    id: "skin-fade",
    name: { nl: "Skin fade", en: "Skin Fade" },
    description: {
      nl: "Huidkort bij de nek en met de hand vervloeid naar de lengte die je bovenop houdt.",
      en: "Foil-close at the neckline, blended by hand up to the length you keep on top.",
    },
    category: "hair",
    durationMin: 60,
    price: 750,
  },
  {
    id: "buzz-line-up",
    name: { nl: "Buzzcut met line-up", en: "Buzz & Line-Up" },
    description: {
      nl: "Eén opzetkam over het hele hoofd en een messcherpe lijn langs de haargrens.",
      en: "One guard all over with a razor-sharp edge at the hairline.",
    },
    category: "hair",
    durationMin: 30,
    price: 450,
  },
  {
    id: "grey-blending",
    name: { nl: "Grijs camoufleren", en: "Grey Blending" },
    description: {
      nl: "Semipermanente kleuring die grijs verzacht zonder zichtbare uitgroei.",
      en: "Semi-permanent colour that softens grey without leaving a dye line.",
    },
    category: "hair",
    durationMin: 30,
    price: 550,
  },
  {
    id: "beard-sculpting",
    name: {
      nl: "Baard modelleren met hete handdoek",
      en: "Beard Sculpting & Hot Towel",
    },
    description: {
      nl: "Vorm, fade en strakke lijnen in de baard, afgerond met een hete handdoek en verzorgende olie.",
      en: "Shape, fade and line the beard, then a hot towel and conditioning oil.",
    },
    category: "beard",
    durationMin: 30,
    price: 450,
  },
  {
    id: "royal-shave",
    name: { nl: "Royal shave", en: "Royal Shave" },
    description: {
      nl: "Scheren met het open mes, warm schuim, drie hete handdoeken en een koude steen als afsluiter.",
      en: "Straight-razor shave with warm lather, three hot towels and a cold stone finish.",
    },
    category: "beard",
    durationMin: 45,
    price: 700,
  },
  {
    id: "father-son",
    name: { nl: "Vader en zoon-pakket", en: "Father & Son Package" },
    description: {
      nl: "Twee knipbeurten in naast elkaar staande stoelen: één volwassene en één kind tot twaalf jaar.",
      en: "Two cuts in neighbouring chairs: one adult, one under twelve.",
    },
    category: "package",
    durationMin: 75,
    price: 1000,
  },
  {
    id: "scalp-treatment",
    name: { nl: "Hoofdhuidscrub en massage", en: "Scalp Scrub & Massage" },
    description: {
      nl: "Exfoliërende scrub en een massage van tien minuten. Te combineren met elke knipbeurt.",
      en: "Exfoliating scrub and a ten-minute massage. Add it to any cut.",
    },
    category: "package",
    durationMin: 15,
    price: 250,
  },
]

const SERVICES_BY_ID = new Map(SERVICES.map((service) => [service.id, service]))

export function getService(id: string): Service | undefined {
  return SERVICES_BY_ID.get(id)
}

/** Resolves ids to services, in menu order, skipping unknown ids. */
export function getServices(ids: readonly string[]): Service[] {
  return SERVICES.filter((service) => ids.includes(service.id))
}

export function totalsFor(serviceIds: readonly string[]): {
  durationMin: number
  price: number
} {
  return getServices(serviceIds).reduce(
    (totals, service) => ({
      durationMin: totals.durationMin + service.durationMin,
      price: totals.price + service.price,
    }),
    { durationMin: 0, price: 0 }
  )
}

/* --------------------------------- Barbers -------------------------------- */

export const BARBERS: readonly Barber[] = [
  {
    id: "illia",
    name: { nl: "Illia Berezhnyi", en: "Illia Berezhnyi" },
    title: { nl: "Master barber", en: "Master Barber" },
    bio: {
      nl: "Richtte de werkplaats in 2014 op. Pakt eerst de schaar en pas als laatste de tondeuse.",
      en: "Founded the workshop in 2014. Cuts with scissors first and reaches for clippers last.",
    },
    bookingCta: { nl: "Boek bij Illia", en: "Book with Illia" },
    rating: 4.9,
    reviewCount: 412,
    yearsExperience: 14,
    specialties: [
      { nl: "Knippen met de schaar", en: "Scissor cuts" },
      { nl: "Baard modelleren", en: "Beard sculpting" },
      { nl: "Scheren met het open mes", en: "Straight-razor shaves" },
    ],
    daysOff: [0, 1],
    photo: photoIllia,
    avatar: avatarIllia,
  },
  {
    id: "danylo",
    name: { nl: "Danylo Vovk", en: "Danylo Vovk" },
    title: { nl: "Senior barber", en: "Senior Barber" },
    bio: {
      nl: "Vervloeit elke fade met de hand en zegt eerlijk wat bij jouw haargrens past.",
      en: "Blends every fade by hand and will tell you honestly what your hairline can carry.",
    },
    bookingCta: { nl: "Boek bij Danylo", en: "Book with Danylo" },
    rating: 4.8,
    reviewCount: 356,
    yearsExperience: 9,
    specialties: [
      { nl: "Skin fades", en: "Skin fades" },
      { nl: "Textured crops", en: "Textured crops" },
      { nl: "Line-ups", en: "Line-ups" },
    ],
    daysOff: [2],
    photo: photoDanylo,
    avatar: avatarDanylo,
  },
  {
    id: "samir",
    name: { nl: "Samir Haddad", en: "Samir Haddad" },
    title: { nl: "Senior stylist", en: "Senior Stylist" },
    bio: {
      nl: "Klassieke vormen, scherp geknipt: scheidingen, tapers en pompadours die de hele week blijven zitten.",
      en: "Classic shapes cut sharp: side parts, tapers and pompadours that hold all week.",
    },
    bookingCta: { nl: "Boek bij Samir", en: "Book with Samir" },
    rating: 4.9,
    reviewCount: 298,
    yearsExperience: 7,
    specialties: [
      { nl: "Tapers", en: "Tapers" },
      { nl: "Zijscheidingen", en: "Side parts" },
      { nl: "Details met het mes", en: "Razor detailing" },
    ],
    daysOff: [0, 3],
    photo: photoSamir,
    avatar: avatarSamir,
  },
  {
    id: "mark",
    name: { nl: "Mark Solovei", en: "Mark Solovei" },
    title: { nl: "Master barber", en: "Master Barber" },
    bio: {
      nl: "De stoel voor krullen, textuur en kleur. Werkt met je haar mee in plaats van ertegenin.",
      en: "The chair for curls, texture and colour. Shapes hair instead of fighting it.",
    },
    bookingCta: { nl: "Boek bij Mark", en: "Book with Mark" },
    rating: 4.9,
    reviewCount: 387,
    yearsExperience: 12,
    specialties: [
      { nl: "Krullen en kroeshaar", en: "Curls and coils" },
      { nl: "Burst fades", en: "Burst fades" },
      { nl: "Grijs camoufleren", en: "Grey blending" },
    ],
    daysOff: [4],
    photo: photoMark,
    avatar: avatarMark,
  },
]

const BARBERS_BY_ID = new Map(BARBERS.map((barber) => [barber.id, barber]))

export function getBarber(id: string): Barber | undefined {
  return BARBERS_BY_ID.get(id)
}

/* ----------------------------- Landing content ---------------------------- */

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t1",
    quote: {
      nl: "Danylo stelde in vijf minuten meer vragen dan mijn vorige barber in twee jaar. De beste fade die ik ooit heb gehad.",
      en: "Danylo asked more questions in the first five minutes than my last barber did in two years. Best fade I've had.",
    },
    author: { nl: "Yulian R.", en: "Yulian R." },
    serviceId: "skin-fade",
    rating: 5,
  },
  {
    id: "t2",
    quote: {
      nl: "Om negen uur geboekt vanuit de metro, om elf uur zat ik in de stoel. Scheren met hete handdoeken is de rustigste 45 minuten van mijn maand.",
      en: "Booked from the metro at nine, in the chair by eleven. The hot towel shave is the calmest 45 minutes of my month.",
    },
    author: { nl: "Andrii M.", en: "Andrii M." },
    serviceId: "royal-shave",
    rating: 5,
  },
  {
    id: "t3",
    quote: {
      nl: "Mijn zoon zat voor het eerst stil, omdat hij de stoel naast de mijne kreeg. Nu komen we elke vijf weken samen.",
      en: "My son sat still for the first time ever because he got the chair next to mine. We come every five weeks now.",
    },
    author: { nl: "Taras K.", en: "Taras K." },
    serviceId: "father-son",
    rating: 5,
  },
  {
    id: "t4",
    quote: {
      nl: "Mark is de eerste barber die mijn krullen begrijpt. Hij gaf ze vorm in plaats van alleen volume weg te knippen.",
      en: "Mark is the first barber who has understood my curls. He shaped them instead of just cutting the volume off.",
    },
    author: { nl: "Davyd A.", en: "Davyd A." },
    serviceId: "signature-haircut",
    rating: 5,
  },
  {
    id: "t5",
    quote: {
      nl: "Illia herstelde een baardlijn die ik jarenlang verkeerd deed en liet zien hoe ik die tussen de bezoeken bijhoud.",
      en: "Illia fixed a beard line I'd been getting wrong for years and showed me how to keep it between visits.",
    },
    author: { nl: "Roman P.", en: "Roman P." },
    serviceId: "beard-sculpting",
    rating: 5,
  },
  {
    id: "t6",
    quote: {
      nl: "Ik was tien minuten te laat, belde even en ze hielden de stoel vrij. De knipbeurt kreeg toch alle tijd.",
      en: "I was running ten minutes late, called ahead and they held the chair. The cut still got its full time.",
    },
    author: { nl: "Ostap H.", en: "Ostap H." },
    serviceId: "signature-haircut",
    rating: 4,
  },
]

export const GALLERY: readonly GalleryItem[] = [
  {
    id: "g-skin-fade",
    image: gallerySkinFade,
    alt: {
      nl: "Getatoeëerde handen van een barber leiden kam en mes door een strakke skin fade",
      en: "A barber's tattooed hands guiding a comb and razor through a tight skin fade",
    },
    caption: { nl: "Skin fade, afgewerkt met het mes", en: "Skin fade, razor finish" },
  },
  {
    id: "g-shop-floor",
    image: galleryShopFloor,
    alt: {
      nl: "Drie zwartleren barberstoelen voor spiegels aan een bakstenen muur onder warme hanglampen",
      en: "Three black leather barber chairs facing mirrors on an exposed brick wall under warm pendant lamps",
    },
    caption: { nl: "De werkvloer", en: "The shop floor" },
  },
  {
    id: "g-textured-crop",
    image: galleryTexturedCrop,
    alt: {
      nl: "Achteraanzicht van een textured crop, met een kam boven de kruin",
      en: "Back view of a textured crop being cut with a comb held above the crown",
    },
    caption: { nl: "Textured crop", en: "Textured crop" },
  },
  {
    id: "g-hot-lather",
    image: galleryHotLather,
    alt: {
      nl: "Een kwast brengt warm schuim aan langs de baardlijn van een klant, in zwart-wit",
      en: "A brush working warm lather into a client's beard line, in black and white",
    },
    caption: { nl: "Warm schuim", en: "Hot lather" },
  },
  {
    id: "g-beard-scissor",
    image: galleryBeardScissor,
    alt: {
      nl: "Een schaar trimt de volle donkere baard van een achterovergeleunde klant, in zwart-wit",
      en: "Scissors trimming a full dark beard on a reclined client, in black and white",
    },
    caption: { nl: "Baard, schaar over kam", en: "Beard, scissor over comb" },
  },
  {
    id: "g-neckline",
    image: galleryNeckline,
    alt: {
      nl: "Een tondeuse maakt de neklijn recht, gezien van achter de klant",
      en: "A clipper squaring off a neckline, seen from behind the client",
    },
    caption: { nl: "Neklijn bijwerken", en: "Neckline clean-up" },
  },
  {
    id: "g-taper",
    image: galleryTaper,
    alt: {
      nl: "Een barber houdt een kam tegen een verse taper en werkt bij met de tondeuse",
      en: "A barber holding a comb to a fresh taper while trimming with clippers",
    },
    caption: { nl: "Low taper", en: "Low taper" },
  },
  {
    id: "g-beard-detail",
    image: galleryBeardDetail,
    alt: {
      nl: "Handen met handschoenen werken een snor bij met een trimmer terwijl de klant met gesloten ogen rust",
      en: "Gloved hands detailing a moustache with a trimmer while the client rests with eyes closed",
    },
    caption: { nl: "Snordetail", en: "Moustache detail" },
  },
]

/* ------------------------- Seeded appointment history --------------------- */

const FIRST_NAMES = [
  "Олександр", "Андрій", "Дмитро", "Максим", "Богдан", "Тарас", "Назар", "Остап",
  "Марко", "Ярослав", "Володимир", "Сергій", "Олег", "Віталій", "Роман", "Денис",
  "Артем", "Іван", "Микола", "Юрій", "Павло", "Антон", "Євген", "Ігор",
  "Степан", "Матвій", "Тимофій", "Захар", "Лука", "Святослав", "Ростислав", "Любомир",
  "Орест", "Мирон", "Арсен", "Давид", "Кирило", "Гліб", "Владислав", "Северин",
] as const

const LAST_NAMES = [
  "Шевченко", "Коваленко", "Бондаренко", "Ткаченко", "Кравченко", "Олійник", "Шевчук", "Поліщук",
  "Бойко", "Мельник", "Мороз", "Лисенко", "Руденко", "Савченко", "Петренко", "Марченко",
  "Гончаренко", "Кузьменко", "Павленко", "Романенко", "Левченко", "Карпенко", "Тимошенко", "Яковенко",
  "Гриценко", "Іваненко", "Мазур", "Ковальчук", "Ткачук", "Савчук", "Костенко", "Юрченко",
  "Назаренко", "Пономаренко", "Василенко", "Кравчук", "Захарченко", "Зінченко", "Литвиненко", "Стельмах",
] as const

/** Notes clients leave, in the language they'd write them. */
const CLIENT_NOTES: readonly LocalizedText[] = [
  { nl: "Bovenop de lengte behouden", en: "Keep the length on top" },
  { nl: "Hetzelfde als de vorige keer", en: "Same as last time" },
  { nl: "Eerste bezoek", en: "First visit" },
  {
    nl: "Gevoelige huid, geen aftershave met alcohol",
    en: "Sensitive skin, no alcohol aftershave",
  },
  { nl: "Zaterdag een bruiloft", en: "Wedding on Saturday" },
  { nl: "Kan vijf minuten later zijn", en: "Might run five minutes late" },
]

const SEED_NOTE_TRANSLATIONS = new Map(
  CLIENT_NOTES.map((note) => [note.nl, note])
)

/**
 * Notes are stored as the client typed them. The seeded ones have a known
 * translation, so the English dashboard can show them in English.
 */
export function localizeClientNote(note: string, locale: Locale): string {
  return SEED_NOTE_TRANSLATIONS.get(note)?.[locale] ?? note
}

/** Clients who come back often enough to show up as regulars. */
const REGULAR_CLIENT_COUNT = 140
const CLIENT_POOL_SIZE = FIRST_NAMES.length * LAST_NAMES.length

/** What people actually book, weighted. */
const SEED_BOOKINGS: ReadonlyArray<{ serviceIds: string[]; weight: number }> = [
  { serviceIds: ["signature-haircut"], weight: 30 },
  { serviceIds: ["skin-fade"], weight: 22 },
  { serviceIds: ["signature-haircut", "beard-sculpting"], weight: 14 },
  { serviceIds: ["beard-sculpting"], weight: 9 },
  { serviceIds: ["buzz-line-up"], weight: 8 },
  { serviceIds: ["royal-shave"], weight: 6 },
  { serviceIds: ["skin-fade", "beard-sculpting"], weight: 4 },
  { serviceIds: ["father-son"], weight: 4 },
  { serviceIds: ["signature-haircut", "scalp-treatment"], weight: 2 },
  { serviceIds: ["grey-blending", "signature-haircut"], weight: 1 },
]

/** Idle minutes between two appointments, weighted. */
const SEED_GAPS: ReadonlyArray<{ minutes: number; weight: number }> = [
  { minutes: 0, weight: 5 },
  { minutes: 15, weight: 3 },
  { minutes: 30, weight: 3 },
  { minutes: 45, weight: 1 },
  { minutes: 60, weight: 2 },
  { minutes: 90, weight: 1 },
]

const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

function hashString(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Small seeded PRNG so every day's schedule is reproducible. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weightedPick<T extends { weight: number }>(
  rng: () => number,
  options: readonly T[]
): T {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = rng() * total
  for (const option of options) {
    roll -= option.weight
    if (roll < 0) return option
  }
  return options[options.length - 1]
}

function encodeId(seed: number): string {
  const rng = mulberry32(seed)
  let out = ""
  for (let i = 0; i < 6; i += 1) {
    out += ID_ALPHABET[Math.floor(rng() * ID_ALPHABET.length)]
  }
  return `SS-${out}`
}

/** A fresh booking reference for appointments created in the browser. */
export function createBookingId(): string {
  const bytes = new Uint32Array(1)
  globalThis.crypto.getRandomValues(bytes)
  return encodeId(bytes[0])
}

/**
 * Seeded clients get numbers that cannot belong to anyone: Amsterdam landline
 * numbers never start with 0 after the area code.
 */
function clientAt(index: number): ClientInfo {
  const firstIndex = index % FIRST_NAMES.length
  const lastIndex =
    (Math.floor(index / FIRST_NAMES.length) + firstIndex * 7) % LAST_NAMES.length
  const first = FIRST_NAMES[firstIndex]
  const last = LAST_NAMES[lastIndex]
  const digits = String((index * 7919 + 104729) % 1_000_000).padStart(6, "0")
  return {
    fullName: transliterate(`${first} ${last}`),
    phone: `+31 20 0${digits.slice(0, 2)} ${digits.slice(2)}`,
    email: `${transliterate(first)}.${transliterate(last)}@example.com`.toLowerCase(),
  }
}

interface SeedEntry {
  id: string
  barberId: string
  serviceIds: string[]
  startMin: number
  durationMin: number
  price: number
  client: ClientInfo
  /** 0–1, decides the status once we know what time it is. */
  roll: number
  /** How many days before the visit it was booked. */
  leadDays: number
  source: AppointmentSource
}

const layoutCache = new Map<string, SeedEntry[]>()

function buildDayLayout(dateKey: string): SeedEntry[] {
  const date = fromDateKey(dateKey)
  const weekday = date.getDay()
  const hours = SHOP_HOURS[weekday]
  if (!hours) return []

  const entries: SeedEntry[] = []

  for (const barber of BARBERS) {
    if (barber.daysOff.includes(weekday)) continue

    const rng = mulberry32(hashString(`${dateKey}:${barber.id}`))
    const lunchStart = 13 * 60 + 30 + Math.floor(rng() * 4) * 15
    let cursor = hours.openMin + Math.floor(rng() * 3) * 15
    let tookLunch = false
    let index = 0

    while (index < 24) {
      if (!tookLunch && cursor >= lunchStart - 30) {
        cursor = Math.max(cursor, lunchStart) + 30
        tookLunch = true
      }

      const booking = weightedPick(rng, SEED_BOOKINGS)
      const { durationMin, price } = totalsFor(booking.serviceIds)
      if (cursor + durationMin > hours.closeMin) break

      const isRegular = rng() < 0.35
      const clientIndex = isRegular
        ? Math.floor(rng() * REGULAR_CLIENT_COUNT)
        : REGULAR_CLIENT_COUNT +
          Math.floor(rng() * (CLIENT_POOL_SIZE - REGULAR_CLIENT_COUNT))
      const client = clientAt(clientIndex)
      const noteRoll = rng()
      const leadDays = Math.floor(rng() ** 2 * 12)
      const sourceRoll = rng()

      entries.push({
        id: encodeId(hashString(`${dateKey}:${barber.id}:${index}`)),
        barberId: barber.id,
        serviceIds: booking.serviceIds,
        startMin: cursor,
        durationMin,
        price,
        client:
          noteRoll < 0.14
            ? {
                ...client,
                notes:
                  CLIENT_NOTES[Math.floor(noteRoll * 1000) % CLIENT_NOTES.length].nl,
              }
            : client,
        roll: rng(),
        leadDays,
        source:
          leadDays === 0 && sourceRoll > 0.7
            ? "walk_in"
            : sourceRoll < 0.2
              ? "phone"
              : "online",
      })

      cursor += durationMin + weightedPick(rng, SEED_GAPS).minutes
      index += 1
    }
  }

  return entries
}

function seedStatus(
  roll: number,
  start: Date,
  end: Date,
  now: Date
): AppointmentStatus {
  if (roll < 0.04) return "cancelled"
  if (end <= now) return roll < 0.09 ? "no_show" : "completed"
  if (start <= now) return "in_progress"
  return roll > 0.8 ? "pending" : "confirmed"
}

/**
 * Existing appointments for one calendar day, as they stand at `now`.
 *
 * The day's layout is fixed, but bookings "arrive" as the date gets closer
 * (a day two weeks out is almost empty; today is busy) and each one's status
 * follows the clock: upcoming → in progress → completed.
 */
export function getSeedAppointments(date: Date, now: Date): Appointment[] {
  const dateKey = toDateKey(date)
  let layout = layoutCache.get(dateKey)
  if (!layout) {
    layout = buildDayLayout(dateKey)
    layoutCache.set(dateKey, layout)
  }

  const dayStart = startOfDay(date)
  const daysAhead = differenceInCalendarDays(dayStart, now)

  return layout
    .filter((entry) => entry.leadDays >= daysAhead)
    .map((entry) => {
      const start = addMinutes(dayStart, entry.startMin)
      const end = addMinutes(start, entry.durationMin)
      const createdAt = addMinutes(addDays(dayStart, -entry.leadDays), 9 * 60)
      return {
        id: entry.id,
        barberId: entry.barberId,
        serviceIds: entry.serviceIds,
        start: start.toISOString(),
        end: end.toISOString(),
        durationMin: entry.durationMin,
        price: entry.price,
        status: seedStatus(entry.roll, start, end, now),
        source: entry.source,
        client: entry.client,
        createdAt: createdAt.toISOString(),
      }
    })
}
