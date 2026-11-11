/**
 * Ukrainian → Latin transliteration following the official 2010 standard
 * (Cabinet of Ministers resolution No. 55), the one used in passports.
 * Used to show client names in the English interface.
 */

const BASE: Readonly<Record<string, string>> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
  з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ю: "iu", я: "ia", ь: "",
}

/** These letters read differently at the start of a word. */
const WORD_INITIAL: Readonly<Record<string, string>> = {
  є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya",
}

const APOSTROPHES = new Set(["'", "’", "ʼ"])
const CYRILLIC = /[а-яіїєґ]/i

function matchCase(source: string, latin: string): string {
  if (latin === "" || source === source.toLowerCase()) return latin
  return latin[0].toUpperCase() + latin.slice(1)
}

export function transliterate(text: string): string {
  let out = ""
  let atWordStart = true

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const lower = char.toLowerCase()

    if (APOSTROPHES.has(char) && i > 0 && CYRILLIC.test(text[i - 1])) {
      continue // the apostrophe is dropped inside Ukrainian words
    }

    const mapped =
      atWordStart && lower in WORD_INITIAL ? WORD_INITIAL[lower] : BASE[lower]

    if (mapped === undefined) {
      out += char
      atWordStart = !/[\p{L}\p{N}]/u.test(char)
      continue
    }

    // "зг" is written "zgh" so it is not read as "ж" (zh).
    const previous = text[i - 1]?.toLowerCase()
    out += lower === "г" && previous === "з" ? matchCase(char, "gh") : matchCase(char, mapped)
    atWordStart = false
  }

  return out
}
