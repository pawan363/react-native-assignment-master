import { shiftReducer, initialShiftState, ShiftState } from '../src/store/ShiftContext';
import { Shift } from '../src/types/shift';

describe('Store Tests: shiftReducer', () => {
  const sampleShift: Shift = {
    id: 'shift-1',
    area: 'Helsinki',
    booked: false,
    startTime: 1000,
    endTime: 2000,
  };

  it('handles FETCH_SHIFTS_START, SUCCESS, and ERROR', () => {
    const loadingState = shiftReducer(initialShiftState, { type: 'FETCH_SHIFTS_START' });
    expect(loadingState.status).toBe('loading');
    expect(loadingState.error).toBeNull();

    const successState = shiftReducer(loadingState, {
      type: 'FETCH_SHIFTS_SUCCESS',
      payload: [sampleShift],
    });
    expect(successState.status).toBe('succeeded');
    expect(successState.shifts).toEqual([sampleShift]);

    const errorState = shiftReducer(loadingState, {
      type: 'FETCH_SHIFTS_ERROR',
      payload: 'Network Error',
    });
    expect(errorState.status).toBe('failed');
    expect(errorState.error).toBe('Network Error');
  });

  describe('Booking actions', () => {
    it('sets pending status on BOOK_SHIFT_START', () => {
      const state = shiftReducer(initialShiftState, {
        type: 'BOOK_SHIFT_START',
        payload: 'shift-1',
      });
      expect(state.pending['shift-1']).toBe('booking');
    });

    it('ignores second tap on a shift already pending (double-tap protection)', () => {
      const state: ShiftState = {
        ...initialShiftState,
        pending: { 'shift-1': 'booking' },
      };
      const nextState = shiftReducer(state, {
        type: 'BOOK_SHIFT_START',
        payload: 'shift-1',
      });
      // Should return the identical state reference
      expect(nextState).toBe(state);
    });

    it('updates shift and cleans up pending on BOOK_SHIFT_SUCCESS', () => {
      const state: ShiftState = {
        ...initialShiftState,
        shifts: [sampleShift],
        pending: { 'shift-1': 'booking' },
      };

      const updatedShift: Shift = { ...sampleShift, booked: true };
      const nextState = shiftReducer(state, {
        type: 'BOOK_SHIFT_SUCCESS',
        payload: updatedShift,
      });

      expect(nextState.shifts[0].booked).toBe(true);
      expect(nextState.pending['shift-1']).toBeUndefined();
    });

    it('cleans up pending and records error on BOOK_SHIFT_ERROR', () => {
      const state: ShiftState = {
        ...initialShiftState,
        shifts: [sampleShift],
        pending: { 'shift-1': 'booking' },
      };

      const nextState = shiftReducer(state, {
        type: 'BOOK_SHIFT_ERROR',
        payload: { id: 'shift-1', error: 'Shift is already booked' },
      });

      expect(nextState.pending['shift-1']).toBeUndefined();
      expect(nextState.lastActionError).toBe('Shift is already booked');
      // Shift stays unchanged
      expect(nextState.shifts[0].booked).toBe(false);
    });
  });

  describe('Cancelling actions', () => {
    const bookedShift: Shift = { ...sampleShift, booked: true };

    it('sets pending status on CANCEL_SHIFT_START', () => {
      const state = shiftReducer(initialShiftState, {
        type: 'CANCEL_SHIFT_START',
        payload: 'shift-1',
      });
      expect(state.pending['shift-1']).toBe('cancelling');
    });

    it('ignores second tap on a shift already pending cancel', () => {
      const state: ShiftState = {
        ...initialShiftState,
        pending: { 'shift-1': 'cancelling' },
      };
      const nextState = shiftReducer(state, {
        type: 'CANCEL_SHIFT_START',
        payload: 'shift-1',
      });
      expect(nextState).toBe(state);
    });

    it('updates shift and cleans up pending on CANCEL_SHIFT_SUCCESS', () => {
      const state: ShiftState = {
        ...initialShiftState,
        shifts: [bookedShift],
        pending: { 'shift-1': 'cancelling' },
      };

      const unbookedShift: Shift = { ...bookedShift, booked: false };
      const nextState = shiftReducer(state, {
        type: 'CANCEL_SHIFT_SUCCESS',
        payload: unbookedShift,
      });

      expect(nextState.shifts[0].booked).toBe(false);
      expect(nextState.pending['shift-1']).toBeUndefined();
    });

    it('cleans up pending and records error on CANCEL_SHIFT_ERROR', () => {
      const state: ShiftState = {
        ...initialShiftState,
        shifts: [bookedShift],
        pending: { 'shift-1': 'cancelling' },
      };

      const nextState = shiftReducer(state, {
        type: 'CANCEL_SHIFT_ERROR',
        payload: { id: 'shift-1', error: 'Cannot cancel shift that is not booked' },
      });

      expect(nextState.pending['shift-1']).toBeUndefined();
      expect(nextState.lastActionError).toBe('Cannot cancel shift that is not booked');
      expect(nextState.shifts[0].booked).toBe(true);
    });
  });

  describe('UI state actions', () => {
    it('updates selectedCity on SET_CITY', () => {
      const state = shiftReducer(initialShiftState, {
        type: 'SET_CITY',
        payload: 'Tampere',
      });
      expect(state.selectedCity).toBe('Tampere');
    });

    it('clears lastActionError on CLEAR_ACTION_ERROR', () => {
      const state: ShiftState = {
        ...initialShiftState,
        lastActionError: 'An error',
      };
      const nextState = shiftReducer(state, { type: 'CLEAR_ACTION_ERROR' });
      expect(nextState.lastActionError).toBeNull();
    });
  });
});
