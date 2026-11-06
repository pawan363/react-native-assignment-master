import {
  selectBookedSections,
  selectAvailableSections,
  selectCityCounts,
} from '../src/store/ShiftContext';
import { Shift } from '../src/types/shift';

describe('Selectors Tests', () => {
  const baseTime = 1700000000000; // Reference timestamp
  const now = baseTime + 1000;

  const sampleShifts: Shift[] = [
    // Booked shift 1 in Helsinki
    {
      id: 'shift-1',
      area: 'Helsinki',
      booked: true,
      startTime: baseTime + 10000,
      endTime: baseTime + 20000,
    },
    // Unbooked shift in Helsinki overlapping shift-1
    {
      id: 'shift-2',
      area: 'Helsinki',
      booked: false,
      startTime: baseTime + 15000,
      endTime: baseTime + 25000,
    },
    // Unbooked shift in Helsinki non-overlapping
    {
      id: 'shift-3',
      area: 'Helsinki',
      booked: false,
      startTime: baseTime + 30000,
      endTime: baseTime + 40000,
    },
    // Already finished shift in Helsinki (endTime < now)
    {
      id: 'shift-finished',
      area: 'Helsinki',
      booked: false,
      startTime: baseTime - 10000,
      endTime: baseTime - 5000,
    },
    // Shift in Tampere
    {
      id: 'shift-tampere',
      area: 'Tampere',
      booked: false,
      startTime: baseTime + 10000,
      endTime: baseTime + 20000,
    },
    // Shift in Turku
    {
      id: 'shift-turku',
      area: 'Turku',
      booked: false,
      startTime: baseTime + 10000,
      endTime: baseTime + 20000,
    },
  ];

  describe('selectBookedSections', () => {
    it('returns only booked shifts grouped by date', () => {
      const sections = selectBookedSections(sampleShifts, {}, now);
      expect(sections.length).toBe(1);
      expect(sections[0].data.length).toBe(1);
      expect(sections[0].data[0].id).toBe('shift-1');
      expect(sections[0].data[0].booked).toBe(true);
    });
  });

  describe('selectAvailableSections', () => {
    it('filters by selected city and hides finished shifts (where endTime <= now)', () => {
      const helsinkiSections = selectAvailableSections(sampleShifts, 'Helsinki', {}, now);
      const allShiftsInSections = helsinkiSections.flatMap((s) => s.data);

      // shift-finished should NOT be present
      expect(allShiftsInSections.find((s) => s.id === 'shift-finished')).toBeUndefined();
      // Only Helsinki shifts
      expect(allShiftsInSections.every((s) => s.area === 'Helsinki')).toBe(true);
    });

    it('flags overlapping shifts correctly', () => {
      const helsinkiSections = selectAvailableSections(sampleShifts, 'Helsinki', {}, now);
      const allShifts = helsinkiSections.flatMap((s) => s.data);

      const shift2 = allShifts.find((s) => s.id === 'shift-2');
      const shift3 = allShifts.find((s) => s.id === 'shift-3');

      expect(shift2?.isOverlapping).toBe(true); // Overlaps shift-1
      expect(shift3?.isOverlapping).toBe(false); // Does not overlap shift-1
    });

    it('attaches pending status from pending map', () => {
      const pending = { 'shift-3': 'booking' as const };
      const helsinkiSections = selectAvailableSections(sampleShifts, 'Helsinki', pending, now);
      const shift3 = helsinkiSections.flatMap((s) => s.data).find((s) => s.id === 'shift-3');
      expect(shift3?.pendingStatus).toBe('booking');
    });
  });

  describe('selectCityCounts', () => {
    it('counts active future shifts (endTime > now) per city for the tab labels', () => {
      const counts = selectCityCounts(sampleShifts, now);

      // In Helsinki: shift-1, shift-2, shift-3 are future (shift-finished is past) -> 3
      expect(counts.Helsinki).toBe(3);
      expect(counts.Tampere).toBe(1);
      expect(counts.Turku).toBe(1);
    });
  });
});
