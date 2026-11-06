import { fetchShifts, bookShift, cancelShift, ApiError } from '../src/api/shiftsApi';
import { Shift } from '../src/types/shift';

describe('Integration Tests: Shifts API (Live against http://127.0.0.1:8080)', () => {
  let allShifts: Shift[] = [];
  let testShift: Shift | undefined;

  beforeAll(async () => {
    allShifts = await fetchShifts();
  });

  it('GET /shifts returns all 34 shifts with expected fields', () => {
    expect(allShifts.length).toBe(34);
    for (const shift of allShifts) {
      expect(shift).toHaveProperty('id');
      expect(shift).toHaveProperty('area');
      expect(shift).toHaveProperty('booked');
      expect(shift).toHaveProperty('startTime');
      expect(shift).toHaveProperty('endTime');
      expect(['Helsinki', 'Tampere', 'Turku']).toContain(shift.area);
    }
  });

  it('POST /shifts/:id/book books an open future shift', async () => {
    const now = Date.now();
    // Pick an unbooked future shift
    testShift = allShifts.find((s) => !s.booked && s.startTime > now);
    expect(testShift).toBeDefined();

    const booked = await bookShift(testShift!.id);
    expect(booked.id).toBe(testShift!.id);
    expect(booked.booked).toBe(true);
  });

  it('POST /shifts/:id/book rejects already booked shift with 400', async () => {
    expect(testShift).toBeDefined();
    try {
      await bookShift(testShift!.id);
      fail('Expected bookShift to throw for already booked shift');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('already booked');
    }
  });

  it('POST /shifts/:id/cancel cancels the booking and sets booked to false', async () => {
    expect(testShift).toBeDefined();
    const cancelled = await cancelShift(testShift!.id);
    expect(cancelled.id).toBe(testShift!.id);
    expect(cancelled.booked).toBe(false);
  });

  it('POST /shifts/:id/cancel rejects non-booked shift with 400', async () => {
    expect(testShift).toBeDefined();
    try {
      await cancelShift(testShift!.id);
      fail('Expected cancelShift to throw for non-booked shift');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Cannot cancel shift that is not booked');
    }
  });
});
