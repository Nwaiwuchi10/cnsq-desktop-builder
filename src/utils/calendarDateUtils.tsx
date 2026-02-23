export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getCalendarGrid = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const grid: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    grid.push({
      date: daysInPrevMonth[daysInPrevMonth.length - 1 - i],
      isCurrentMonth: false,
    });
  }

  daysInMonth.forEach((date) => {
    grid.push({
      date,
      isCurrentMonth: true,
    });
  });

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const daysInNextMonth = getDaysInMonth(nextYear, nextMonth);

  let i = 0;
  while (grid.length < 42) {
    grid.push({
      date: daysInNextMonth[i],
      isCurrentMonth: false,
    });
    i++;
  }

  return grid;
};

export const getWeekDays = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
};

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isEventVisibleOnDate = (event: any, date: Date) => {
  const eventStart = new Date(event.startTime);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const startDay = new Date(eventStart);
  startDay.setHours(0, 0, 0, 0);

  // If the check date is before the event starts, it's not visible
  if (checkDate < startDay) return false;

  // If an end date for recurrence exists, check if we're past it
  if (event.isRecurring && event.recurrenceEndDate) {
    const endDay = new Date(event.recurrenceEndDate);
    endDay.setHours(23, 59, 59, 999);
    if (checkDate > endDay) return false;
  }

  // Non-recurring events
  if (!event.isRecurring) {
    return isSameDay(eventStart, date);
  }

  // Recurring events
  switch (event.recurrenceFrequency) {
    case "DAILY":
      return true;
    case "WEEKLY":
      return eventStart.getDay() === checkDate.getDay();
    case "MONTHLY":
      return eventStart.getDate() === checkDate.getDate();
    default:
      return isSameDay(eventStart, date);
  }
};
