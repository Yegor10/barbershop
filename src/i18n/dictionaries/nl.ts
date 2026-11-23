/**
 * Dutch interface copy. This file defines the shape every other
 * dictionary has to match (see `Dictionary` in `./index.ts`).
 */

/** Dutch plural: 1 afspraak, 2 afspraken (0 takes the plural too). */
function plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other
}

export const nl = {
  meta: {
    siteTitle: "Strop & Steel | Barbershop in Podil, Kyiv",
    description:
      "Knippen, fades en scheren met het open mes door vier barbers aan de Kyrylivska-straat. Zie live wanneer er plek is en boek in minder dan een minuut.",
    bookTitle: "Online afspraak maken",
    adminTitle: "Medewerkersomgeving",
  },

  common: {
    skipToContent: "Direct naar de inhoud",
    bookAppointment: "Afspraak maken",
    exploreServices: "Bekijk behandelingen",
    back: "Terug",
    continue: "Verder",
    close: "Sluiten",
    cancel: "Annuleren",
    anyBarber: "Eerste beschikbare barber",
    today: "Vandaag",
    tomorrow: "Morgen",
    yesterday: "Gisteren",
    optional: "optioneel",
    languageLabel: "Taal van de website",
    home: "Naar de homepage",
    notChosen: "Nog niet gekozen",
    minutesShort: "min",
    hoursShort: "u",
    /** "vandaag om 14:30" */
    dayAtTime: (day: string, time: string) => `${day} om ${time}`,
    ratingOutOfFive: (rating: string) => `Beoordeling: ${rating} van 5`,
  },

  status: {
    pending: "In afwachting",
    confirmed: "Bevestigd",
    in_progress: "Bezig",
    completed: "Afgerond",
    cancelled: "Geannuleerd",
    no_show: "Niet verschenen",
  },

  source: {
    online: "Online geboekt",
    walk_in: "Binnengelopen",
    phone: "Telefonisch",
  },

  nav: {
    label: "Hoofdnavigatie",
    services: "Behandelingen",
    barbers: "Barbers",
    gallery: "Werk",
    reviews: "Reviews",
    location: "Contact",
    staff: "Medewerkers",
    openMenu: "Menu openen",
    menuTitle: "Menu",
  },

  hero: {
    title: "Vakmanschap met moderne scherpte",
    lead: "Vier barbers en één werkplaats in Podil. Knippen, fades en scheren met het open mes: zonder haast en precies op jouw tijd.",
    ratingLine: (rating: string, reviews: string) =>
      `${rating} van 5 op basis van ${reviews} reviews`,
    openChairsTitle: "Eerstvolgende vrije stoelen",
    openChairsHint: (duration: string) => `Voor een knipbeurt van ${duration}`,
    openChairsNone: "De komende twee weken volgeboekt",
  },

  services: {
    title: "Behandelingen en prijzen",
    lead: "De prijs is all-in: advies, wassen en stylen zijn inbegrepen. Je kunt meerdere behandelingen in één bezoek combineren.",
    select: "Kiezen",
    selectAria: (name: string) => `Kiezen: ${name}, en verder naar de afspraak`,
    categories: {
      hair: "Haar",
      beard: "Baard en scheren",
      package: "Pakketten en extra's",
    },
  },

  barbers: {
    title: "Barbers",
    lead: "Kies je eigen barber of ga voor de eerste vrije stoel.",
    experience: (years: number) => `${years} jaar ervaring`,
    reviews: (count: number) =>
      `${count} ${plural(count, "review", "reviews")}`,
    daysOff: (days: string) => `Vrij op: ${days}`,
  },

  gallery: {
    title: "Werk",
    lead: "Wat er elke dag uit onze stoelen komt.",
  },

  reviews: {
    title: "Reviews",
    summary: (rating: string, reviews: string) =>
      `Gemiddelde beoordeling ${rating} van 5 op basis van ${reviews} reviews`,
  },

  location: {
    title: "Zo vind je ons",
    lead: "Een voormalige gieterij aan de Kyrylivska-straat, vijf minuten lopen van metrostation Tarasa Sjevtsjenka.",
    address: "Adres",
    phone: "Telefoon",
    hours: "Openingstijden",
    closedDay: "Gesloten",
    todayMark: "vandaag",
    openNow: (until: string) => `Nu open, tot ${until}`,
    closedNow: (when: string) => `Nu gesloten. We openen ${when}`,
    directions: "Route plannen",
    call: "Bellen",
    imageAlt:
      "Rode barberstoel voor een spiegel in een ruimte met donkere houten wanden",
  },

  footer: {
    ctaTitle: "Jouw stoel staat klaar",
    ctaLead: "Een afspraak maken duurt minder dan een minuut. Je betaalt na afloop in de zaak.",
    demoNote: "Demowebsite. De barbershop, personen en afspraken zijn fictief.",
    photoCredit: "Foto's: Unsplash",
  },

  booking: {
    exit: "Afspraak verlaten",
    stepOf: (step: number, total: number) => `Stap ${step} van ${total}`,
    progressLabel: "Stappen van de afspraak",
    steps: {
      services: {
        label: "Behandelingen",
        title: "Kies je behandelingen",
        hint: "Je kunt er meerdere kiezen: prijs en duur worden direct opgeteld.",
      },
      barber: {
        label: "Barber",
        title: "Kies je barber",
        hint: "Bij elke barber zie je de eerstvolgende vrije tijd voor jouw behandelingen.",
      },
      time: {
        label: "Datum en tijd",
        title: "Kies datum en tijd",
        hint: "Bezette tijden zijn doorgestreept. De agenda wordt live bijgewerkt.",
      },
      details: {
        label: "Gegevens",
        title: "Jouw gegevens",
        hint: "Nodig om je afspraak te bevestigen en je eraan te herinneren.",
      },
      ticket: {
        label: "Klaar",
        title: "Je afspraak staat",
        hint: "",
      },
    },
    services: {
      selected: (count: number) =>
        `${count} ${plural(count, "behandeling", "behandelingen")} gekozen`,
      limitReached: (duration: string) =>
        `Eén afspraak duurt maximaal ${duration}. Haal een behandeling weg om een andere toe te voegen.`,
    },
    barber: {
      groupLabel: "Barber",
      anyHint: "Vroegste tijd en eerste vrije stoel",
      nextOpening: (when: string) => `Eerstvolgende tijd: ${when}`,
      noOpening: "De komende twee weken volgeboekt",
    },
    time: {
      dateLabel: "Datum",
      timeLabel: "Tijd",
      morning: "Ochtend",
      afternoon: "Middag",
      evening: "Avond",
      available: (count: number) =>
        `${count} ${plural(count, "vrije tijd", "vrije tijden")}`,
      bookedSuffix: "bezet",
      loading: "Vrije tijden laden",
      noSlotsTitle: "Deze dag is volgeboekt",
      noSlotsHint:
        "Kies een andere datum of de eerste beschikbare barber: dan zijn er meer mogelijkheden.",
      jumpToNext: (when: string) => `Eerstvolgende tijd: ${when}`,
      pickDateFirst: "Kies een datum om de vrije tijden te zien.",
    },
    details: {
      fullName: "Voor- en achternaam",
      fullNamePlaceholder: "Jan de Vries",
      phone: "Telefoon",
      phoneHint: "We sturen twee uur voor je bezoek een sms-herinnering.",
      email: "E-mailadres",
      emailHint: "Hier ontvang je de bevestiging van je afspraak.",
      notes: "Wensen",
      notesPlaceholder: "Bijvoorbeeld: bovenop de lengte behouden",
      policy:
        "Je betaalt na afloop in de zaak. Annuleren of verzetten is gratis tot twee uur van tevoren.",
      errors: {
        nameRequired: "Vul je voor- en achternaam in",
        nameTooLong: "Maximaal 60 tekens",
        phoneInvalid: "Vul het volledige nummer in: 9 cijfers na +31",
        emailRequired: "Vul je e-mailadres in",
        emailInvalid: "Controleer het adres. Voorbeeld: naam@example.com",
        notesTooLong: "Maximaal 240 tekens",
      },
    },
    actions: {
      confirm: "Afspraak bevestigen",
      confirming: "Bezig met bevestigen…",
      slotTaken: "Deze tijd is net bezet geraakt. Kies een andere.",
      failed: "De afspraak kon niet worden gemaakt. Probeer het opnieuw.",
    },
    summary: {
      title: "Jouw afspraak",
      empty: "Kies een behandeling om te beginnen.",
      barber: "Barber",
      when: "Wanneer",
      duration: "Duur",
      total: "Totaal",
      open: "Details van de afspraak",
    },
    ticket: {
      pendingHint: "De barbershop bevestigt je afspraak…",
      confirmedHint: "De stoel is voor je gereserveerd. Tot snel!",
      statusPending: "Wacht op bevestiging",
      statusConfirmed: "Bevestigd",
      bookingId: "Afspraaknummer",
      date: "Datum",
      time: "Tijd",
      barber: "Barber",
      services: "Behandelingen",
      duration: "Duur",
      total: "Te betalen",
      client: "Klant",
      address: "Adres",
      addToCalendar: "Toevoegen aan Google Agenda",
      bookAnother: "Nog een afspraak maken",
      missingTitle: "Afspraak niet gevonden",
      missingHint:
        "De gegevens van deze afspraak zijn blijkbaar uit je browser verwijderd. Maak een nieuwe afspraak.",
      startOver: "Opnieuw beginnen",
      calendarDetails: (barber: string, id: string) =>
        `Barber: ${barber}\nAfspraaknummer: ${id}`,
    },
  },

  admin: {
    title: "Medewerkersomgeving",
    tabs: {
      label: "Onderdelen van de medewerkersomgeving",
      schedule: "Agenda",
      clients: "Klanten",
    },
    viewSite: "Naar de website",
    resetDemo: "Demogegevens herstellen",
    resetDone: "Demogegevens hersteld. De agenda staat weer op de beginstand.",
    demoNote: "Demomodus: wijzigingen worden alleen in jouw browser bewaard.",
    dateNav: {
      previous: "Vorige dag",
      next: "Volgende dag",
      today: "Vandaag",
      pick: "Datum kiezen",
    },
    metrics: {
      label: "Cijfers van de dag",
      bookingsToday: "Afspraken vandaag",
      bookingsDay: "Afspraken op deze dag",
      upcoming: (count: number) => `Nog te gaan: ${count}`,
      allDone: "Alle bezoeken zijn geweest",
      revenue: "Verwachte omzet",
      revenueHint: (average: string) => `Gemiddelde besteding: ${average}`,
      occupancy: "Bezetting barbers",
      occupancyHint: (working: number, total: number) =>
        `${working} van de ${total} barbers aan het werk`,
      completion: "Afgeronde bezoeken",
      completionHint: (done: number, total: number) =>
        `${done} van de ${total} bezoeken afgerond`,
      completionEmpty: "Nog geen afgeronde bezoeken",
    },
    filters: {
      label: "Filteren op status",
      all: "Alle",
    },
    grid: {
      label: "Dagagenda",
      timeColumn: "Tijd",
      dayOff: "Vrij",
      appointments: (count: number) =>
        `${count} ${plural(count, "afspraak", "afspraken")}`,
      now: "nu",
      addAt: (barber: string, time: string) =>
        `Afspraak toevoegen: ${barber}, ${time}`,
      emptyFilterTitle: (status: string) =>
        `Geen afspraken met status "${status}"`,
      emptyFilterHint: "Probeer een andere status of toon alle afspraken.",
      showAll: "Alles tonen",
      closedTitle: "De barbershop is deze dag gesloten",
      closedHint: "Kies een andere datum om de agenda te zien.",
      emptyDayTitle: "Nog geen afspraken op deze dag",
      emptyDayHint:
        "Klik op een vrije tijd in de agenda of voeg een klant toe met de knop onderaan.",
      loading: "Agenda laden",
    },
    appointment: {
      title: (id: string) => `Afspraak ${id}`,
      description: "Wijzig de status of verzet de afspraak.",
      client: "Klant",
      phone: "Telefoon",
      noPhone: "Niet opgegeven",
      services: "Behandelingen",
      barber: "Barber",
      when: "Wanneer",
      price: "Bedrag",
      source: "Bron",
      notes: "Wensen",
      status: "Status",
      statusChanged: (status: string) => `Status gewijzigd: ${status}`,
      reschedule: "Verzetten",
      date: "Datum",
      time: "Tijd",
      noTimes: "Geen vrije tijden",
      move: "Afspraak verzetten",
      moved: (when: string) => `Afspraak verzet: ${when}`,
      conflict: "Deze tijd is al bezet. Kies een andere.",
    },
    walkIn: {
      fab: "Klant toevoegen",
      title: "Nieuwe afspraak",
      description: "Voor binnenlopers en telefonische afspraken.",
      clientName: "Naam van de klant",
      clientNamePlaceholder: "Jan de Vries",
      phone: "Telefoon",
      services: "Behandelingen",
      barber: "Barber",
      start: "Starttijd",
      date: "Datum",
      source: "Hoe contact opgenomen",
      noTimes: "Deze barber heeft op deze dag geen vrije tijd",
      pickServicesFirst: "Kies eerst de behandelingen",
      submit: "Afspraak toevoegen",
      created: (client: string, time: string) =>
        `Afspraak toegevoegd: ${client}, ${time}`,
      conflict: "Deze tijd is al bezet. Kies een andere.",
      errors: {
        nameRequired: "Vul de naam van de klant in",
        nameTooLong: "Maximaal 60 tekens",
        phoneInvalid: "Vul alle 9 cijfers in of laat het veld leeg",
        servicesRequired: "Kies minstens één behandeling",
        barberRequired: "Kies een barber",
        startRequired: "Kies een starttijd",
      },
    },
    clients: {
      searchLabel: "Klant zoeken",
      searchPlaceholder: "Naam of telefoonnummer",
      loading: "Klanten laden",
      tableLabel: "Klanten",
      period: (past: number, ahead: number) =>
        `Afspraken van de afgelopen ${past} dagen en de komende ${ahead} dagen.`,
      count: (count: number) =>
        `${count} ${plural(count, "klant", "klanten")}`,
      filters: {
        label: "Klanten filteren",
        all: "Alle",
        regulars: "Vaste klanten",
        upcoming: "Met afspraak",
        noShows: "Niet verschenen",
      },
      columns: {
        client: "Klant",
        phone: "Telefoon",
        visits: "Bezoeken",
        lastVisit: "Laatste bezoek",
        nextVisit: "Volgende afspraak",
        spent: "Besteed",
        barber: "Barber",
      },
      none: "Geen",
      emptyTitle: "Niemand gevonden",
      emptyHint: (query: string) =>
        query
          ? `Geen klanten gevonden voor "${query}". Controleer de spelling of wis de filters.`
          : "Geen klanten die aan dit filter voldoen.",
      clearFilters: "Filters wissen",
      showMore: (count: number) => `Nog ${count} tonen`,
      openClient: (name: string) => `Klantkaart openen: ${name}`,
      sheet: {
        description: "Afsprakengeschiedenis en contactgegevens",
        history: "Afsprakengeschiedenis",
        newBooking: "Afspraak maken",
        noShows: (count: number) => `${count} keer niet verschenen`,
      },
    },
  },

  notFound: {
    title: "Pagina niet gevonden",
    lead: "Dit adres bestaat niet bij ons. Misschien is de link verouderd.",
    home: "Naar de homepage",
    book: "Afspraak maken",
  },
}
