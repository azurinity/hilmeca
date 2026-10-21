export interface FormatTimestampOptions {
  /** BCP 47 locale. Defaults to the runtime/system locale. */
  locale?: string;
  /** Force 12h/24h instead of the locale default. */
  hourCycle?: 'h12' | 'h23';
  /** First day of the week: 0 = Sunday ... 6 = Saturday. Defaults to the locale's convention. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Reference "now" (ms). Mainly for testing. */
  now?: number;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Calendar arithmetic via the Date constructor stays correct across DST changes
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function getWeekStartsOn(locale?: string): number {
  try {
    const resolved = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
    const loc = new Intl.Locale(resolved) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return info.firstDay % 7; // Intl: 1 = Monday ... 7 = Sunday
  } catch {
    /* fall through */
  }
  return 1; // Monday fallback
}

/**
 * Converts a millisecond timestamp into a short, human-readable string:
 * - today        -> time ("19:08" / "7:08 PM")
 * - yesterday    -> "Yesterday"
 * - this week    -> weekday name ("Monday")
 * - older/future -> numeric date ("10/24/2026")
 */
export function formatTimestamp(timestamp: number, options: FormatTimestampOptions = {}): string {
  const { locale, hourCycle, weekStartsOn } = options;

  const target = new Date(timestamp);
  if (Number.isNaN(target.getTime())) return '';

  const now = new Date(options.now ?? Date.now());
  const today = startOfDay(now);
  const targetDay = startOfDay(target);

  // 1. Today
  if (targetDay.getTime() === today.getTime()) {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      ...(hourCycle && { hourCycle }),
    }).format(target);
  }

  // 2. Yesterday (localized, capitalized)
  if (targetDay.getTime() === addDays(today, -1).getTime()) {
    const word = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
    return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
  }

  // 3. Earlier in the current week
  if (targetDay < today) {
    const firstDay = weekStartsOn ?? getWeekStartsOn(locale);
    const offset = (today.getDay() - firstDay + 7) % 7;
    const weekStart = addDays(today, -offset);
    if (targetDay >= weekStart) {
      return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(target);
    }
  }

  // 4. Older than this week (or in the future)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(target);
}
