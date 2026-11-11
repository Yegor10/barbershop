import type { Dictionary } from "@/i18n/dictionaries"

function plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other
}

export const en: Dictionary = {
  meta: {
    siteTitle: "Strop & Steel | Barber workshop in Podil, Kyiv",
    description:
      "Haircuts, fades and straight-razor shaves by four barbers on Kyrylivska Street. See live availability and book a chair in under a minute.",
    bookTitle: "Book an appointment",
    adminTitle: "Staff dashboard",
  },

  common: {
    bookAppointment: "Book appointment",
    exploreServices: "Explore services",
    back: "Back",
    continue: "Continue",
    close: "Close",
    cancel: "Cancel",
    anyBarber: "Any available barber",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    optional: "optional",
    languageLabel: "Site language",
    home: "Back to home",
    notChosen: "Not chosen yet",
    minutesShort: "min",
    hoursShort: "h",
    dayAtTime: (day, time) => `${day} at ${time}`,
    ratingOutOfFive: (rating) => `Rated ${rating} out of 5`,
  },

  status: {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  },

  source: {
    online: "Online booking",
    walk_in: "Walk-in",
    phone: "By phone",
  },

  nav: {
    label: "Main navigation",
    services: "Services",
    barbers: "Barbers",
    gallery: "Gallery",
    reviews: "Reviews",
    location: "Location",
    staff: "Staff dashboard",
    openMenu: "Open menu",
    menuTitle: "Menu",
  },

  hero: {
    title: "Craftsmanship & modern grooming",
    lead: "Four barbers and one workshop in Podil. Haircuts, fades and straight-razor shaves, unhurried and right on time.",
    imageAlt:
      "A barber trimming a client's beard with scissors in a dimly lit workshop",
    ratingLine: (rating, reviews) => `${rating} out of 5 from ${reviews} reviews`,
    openChairsTitle: "Next open chairs",
    openChairsHint: (duration) => `For a ${duration} haircut`,
    openChairsNone: "Fully booked for two weeks",
    openChairsBookAria: (barber, when) => `Book ${barber}, ${when}`,
  },

  services: {
    title: "Services and prices",
    lead: "Prices are final: consultation, wash and styling are included. You can combine several services in one visit.",
    select: "Select",
    selectAria: (name) => `Select ${name} and start booking`,
    categories: {
      hair: "Hair",
      beard: "Beard and shave",
      package: "Packages and add-ons",
    },
  },

  barbers: {
    title: "The barbers",
    lead: "Pick your barber, or take the first free chair.",
    experience: (years) => `${years} ${plural(years, "year", "years")} of experience`,
    reviews: (count) => `${count} ${plural(count, "review", "reviews")}`,
    daysOff: (days) => `Days off: ${days}`,
  },

  gallery: {
    title: "The work",
    lead: "What leaves our chairs every day.",
  },

  reviews: {
    title: "Reviews",
    summary: (rating, reviews) =>
      `Rated ${rating} out of 5 across ${reviews} reviews`,
  },

  location: {
    title: "Find us",
    lead: "A former foundry hall on Kyrylivska Street, five minutes on foot from Tarasa Shevchenka metro.",
    address: "Address",
    phone: "Phone",
    hours: "Opening hours",
    closedDay: "Closed",
    todayMark: "today",
    openNow: (until) => `Open now until ${until}`,
    closedNow: (when) => `Closed now. Opens ${when}`,
    directions: "Get directions",
    call: "Call the shop",
    imageAlt:
      "A red barber chair facing a mirror in a room with dark wood-panelled walls",
  },

  footer: {
    ctaTitle: "Your chair is waiting",
    ctaLead: "Booking takes under a minute. Pay at the shop after your visit.",
    demoNote: "Demo site. The shop, the people and the bookings are fictional.",
    photoCredit: "Photos: Unsplash",
  },

  booking: {
    exit: "Exit booking",
    stepOf: (step, total) => `Step ${step} of ${total}`,
    progressLabel: "Booking steps",
    steps: {
      services: {
        label: "Services",
        title: "Select services",
        hint: "Pick as many as you need. Total and duration update as you go.",
      },
      barber: {
        label: "Barber",
        title: "Choose your barber",
        hint: "Each barber shows the next free time for the services you picked.",
      },
      time: {
        label: "Date & time",
        title: "Pick a date and time",
        hint: "Booked times are struck through. The schedule updates live.",
      },
      details: {
        label: "Your details",
        title: "Your details",
        hint: "We need these to confirm the booking and remind you about it.",
      },
      ticket: {
        label: "Done",
        title: "You're booked",
        hint: "",
      },
    },
    services: {
      selected: (count) => `${count} ${plural(count, "service", "services")} selected`,
      limitReached: (duration) =>
        `One booking can run up to ${duration}. Remove a service to add another.`,
    },
    barber: {
      groupLabel: "Barber",
      anyHint: "The earliest time and the first free chair",
      nextOpening: (when) => `Next opening: ${when}`,
      noOpening: "Fully booked for two weeks",
    },
    time: {
      dateLabel: "Date",
      timeLabel: "Time",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      available: (count) => `${count} ${plural(count, "time", "times")} available`,
      bookedSuffix: "booked",
      loading: "Loading available times",
      noSlotsTitle: "This day is fully booked",
      noSlotsHint:
        "Try another date, or choose any available barber for more options.",
      jumpToNext: (when) => `Next opening: ${when}`,
      pickDateFirst: "Pick a date to see available times.",
    },
    details: {
      fullName: "Full name",
      fullNamePlaceholder: "Andrii Kovalenko",
      phone: "Phone",
      phoneHint: "We'll text a reminder two hours before your visit.",
      email: "Email",
      emailHint: "Your booking confirmation goes here.",
      notes: "Notes",
      notesPlaceholder: "For example: keep the length on top",
      policy:
        "Pay at the shop after your visit. Cancel or move the booking free of charge up to two hours before.",
      errors: {
        nameRequired: "Enter your full name",
        nameTooLong: "Keep it under 60 characters",
        phoneInvalid: "Enter the whole number: 9 digits after +380",
        emailRequired: "Enter your email",
        emailInvalid: "Check the address. Example: name@example.com",
        notesTooLong: "Keep notes under 240 characters",
      },
    },
    actions: {
      confirm: "Confirm booking",
      confirming: "Confirming…",
      slotTaken: "That time was just taken. Pick another one.",
      failed: "The booking didn't go through. Try again.",
    },
    summary: {
      title: "Your appointment",
      empty: "Pick a service to start.",
      barber: "Barber",
      when: "When",
      duration: "Duration",
      total: "Total",
      open: "View summary",
    },
    ticket: {
      pendingHint: "The shop is confirming your booking…",
      confirmedHint: "Your chair is reserved. See you soon!",
      statusPending: "Awaiting confirmation",
      statusConfirmed: "Confirmed",
      bookingId: "Booking ID",
      date: "Date",
      time: "Time",
      barber: "Barber",
      services: "Services",
      duration: "Duration",
      total: "To pay",
      client: "Client",
      address: "Address",
      addToCalendar: "Add to Google Calendar",
      bookAnother: "Book another appointment",
      missingTitle: "Booking not found",
      missingHint:
        "This booking's data is no longer in your browser. Start a new booking.",
      startOver: "Start over",
      calendarDetails: (barber, id) => `Barber: ${barber}\nBooking ID: ${id}`,
    },
  },

  admin: {
    title: "Staff dashboard",
    tabs: {
      label: "Dashboard sections",
      schedule: "Schedule",
      clients: "Clients",
    },
    viewSite: "View site",
    resetDemo: "Reset demo data",
    resetDone: "Demo data reset. The schedule is back to its starting state.",
    demoNote: "Demo mode: changes are saved only in this browser.",
    dateNav: {
      previous: "Previous day",
      next: "Next day",
      today: "Today",
      pick: "Pick a date",
    },
    metrics: {
      label: "Day metrics",
      bookingsToday: "Today's bookings",
      bookingsDay: "Bookings that day",
      upcoming: (count) => `${count} still to come`,
      allDone: "Every visit has happened",
      revenue: "Expected revenue",
      revenueHint: (average) => `Average ticket: ${average}`,
      occupancy: "Barber occupancy",
      occupancyHint: (working, total) => `${working} of ${total} barbers working`,
      completion: "Completion rate",
      completionHint: (done, total) => `${done} of ${total} visits took place`,
      completionEmpty: "No finished visits yet",
    },
    filters: {
      label: "Filter by status",
      all: "All",
    },
    grid: {
      label: "Day schedule",
      timeColumn: "Time",
      dayOff: "Day off",
      appointments: (count) =>
        `${count} ${plural(count, "appointment", "appointments")}`,
      now: "now",
      addAt: (barber, time) => `Add a booking: ${barber}, ${time}`,
      openAppointment: (client, time, status) =>
        `${client}, ${time}, ${status}. Open appointment`,
      emptyFilterTitle: (status) => `No appointments marked "${status}"`,
      emptyFilterHint: "Try another status or show every appointment.",
      showAll: "Show all",
      closedTitle: "The shop is closed on this day",
      closedHint: "Pick another date to see the schedule.",
      emptyDayTitle: "No appointments on this day yet",
      emptyDayHint:
        "Click a free time in the schedule, or add a client with the button below.",
      loading: "Loading the schedule",
    },
    appointment: {
      title: (id) => `Appointment ${id}`,
      description: "Change the status or move the appointment.",
      client: "Client",
      phone: "Phone",
      noPhone: "Not provided",
      services: "Services",
      barber: "Barber",
      when: "When",
      price: "Total",
      source: "Source",
      notes: "Notes",
      status: "Status",
      statusChanged: (status) => `Status changed: ${status}`,
      reschedule: "Reschedule",
      date: "Date",
      time: "Time",
      noTimes: "No free times",
      move: "Move appointment",
      moved: (when) => `Appointment moved: ${when}`,
      conflict: "That time is already taken. Pick another one.",
    },
    walkIn: {
      fab: "Add walk-in",
      title: "New booking",
      description: "For walk-ins and phone bookings.",
      clientName: "Client name",
      clientNamePlaceholder: "Andrii Kovalenko",
      phone: "Phone",
      services: "Services",
      barber: "Barber",
      start: "Start",
      date: "Date",
      source: "How they reached us",
      noTimes: "This barber has no free time on this day",
      pickServicesFirst: "Pick the services first",
      submit: "Add booking",
      created: (client, time) => `Booking added: ${client}, ${time}`,
      conflict: "That time is already taken. Pick another one.",
      errors: {
        nameRequired: "Enter the client's name",
        nameTooLong: "Keep it under 60 characters",
        phoneInvalid: "Enter all 9 digits, or leave the field empty",
        servicesRequired: "Pick at least one service",
        barberRequired: "Pick a barber",
        startRequired: "Pick a start time",
      },
    },
    clients: {
      searchLabel: "Search clients",
      searchPlaceholder: "Name or phone",
      loading: "Loading clients",
      tableLabel: "Clients",
      period: (past, ahead) =>
        `Appointments from the last ${past} days and the next ${ahead}.`,
      count: (count) => `${count} ${plural(count, "client", "clients")}`,
      filters: {
        label: "Filter clients",
        all: "All",
        regulars: "Regulars",
        upcoming: "With a booking",
        noShows: "With no-shows",
      },
      columns: {
        client: "Client",
        phone: "Phone",
        visits: "Visits",
        lastVisit: "Last visit",
        nextVisit: "Next booking",
        spent: "Spent",
        barber: "Barber",
      },
      none: "None",
      emptyTitle: "No clients found",
      emptyHint: (query) =>
        query
          ? `No clients match "${query}". Check the spelling or clear the filters.`
          : "No clients match this filter.",
      clearFilters: "Clear filters",
      showMore: (count) => `Show ${count} more`,
      openClient: (name) => `Open client card: ${name}`,
      sheet: {
        description: "Appointment history and contact details",
        history: "Appointment history",
        newBooking: "New booking",
        noShows: (count) => `${count} ${plural(count, "no-show", "no-shows")}`,
      },
    },
  },

  notFound: {
    title: "Page not found",
    lead: "There's nothing at this address. The link may be out of date.",
    home: "Back to home",
    book: "Book appointment",
  },
}
