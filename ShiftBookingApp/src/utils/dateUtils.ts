import { Shift, ShiftWithStatus, ShiftSection } from '../types/shift';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Formats timestamp as 24-hour time HH:MM */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Formats timestamp as "September 22" */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Returns Today, Tomorrow, or formatted date (e.g. September 22) based on local calendar day */
export function getRelativeDateLabel(timestamp: number, now: number = Date.now()): string {
  const nowDate = new Date(now);
  const targetDate = new Date(timestamp);

  const isToday =
    nowDate.getFullYear() === targetDate.getFullYear() &&
    nowDate.getMonth() === targetDate.getMonth() &&
    nowDate.getDate() === targetDate.getDate();

  if (isToday) {
    return 'Today';
  }

  const tomorrowDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1);
  const isTomorrow =
    tomorrowDate.getFullYear() === targetDate.getFullYear() &&
    tomorrowDate.getMonth() === targetDate.getMonth() &&
    tomorrowDate.getDate() === targetDate.getDate();

  if (isTomorrow) {
    return 'Tomorrow';
  }

  return formatDate(timestamp);
}

/** Calculates total hours rounded to 1 decimal place or whole number (e.g. 4 or 2.5) */
export function calculateTotalHours(shifts: Array<{ startTime: number; endTime: number }>): number {
  const totalMs = shifts.reduce((acc, s) => acc + Math.max(0, s.endTime - s.startTime), 0);
  const hours = totalMs / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
}

/** Format header stats, e.g. "2 shifts, 4 h" or "1 shift, 2.5 h" */
export function formatHeaderStats(count: number, hours: number): string {
  const shiftText = count === 1 ? '1 shift' : `${count} shifts`;
  return `${shiftText}, ${hours} h`;
}

/** Checks whether an unbooked shift overlaps any currently booked shift */
export function isOverlappingWithBooked(shift: Shift, allShifts: Shift[]): boolean {
  if (shift.booked) {
    return false;
  }
  return allShifts.some(
    (other) =>
      other.id !== shift.id &&
      other.booked &&
      shift.startTime < other.endTime &&
      shift.endTime > other.startTime,
  );
}

function getCalendarKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Groups shifts into sections sorted chronologically with headers and totals */
export function groupShiftsByDate(
  shifts: ShiftWithStatus[],
  now: number = Date.now(),
): ShiftSection[] {
  const map = new Map<string, ShiftWithStatus[]>();

  for (const shift of shifts) {
    const key = getCalendarKey(shift.startTime);
    const list = map.get(key);
    if (list) {
      list.push(shift);
    } else {
      map.set(key, [shift]);
    }
  }

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const data = map.get(key)!;
    data.sort((a, b) => a.startTime - b.startTime);

    const title = getRelativeDateLabel(data[0].startTime, now);
    const totalHours = calculateTotalHours(data);

    return {
      title,
      shiftCount: data.length,
      totalHours,
      data,
    };
  });
}
