import {
  formatTime,
  formatDate,
  getRelativeDateLabel,
  calculateTotalHours,
  formatHeaderStats,
  isOverlappingWithBooked,
  groupShiftsByDate,
} from '../src/utils/dateUtils';
import { Shift, ShiftWithStatus } from '../src/types/shift';

describe('Unit Tests: dateUtils', () => {
  describe('formatTime', () => {
    it('formats timestamps into 24-hour HH:MM format', () => {
      // 14:30
      const d = new Date(2026, 8, 22, 14, 30);
      expect(formatTime(d.getTime())).toBe('14:30');

      // 09:05 with zero padding
      const d2 = new Date(2026, 8, 22, 9, 5);
      expect(formatTime(d2.getTime())).toBe('09:05');
    });
  });

  describe('formatDate', () => {
    it('formats timestamp as "Month Day"', () => {
      const d = new Date(2026, 8, 22); // Month index 8 = September
      expect(formatDate(d.getTime())).toBe('September 22');
    });
  });

  describe('getRelativeDateLabel', () => {
    const fixedNow = new Date(2026, 8, 22, 10, 0, 0).getTime(); // Tuesday Sep 22, 2026

    it('returns "Today" for same calendar day', () => {
      const todayLater = new Date(2026, 8, 22, 18, 0, 0).getTime();
      expect(getRelativeDateLabel(todayLater, fixedNow)).toBe('Today');
    });

    it('returns "Tomorrow" for the next calendar day', () => {
      const tomorrow = new Date(2026, 8, 23, 9, 0, 0).getTime();
      expect(getRelativeDateLabel(tomorrow, fixedNow)).toBe('Tomorrow');
    });

    it('returns long date for dates after tomorrow', () => {
      const future = new Date(2026, 8, 24, 12, 0, 0).getTime();
      expect(getRelativeDateLabel(future, fixedNow)).toBe('September 24');
    });
  });

  describe('calculateTotalHours & formatHeaderStats', () => {
    it('calculates sum of durations correctly and rounds to 1 decimal', () => {
      const shifts = [
        { startTime: 0, endTime: 2 * 3600 * 1000 }, // 2 hours
        { startTime: 0, endTime: 2.5 * 3600 * 1000 }, // 2.5 hours
      ];
      expect(calculateTotalHours(shifts)).toBe(4.5);
      expect(formatHeaderStats(2, 4.5)).toBe('2 shifts, 4.5 h');
    });

    it('handles single shift singular label', () => {
      const shifts = [{ startTime: 0, endTime: 4 * 3600 * 1000 }];
      expect(calculateTotalHours(shifts)).toBe(4);
      expect(formatHeaderStats(1, 4)).toBe('1 shift, 4 h');
    });
  });

  describe('isOverlappingWithBooked', () => {
    const bookedShift: Shift = {
      id: 'booked-1',
      area: 'Helsinki',
      booked: true,
      startTime: 1000,
      endTime: 2000,
    };

    it('returns true when a shift overlaps a booked shift (startTime < other.endTime and endTime > other.startTime)', () => {
      const overlapping: Shift = {
        id: 'shift-overlap',
        area: 'Helsinki',
        booked: false,
        startTime: 1500,
        endTime: 2500,
      };
      expect(isOverlappingWithBooked(overlapping, [bookedShift])).toBe(true);
    });

    it('returns false when shift is adjacent (ends when other starts or starts when other ends)', () => {
      const adjacentBefore: Shift = {
        id: 'shift-adj-1',
        area: 'Helsinki',
        booked: false,
        startTime: 500,
        endTime: 1000,
      };
      const adjacentAfter: Shift = {
        id: 'shift-adj-2',
        area: 'Helsinki',
        booked: false,
        startTime: 2000,
        endTime: 3000,
      };
      expect(isOverlappingWithBooked(adjacentBefore, [bookedShift])).toBe(false);
      expect(isOverlappingWithBooked(adjacentAfter, [bookedShift])).toBe(false);
    });

    it('returns false for already booked shift itself', () => {
      expect(isOverlappingWithBooked(bookedShift, [bookedShift])).toBe(false);
    });

    it('ignores overlapping unbooked shifts (only overlaps with booked shifts)', () => {
      const unbookedOther: Shift = {
        id: 'unbooked-1',
        area: 'Helsinki',
        booked: false,
        startTime: 1000,
        endTime: 2000,
      };
      const candidate: Shift = {
        id: 'candidate',
        area: 'Helsinki',
        booked: false,
        startTime: 1200,
        endTime: 1800,
      };
      expect(isOverlappingWithBooked(candidate, [unbookedOther])).toBe(false);
    });
  });

  describe('groupShiftsByDate', () => {
    it('groups shifts by local calendar day and sorts chronologically', () => {
      const d1 = new Date(2026, 8, 22, 14, 0).getTime();
      const d1Earlier = new Date(2026, 8, 22, 10, 0).getTime();
      const d2 = new Date(2026, 8, 23, 11, 0).getTime();

      const shifts: ShiftWithStatus[] = [
        {
          id: '1',
          area: 'Helsinki',
          booked: true,
          startTime: d1,
          endTime: d1 + 2 * 3600 * 1000,
          isStarted: false,
          isFinished: false,
          isOverlapping: false,
        },
        {
          id: '2',
          area: 'Helsinki',
          booked: true,
          startTime: d1Earlier,
          endTime: d1Earlier + 2 * 3600 * 1000,
          isStarted: false,
          isFinished: false,
          isOverlapping: false,
        },
        {
          id: '3',
          area: 'Helsinki',
          booked: true,
          startTime: d2,
          endTime: d2 + 3 * 3600 * 1000,
          isStarted: false,
          isFinished: false,
          isOverlapping: false,
        },
      ];

      const sections = groupShiftsByDate(shifts, d1Earlier);
      expect(sections.length).toBe(2);

      // Section 1: Today
      expect(sections[0].title).toBe('Today');
      expect(sections[0].shiftCount).toBe(2);
      expect(sections[0].totalHours).toBe(4);
      // Shifts inside group sorted by startTime ascending
      expect(sections[0].data[0].id).toBe('2');
      expect(sections[0].data[1].id).toBe('1');

      // Section 2: Tomorrow
      expect(sections[1].title).toBe('Tomorrow');
      expect(sections[1].shiftCount).toBe(1);
      expect(sections[1].totalHours).toBe(3);
    });
  });
});
