export interface AggregatedMetric {
  event_day: string;
  utm_medium: string;
  sessions: number;
  pageviews: number;
  users: number;
  new_users: number;
  recurring_users: number;
  identified_users: number;
  event_count: number;
  engagement_rate: string | number;
}

export interface CountryStat {
  country: string;
  sessions: number;
}

export interface DailyMetric {
  date: string;
  sessions: number;
  pageviews: number;
  users: number;
  new_users: number;
  recurring_users: number;
  identified_users: number;
  event_count: number;
  engagement_rate: number;
}

export interface AggregatedPageData {
  pageName: string;
  category: string;
  team?: string | null;
  totals: {
    sessions: number;
    pageviews: number;
    users: number;
    new_users: number;
    recurring_users: number;
    identified_users: number;
    event_count: number;
    engagement_rate_avg: number;
  };
  dailyTrend: DailyMetric[];
}

/** One headline window: a span, the span it compares against, and both totals. */
export interface HeadlineWindow {
  start: string;
  end: string;
  prevStart: string;
  prevEnd: string;
  value: number;
  prevValue: number;
  /** null means no baseline to compare against — shown as "new". */
  diff: number | null;
}

/** The MTD / DOD / WOW set every page's headline chips read from. */
export interface HeadlineWindows {
  /** Newest day with data, which all three windows are anchored on. */
  anchorDate: string | null;
  metric?: string;
  mtd: HeadlineWindow | null;
  dod: HeadlineWindow | null;
  wow: HeadlineWindow | null;
}

export interface HeadlineData extends HeadlineWindows {
  // Pre-dates the windows above and is what the dashboard cards read.
  daily: {
    date: string;
    sessions: number;
    prevSessions: number;
    diff: number;
  };
  weekly: {
    range: string;
    sessions: number;
    prevSessions: number;
    diff: number;
  };
}
