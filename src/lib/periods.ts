import {
  parseISO,
  format as formatDate,
  subDays,
  subMonths,
  differenceInCalendarDays,
  startOfMonth,
  lastDayOfMonth,
  isSameDay,
} from "date-fns";

/* Derive the comparison window for a "vs previous period" column from the
 * selected range:
 *  - single day                              → the previous day
 *  - full calendar month (1st → month-end)  → the previous full month
 *  - month-to-date (1st → mid-month)         → same day span in the previous month
 *  - anything else (a week, arbitrary span)  → the same-length window right before it
 */
export function getPreviousPeriod(startStr: string, endStr: string) {
  const start = parseISO(startStr);
  const end = parseISO(endStr);

  // A single selected day always compares to the day before (this must come
  // before the month rule, else the 1st of a month would compare to the 1st
  // of the previous month instead of the previous day).
  if (isSameDay(start, end)) {
    const prev = formatDate(subDays(start, 1), "yyyy-MM-dd");
    return { prevStart: prev, prevEnd: prev };
  }

  const startsOnFirst = start.getDate() === 1;
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (startsOnFirst && sameMonth) {
    const prevMonthStart = startOfMonth(subMonths(start, 1));
    const endsOnMonthEnd = isSameDay(end, lastDayOfMonth(end));
    let prevEnd: Date;
    if (endsOnMonthEnd) {
      prevEnd = lastDayOfMonth(prevMonthStart);
    } else {
      const lastDay = lastDayOfMonth(prevMonthStart).getDate();
      prevEnd = new Date(
        prevMonthStart.getFullYear(),
        prevMonthStart.getMonth(),
        Math.min(end.getDate(), lastDay),
      );
    }
    return {
      prevStart: formatDate(prevMonthStart, "yyyy-MM-dd"),
      prevEnd: formatDate(prevEnd, "yyyy-MM-dd"),
    };
  }

  const days = differenceInCalendarDays(end, start) + 1;
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days - 1);
  return {
    prevStart: formatDate(prevStart, "yyyy-MM-dd"),
    prevEnd: formatDate(prevEnd, "yyyy-MM-dd"),
  };
}

/**
 * Month-to-date up to `anchor`, against the same day span of the previous month.
 *
 * The day of month is clamped, so 31 Mar compares against 28/29 Feb instead of
 * spilling into March. Mirrors buildHeadlineWindows() on the API side.
 */
export function monthToDateWindow(anchor: string) {
  const day = parseISO(anchor);
  const monthStart = startOfMonth(day);
  const prevMonthStart = startOfMonth(subMonths(day, 1));
  const prevMonthEnd = new Date(
    prevMonthStart.getFullYear(),
    prevMonthStart.getMonth(),
    Math.min(day.getDate(), lastDayOfMonth(prevMonthStart).getDate()),
  );
  return {
    start: formatDate(monthStart, "yyyy-MM-dd"),
    end: formatDate(day, "yyyy-MM-dd"),
    prevStart: formatDate(prevMonthStart, "yyyy-MM-dd"),
    prevEnd: formatDate(prevMonthEnd, "yyyy-MM-dd"),
  };
}

/** The day before a yyyy-MM-dd date, same format. */
export function previousDay(dateStr: string): string {
  return formatDate(subDays(parseISO(dateStr), 1), "yyyy-MM-dd");
}

/** "21 Aug" — column headers already sit under a dated card. */
export function formatDayLabel(dateStr: string): string {
  try {
    return formatDate(parseISO(dateStr), "d MMM");
  } catch {
    return dateStr;
  }
}

/** "1 – 21 Aug", collapsing whatever the two dates already share. */
export function formatRangeLabel(startStr: string, endStr: string): string {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    if (isSameDay(start, end)) return formatDate(start, "d MMM");
    const sameMonth =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth();
    if (sameMonth) return `${formatDate(start, "d")} – ${formatDate(end, "d MMM")}`;
    const sameYear = start.getFullYear() === end.getFullYear();
    return sameYear
      ? `${formatDate(start, "d MMM")} – ${formatDate(end, "d MMM")}`
      : `${formatDate(start, "d MMM yy")} – ${formatDate(end, "d MMM yy")}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}
