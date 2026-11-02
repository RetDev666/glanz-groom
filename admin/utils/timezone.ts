/**
 * Timezone helpers for Glanz & Groom (Berlin, Germany)
 * Salon timezone is canonically 'Europe/Berlin'.
 */

export const SALON_TIMEZONE = 'Europe/Berlin';

export interface BerlinParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
}

/**
 * Extracts Berlin local date and time parts from a Date object or ISO string.
 */
export function getBerlinParts(date: Date | string | number): BerlinParts {
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return {
      year: 1970,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      dateStr: '1970-01-01',
      timeStr: '00:00',
    };
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }

  const hour = Number(p.hour === '24' ? 0 : p.hour);
  const minute = Number(p.minute || 0);
  const second = Number(p.second || 0);
  const dateStr = `${p.year}-${p.month}-${p.day}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour,
    minute,
    second,
    dateStr,
    timeStr,
  };
}

/**
 * Converts a Berlin local date/time (e.g. "2026-11-10", "14:00" or "2026-11-10T14:00:00")
 * to a UTC Date object.
 * If the input string already has a timezone indicator (Z or +HH:mm / -HH:mm),
 * it is parsed directly with new Date().
 */
export function parseBerlinOrUtcDate(dateStr: string | Date, timeStr?: string): Date {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();

  const str = String(dateStr).trim();
  if (/Z|[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }

  let dStr = str;
  let tStr = timeStr ? String(timeStr).trim() : '';

  if (!tStr && dStr.includes('T')) {
    const parts = dStr.split('T');
    dStr = parts[0];
    tStr = parts[1].slice(0, 5);
  } else if (!tStr && dStr.includes(' ')) {
    const parts = dStr.split(' ');
    dStr = parts[0];
    tStr = parts[1].slice(0, 5);
  } else if (!tStr) {
    tStr = '00:00';
  }

  const [y, m, d] = dStr.split('-').map(Number);
  const [hh, mm] = tStr.split(':').map(Number);

  const approx = new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0));
  const parts = getBerlinParts(approx);

  const diffMins = (parts.hour * 60 + parts.minute) - ((hh || 0) * 60 + (mm || 0));
  const offsetMins = ((diffMins + 1440 + 720) % 1440) - 720;

  return new Date(approx.getTime() - offsetMins * 60 * 1000);
}

/**
 * Checks if two dates fall on the same calendar day in Berlin timezone.
 */
export function isSameBerlinDay(date1: Date | string | number, date2: Date | string | number): boolean {
  return getBerlinParts(date1).dateStr === getBerlinParts(date2).dateStr;
}

/**
 * Formats a Date/ISO string to "HH:mm" in Berlin timezone.
 */
export function formatBerlinHm(date: Date | string | number): string {
  return getBerlinParts(date).timeStr;
}
