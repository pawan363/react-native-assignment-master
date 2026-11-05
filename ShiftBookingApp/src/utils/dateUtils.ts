import { Shift, ShiftSection } from '../types/shift';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Pad a number to two digits (e.g. 5 → "05").
 */
function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Format a Unix-millisecond timestamp as "HH:MM" (24-hour).
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Format a Unix-millisecond timestamp as "Month Day, Year"
 * (e.g. "March 14, 2024").
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Return "Today", "Tomorrow", or the formatted date string
 * for a given Unix-millisecond timestamp.
 */
export function getRelativeDateLabel(timestamp: number): string {
  const now = new Date();
  const target = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);
  const dayAfterTomorrow = new Date(todayStart.getTime() + 2 * 86_400_000);

  const targetTime = target.getTime();

  if (targetTime >= todayStart.getTime() && targetTime < tomorrowStart.getTime()) {
    return 'Today';
  }
  if (targetTime >= tomorrowStart.getTime() && targetTime < dayAfterTomorrow.getTime()) {
    return 'Tomorrow';
  }

  return formatDate(timestamp);
}

/**
 * Check whether a shift has already started (its startTime is in the past).
 */
export function isShiftStarted(shift: Shift): boolean {
  return Date.now() >= shift.startTime;
}

/**
 * Return a date-only key string (YYYY-MM-DD) for grouping.
 */
function dateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Group an array of shifts by date, returning sections suitable for
 * React Native's SectionList. Sections are sorted chronologically and
 * each section's title uses the relative date label
 * ("Today", "Tomorrow", or "Month Day, Year").
 */
export function groupShiftsByDate(shifts: Shift[]): ShiftSection[] {
  const map = new Map<string, Shift[]>();

  for (const shift of shifts) {
    const key = dateKey(shift.startTime);
    const list = map.get(key);
    if (list) {
      list.push(shift);
    } else {
      map.set(key, [shift]);
    }
  }

  // Sort keys chronologically
  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const data = map.get(key)!;
    // Sort shifts within each day by startTime
    data.sort((a, b) => a.startTime - b.startTime);

    const title = getRelativeDateLabel(data[0].startTime);

    return { title, data };
  });
}
