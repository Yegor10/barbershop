/**
 * Ukrainian interface copy. This file defines the shape every other
 * dictionary has to match (see `Dictionary` in `./index.ts`).
 */

/** Ukrainian plural: 1 запис, 2 записи, 5 записів. */
function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export const uk = {
  meta: {
    siteTitle: "Strop & Steel | Барбершоп на Подолі, Київ",
    description:
      "Стрижки, фейди та гоління небезпечною бритвою від чотирьох барберів на Кирилівській. Вільний час видно наживо, запис займає менше хвилини.",
    bookTitle: "Онлайн-запис",
    adminTitle: "Кабінет майстра",
  },

  common: {
    bookAppointment: "Записатися",
    exploreServices: "Переглянути послуги",
    back: "Назад",
    continue: "Далі",
    close: "Закрити",
    cancel: "Скасувати",
    anyBarber: "Будь-який вільний барбер",
    today: "Сьогодні",
    tomorrow: "Завтра",
    yesterday: "Учора",
    optional: "необов’язково",
    languageLabel: "Мова сайту",
    home: "На головну",
    notChosen: "Ще не обрано",
    minutesShort: "хв",
    hoursShort: "год",
    /** "сьогодні о 14:30" */
    dayAtTime: (day: string, time: string) => `${day} о ${time}`,
    ratingOutOfFive: (rating: string) => `Оцінка ${rating} з 5`,
  },

  status: {
    pending: "Очікує",
    confirmed: "Підтверджено",
    in_progress: "Триває",
    completed: "Завершено",
    cancelled: "Скасовано",
    no_show: "Не прийшов",
  },

  source: {
    online: "Онлайн-запис",
    walk_in: "Без запису",
    phone: "Телефоном",
  },

  nav: {
    label: "Основна навігація",
    services: "Послуги",
    barbers: "Барбери",
    gallery: "Роботи",
    reviews: "Відгуки",
    location: "Контакти",
    staff: "Кабінет майстра",
    openMenu: "Відкрити меню",
    menuTitle: "Меню",
  },

  hero: {
    title: "Ремесло і сучасний догляд",
    lead: "Чотири барбери й одна майстерня на Подолі. Стрижки, фейди та гоління небезпечною бритвою: без поспіху і точно у ваш час.",
    imageAlt:
      "Барбер підрівнює ножицями бороду клієнта в напівтемряві майстерні",
    ratingLine: (rating: string, reviews: string) =>
      `${rating} з 5 за ${reviews} відгуками`,
    openChairsTitle: "Найближчі вільні крісла",
    openChairsHint: (duration: string) => `Для стрижки тривалістю ${duration}`,
    openChairsNone: "Найближчі два тижні зайнято",
    openChairsBookAria: (barber: string, when: string) =>
      `Записатися: ${barber}, ${when}`,
  },

  services: {
    title: "Послуги та ціни",
    lead: "Ціна остаточна: консультація, миття та укладання вже враховані. За один візит можна поєднати кілька послуг.",
    select: "Обрати",
    selectAria: (name: string) => `Обрати послугу «${name}» і перейти до запису`,
    categories: {
      hair: "Волосся",
      beard: "Борода і гоління",
      package: "Комплекси та доповнення",
    },
  },

  barbers: {
    title: "Барбери",
    lead: "Оберіть свого майстра або довіртеся першому вільному кріслу.",
    experience: (years: number) =>
      `${years} ${plural(years, "рік", "роки", "років")} досвіду`,
    reviews: (count: number) =>
      `${count} ${plural(count, "відгук", "відгуки", "відгуків")}`,
    daysOff: (days: string) => `Вихідні: ${days}`,
  },

  gallery: {
    title: "Роботи",
    lead: "Те, що виходить із наших крісел щодня.",
  },

  reviews: {
    title: "Відгуки",
    summary: (rating: string, reviews: string) =>
      `Середня оцінка ${rating} з 5 за ${reviews} відгуками`,
  },

  location: {
    title: "Як нас знайти",
    lead: "Колишній ливарний цех на Кирилівській, п’ять хвилин пішки від метро «Тараса Шевченка».",
    address: "Адреса",
    phone: "Телефон",
    hours: "Графік роботи",
    closedDay: "Вихідний",
    todayMark: "сьогодні",
    openNow: (until: string) => `Зараз відчинено, працюємо до ${until}`,
    closedNow: (when: string) => `Зараз зачинено. Відчинимося ${when}`,
    directions: "Прокласти маршрут",
    call: "Зателефонувати",
    imageAlt:
      "Червоне барберське крісло перед дзеркалом у кімнаті з темними дерев’яними стінами",
  },

  footer: {
    ctaTitle: "Ваше крісло чекає",
    ctaLead: "Запис займає менше хвилини. Оплата в барбершопі після візиту.",
    demoNote: "Демонстраційний сайт. Барбершоп, люди та записи вигадані.",
    photoCredit: "Фото: Unsplash",
  },

  booking: {
    exit: "Вийти із запису",
    stepOf: (step: number, total: number) => `Крок ${step} з ${total}`,
    progressLabel: "Кроки запису",
    steps: {
      services: {
        label: "Послуги",
        title: "Оберіть послуги",
        hint: "Можна обрати кілька: сума й тривалість порахуються одразу.",
      },
      barber: {
        label: "Барбер",
        title: "Оберіть барбера",
        hint: "Біля кожного майстра показано найближчий вільний час для обраних послуг.",
      },
      time: {
        label: "Дата й час",
        title: "Оберіть дату й час",
        hint: "Зайнятий час закреслено. Розклад оновлюється наживо.",
      },
      details: {
        label: "Контакти",
        title: "Ваші контакти",
        hint: "Потрібні, щоб підтвердити запис і нагадати про візит.",
      },
      ticket: {
        label: "Готово",
        title: "Ви записані",
        hint: "",
      },
    },
    services: {
      selected: (count: number) =>
        `Обрано ${count} ${plural(count, "послугу", "послуги", "послуг")}`,
      limitReached: (duration: string) =>
        `Один запис триває щонайбільше ${duration}. Приберіть одну з послуг, щоб додати іншу.`,
    },
    barber: {
      groupLabel: "Барбер",
      anyHint: "Найраніший час і перше вільне крісло",
      nextOpening: (when: string) => `Найближчий час: ${when}`,
      noOpening: "Найближчі два тижні зайнято",
    },
    time: {
      dateLabel: "Дата",
      timeLabel: "Час",
      morning: "Ранок",
      afternoon: "День",
      evening: "Вечір",
      available: (count: number) =>
        `${count} ${plural(count, "вільне вікно", "вільні вікна", "вільних вікон")}`,
      bookedSuffix: "зайнято",
      loading: "Завантажуємо вільний час",
      noSlotsTitle: "На цей день усе зайнято",
      noSlotsHint:
        "Оберіть іншу дату або будь-якого вільного барбера: так варіантів більше.",
      jumpToNext: (when: string) => `Найближчий час: ${when}`,
      pickDateFirst: "Оберіть дату, щоб побачити вільний час.",
    },
    details: {
      fullName: "Ім’я та прізвище",
      fullNamePlaceholder: "Андрій Коваленко",
      phone: "Телефон",
      phoneHint: "Надішлемо SMS-нагадування за дві години до візиту.",
      email: "Електронна пошта",
      emailHint: "Сюди прийде підтвердження запису.",
      notes: "Побажання",
      notesPlaceholder: "Наприклад: залишити довжину зверху",
      policy:
        "Оплата в барбершопі після візиту. Скасувати або перенести запис можна безкоштовно не пізніше ніж за дві години.",
      errors: {
        nameRequired: "Вкажіть ім’я та прізвище",
        nameTooLong: "Не більше 60 символів",
        phoneInvalid: "Введіть номер повністю: 9 цифр після +380",
        emailRequired: "Вкажіть електронну пошту",
        emailInvalid: "Перевірте адресу. Приклад: name@example.com",
        notesTooLong: "Не більше 240 символів",
      },
    },
    actions: {
      confirm: "Підтвердити запис",
      confirming: "Підтверджуємо…",
      slotTaken: "Цей час щойно зайняли. Оберіть інший.",
      failed: "Не вдалося створити запис. Спробуйте ще раз.",
    },
    summary: {
      title: "Ваш запис",
      empty: "Оберіть послугу, щоб почати.",
      barber: "Барбер",
      when: "Коли",
      duration: "Тривалість",
      total: "Разом",
      open: "Деталі запису",
    },
    ticket: {
      pendingHint: "Барбершоп підтверджує ваш запис…",
      confirmedHint: "Крісло заброньовано за вами. До зустрічі!",
      statusPending: "Очікує підтвердження",
      statusConfirmed: "Підтверджено",
      bookingId: "Номер запису",
      date: "Дата",
      time: "Час",
      barber: "Барбер",
      services: "Послуги",
      duration: "Тривалість",
      total: "До сплати",
      client: "Клієнт",
      address: "Адреса",
      addToCalendar: "Додати в Google Календар",
      bookAnother: "Створити ще один запис",
      missingTitle: "Запис не знайдено",
      missingHint:
        "Схоже, дані цього запису видалено з браузера. Створіть новий запис.",
      startOver: "Почати спочатку",
      calendarDetails: (barber: string, id: string) =>
        `Барбер: ${barber}\nНомер запису: ${id}`,
    },
  },

  admin: {
    title: "Кабінет майстра",
    tabs: {
      label: "Розділи кабінету",
      schedule: "Розклад",
      clients: "Клієнти",
    },
    viewSite: "На сайт",
    resetDemo: "Скинути демо-дані",
    resetDone: "Демо-дані скинуто. Розклад повернувся до початкового.",
    demoNote: "Демо-режим: зміни зберігаються лише у вашому браузері.",
    dateNav: {
      previous: "Попередній день",
      next: "Наступний день",
      today: "Сьогодні",
      pick: "Обрати дату",
    },
    metrics: {
      label: "Показники дня",
      bookingsToday: "Записів сьогодні",
      bookingsDay: "Записів за день",
      upcoming: (count: number) => `Ще попереду: ${count}`,
      allDone: "Усі візити вже відбулися",
      revenue: "Очікуваний виторг",
      revenueHint: (average: string) => `Середній чек: ${average}`,
      occupancy: "Завантаженість майстрів",
      occupancyHint: (working: number, total: number) =>
        `Працює ${working} з ${total} барберів`,
      completion: "Завершені візити",
      completionHint: (done: number, total: number) =>
        `${done} з ${total} візитів відбулися`,
      completionEmpty: "Завершених візитів ще немає",
    },
    filters: {
      label: "Фільтр за статусом",
      all: "Усі",
    },
    grid: {
      label: "Розклад на день",
      timeColumn: "Час",
      dayOff: "Вихідний",
      appointments: (count: number) =>
        `${count} ${plural(count, "запис", "записи", "записів")}`,
      now: "зараз",
      addAt: (barber: string, time: string) =>
        `Додати запис: ${barber}, ${time}`,
      openAppointment: (client: string, time: string, status: string) =>
        `${client}, ${time}, ${status}. Відкрити запис`,
      emptyFilterTitle: (status: string) =>
        `Немає записів зі статусом «${status}»`,
      emptyFilterHint: "Спробуйте інший статус або покажіть усі записи.",
      showAll: "Показати всі",
      closedTitle: "Цього дня барбершоп зачинено",
      closedHint: "Оберіть іншу дату, щоб побачити розклад.",
      emptyDayTitle: "На цей день ще немає записів",
      emptyDayHint:
        "Натисніть на вільний час у розкладі або додайте клієнта кнопкою внизу.",
      loading: "Завантажуємо розклад",
    },
    appointment: {
      title: (id: string) => `Запис ${id}`,
      description: "Змініть статус або перенесіть запис.",
      client: "Клієнт",
      phone: "Телефон",
      noPhone: "Не вказано",
      services: "Послуги",
      barber: "Барбер",
      when: "Коли",
      price: "Сума",
      source: "Джерело",
      notes: "Побажання",
      status: "Статус",
      statusChanged: (status: string) => `Статус змінено: ${status}`,
      reschedule: "Перенесення",
      date: "Дата",
      time: "Час",
      noTimes: "Немає вільного часу",
      move: "Перенести запис",
      moved: (when: string) => `Запис перенесено: ${when}`,
      conflict: "Цей час уже зайнято. Оберіть інший.",
    },
    walkIn: {
      fab: "Додати клієнта",
      title: "Новий запис",
      description: "Для клієнтів без запису та дзвінків.",
      clientName: "Ім’я клієнта",
      clientNamePlaceholder: "Андрій Коваленко",
      phone: "Телефон",
      services: "Послуги",
      barber: "Барбер",
      start: "Початок",
      date: "Дата",
      source: "Як звернувся",
      noTimes: "У цього барбера немає вільного часу на цей день",
      pickServicesFirst: "Спершу оберіть послуги",
      submit: "Додати запис",
      created: (client: string, time: string) =>
        `Запис додано: ${client}, ${time}`,
      conflict: "Цей час уже зайнято. Оберіть інший.",
      errors: {
        nameRequired: "Вкажіть ім’я клієнта",
        nameTooLong: "Не більше 60 символів",
        phoneInvalid: "Введіть усі 9 цифр або залиште поле порожнім",
        servicesRequired: "Оберіть хоча б одну послугу",
        barberRequired: "Оберіть барбера",
        startRequired: "Оберіть час початку",
      },
    },
    clients: {
      searchLabel: "Пошук клієнта",
      searchPlaceholder: "Ім’я або телефон",
      loading: "Завантажуємо клієнтів",
      tableLabel: "Клієнти",
      period: (past: number, ahead: number) =>
        `Записи за останні ${past} днів і на ${ahead} днів уперед.`,
      count: (count: number) =>
        `${count} ${plural(count, "клієнт", "клієнти", "клієнтів")}`,
      filters: {
        label: "Фільтр клієнтів",
        all: "Усі",
        regulars: "Постійні",
        upcoming: "Із записом",
        noShows: "З неявками",
      },
      columns: {
        client: "Клієнт",
        phone: "Телефон",
        visits: "Візити",
        lastVisit: "Останній візит",
        nextVisit: "Наступний запис",
        spent: "Витрачено",
        barber: "Барбер",
      },
      none: "Немає",
      emptyTitle: "Нікого не знайдено",
      emptyHint: (query: string) =>
        query
          ? `За запитом «${query}» клієнтів немає. Перевірте написання або скиньте фільтри.`
          : "Немає клієнтів, які відповідають цьому фільтру.",
      clearFilters: "Скинути фільтри",
      showMore: (count: number) => `Показати ще ${count}`,
      openClient: (name: string) => `Відкрити картку клієнта: ${name}`,
      sheet: {
        description: "Історія записів і контакти",
        history: "Історія записів",
        newBooking: "Створити запис",
        noShows: (count: number) =>
          `${count} ${plural(count, "неявка", "неявки", "неявок")}`,
      },
    },
  },

  notFound: {
    title: "Сторінку не знайдено",
    lead: "Такої адреси в нас немає. Можливо, посилання застаріло.",
    home: "На головну",
    book: "Записатися",
  },
}
