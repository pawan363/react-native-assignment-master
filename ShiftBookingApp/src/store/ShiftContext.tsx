import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Shift, City, ShiftWithStatus, ShiftSection, ActionStatus } from '../types/shift';
import * as api from '../api/shiftsApi';
import { isOverlappingWithBooked, groupShiftsByDate } from '../utils/dateUtils';

// ---------------------------------------------------------------------------
// State Shape
// ---------------------------------------------------------------------------

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ShiftState {
  shifts: Shift[];
  status: RequestStatus;
  error: string | null;
  /** Map of shift ID -> 'booking' | 'cancelling' */
  pending: Record<string, ActionStatus>;
  selectedCity: City;
  lastActionError: string | null;
}

export const initialShiftState: ShiftState = {
  shifts: [],
  status: 'idle',
  error: null,
  pending: {},
  selectedCity: 'Helsinki',
  lastActionError: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type ShiftAction =
  | { type: 'FETCH_SHIFTS_START' }
  | { type: 'FETCH_SHIFTS_SUCCESS'; payload: Shift[] }
  | { type: 'FETCH_SHIFTS_ERROR'; payload: string }
  | { type: 'BOOK_SHIFT_START'; payload: string }
  | { type: 'BOOK_SHIFT_SUCCESS'; payload: Shift }
  | { type: 'BOOK_SHIFT_ERROR'; payload: { id: string; error: string } }
  | { type: 'CANCEL_SHIFT_START'; payload: string }
  | { type: 'CANCEL_SHIFT_SUCCESS'; payload: Shift }
  | { type: 'CANCEL_SHIFT_ERROR'; payload: { id: string; error: string } }
  | { type: 'SET_CITY'; payload: City }
  | { type: 'CLEAR_ACTION_ERROR' };

// ---------------------------------------------------------------------------
// Pure Reducer (Exported for unit testing)
// ---------------------------------------------------------------------------

export function shiftReducer(state: ShiftState, action: ShiftAction): ShiftState {
  switch (action.type) {
    case 'FETCH_SHIFTS_START':
      return {
        ...state,
        status: 'loading',
        error: null,
      };

    case 'FETCH_SHIFTS_SUCCESS':
      return {
        ...state,
        status: 'succeeded',
        shifts: action.payload,
        error: null,
      };

    case 'FETCH_SHIFTS_ERROR':
      return {
        ...state,
        status: 'failed',
        error: action.payload,
      };

    case 'BOOK_SHIFT_START': {
      // Ignore tap if already pending
      if (state.pending[action.payload]) {
        return state;
      }
      return {
        ...state,
        pending: { ...state.pending, [action.payload]: 'booking' },
        lastActionError: null,
      };
    }

    case 'BOOK_SHIFT_SUCCESS': {
      const { [action.payload.id]: _, ...restPending } = state.pending;
      return {
        ...state,
        shifts: state.shifts.map((s) => (s.id === action.payload.id ? action.payload : s)),
        pending: restPending,
      };
    }

    case 'BOOK_SHIFT_ERROR': {
      const { [action.payload.id]: _, ...restPending } = state.pending;
      return {
        ...state,
        pending: restPending,
        lastActionError: action.payload.error,
      };
    }

    case 'CANCEL_SHIFT_START': {
      // Ignore tap if already pending
      if (state.pending[action.payload]) {
        return state;
      }
      return {
        ...state,
        pending: { ...state.pending, [action.payload]: 'cancelling' },
        lastActionError: null,
      };
    }

    case 'CANCEL_SHIFT_SUCCESS': {
      const { [action.payload.id]: _, ...restPending } = state.pending;
      return {
        ...state,
        shifts: state.shifts.map((s) => (s.id === action.payload.id ? action.payload : s)),
        pending: restPending,
      };
    }

    case 'CANCEL_SHIFT_ERROR': {
      const { [action.payload.id]: _, ...restPending } = state.pending;
      return {
        ...state,
        pending: restPending,
        lastActionError: action.payload.error,
      };
    }

    case 'SET_CITY':
      return {
        ...state,
        selectedCity: action.payload,
      };

    case 'CLEAR_ACTION_ERROR':
      return {
        ...state,
        lastActionError: null,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Pure Selectors (Exported for unit testing)
// ---------------------------------------------------------------------------

/** Booked shifts grouped by day, with count and total hours */
export function selectBookedSections(
  shifts: Shift[],
  pending: Record<string, ActionStatus>,
  now: number,
): ShiftSection[] {
  const bookedShifts: ShiftWithStatus[] = shifts
    .filter((s) => s.booked)
    .map((s) => ({
      ...s,
      isStarted: now >= s.startTime,
      isFinished: now >= s.endTime,
      isOverlapping: false,
      pendingStatus: pending[s.id] || 'idle',
    }));

  return groupShiftsByDate(bookedShifts, now);
}

/** Available shifts for a city, grouped by day, each flagged started, booked or overlapping */
export function selectAvailableSections(
  shifts: Shift[],
  city: City,
  pending: Record<string, ActionStatus>,
  now: number,
): ShiftSection[] {
  // Pre-filter booked shifts once to optimize overlap checks
  const bookedShifts = shifts.filter((s) => s.booked);
  // Available shifts shows only shifts whose endTime is in the future
  const filtered = shifts.filter((s) => s.area === city && s.endTime > now);

  const decorated: ShiftWithStatus[] = filtered.map((s) => ({
    ...s,
    isStarted: now >= s.startTime,
    isFinished: now >= s.endTime,
    isOverlapping: isOverlappingWithBooked(s, bookedShifts),
    pendingStatus: pending[s.id] || 'idle',
  }));

  return groupShiftsByDate(decorated, now);
}

/** Shift counts per city for the tab labels (shows shifts from now onwards where endTime > now) */
export function selectCityCounts(shifts: Shift[], now: number): Record<City, number> {
  const counts: Record<City, number> = {
    Helsinki: 0,
    Tampere: 0,
    Turku: 0,
  };

  for (const s of shifts) {
    if (s.endTime > now && (s.area === 'Helsinki' || s.area === 'Tampere' || s.area === 'Turku')) {
      counts[s.area as City]++;
    }
  }

  return counts;
}

// ---------------------------------------------------------------------------
// Context & Provider
// ---------------------------------------------------------------------------

interface ShiftContextValue extends ShiftState {
  now: number;
  bookedSections: ShiftSection[];
  availableSections: ShiftSection[];
  cityCounts: Record<City, number>;
  fetchShifts: () => Promise<void>;
  bookShift: (id: string) => Promise<void>;
  cancelShift: (id: string) => Promise<void>;
  setSelectedCity: (city: City) => void;
  clearActionError: () => void;
}

const ShiftContext = createContext<ShiftContextValue | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shiftReducer, initialShiftState);
  const [now, setNow] = useState(Date.now());

  // Minute tick to keep `now` fresh so shifts disable right when they start
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchShifts = useCallback(async () => {
    dispatch({ type: 'FETCH_SHIFTS_START' });
    try {
      const data = await api.fetchShifts();
      dispatch({ type: 'FETCH_SHIFTS_SUCCESS', payload: data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch shifts';
      dispatch({ type: 'FETCH_SHIFTS_ERROR', payload: msg });
    }
  }, []);

  const bookShift = useCallback(
    async (id: string) => {
      if (state.pending[id]) return; // prevent double tap
      dispatch({ type: 'BOOK_SHIFT_START', payload: id });
      try {
        const updated = await api.bookShift(id);
        dispatch({ type: 'BOOK_SHIFT_SUCCESS', payload: updated });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to book shift';
        dispatch({ type: 'BOOK_SHIFT_ERROR', payload: { id, error: msg } });
      }
    },
    [state.pending],
  );

  const cancelShift = useCallback(
    async (id: string) => {
      if (state.pending[id]) return; // prevent double tap
      dispatch({ type: 'CANCEL_SHIFT_START', payload: id });
      try {
        const updated = await api.cancelShift(id);
        dispatch({ type: 'CANCEL_SHIFT_SUCCESS', payload: updated });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel shift';
        dispatch({ type: 'CANCEL_SHIFT_ERROR', payload: { id, error: msg } });
      }
    },
    [state.pending],
  );

  const setSelectedCity = useCallback((city: City) => {
    dispatch({ type: 'SET_CITY', payload: city });
  }, []);

  const clearActionError = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTION_ERROR' });
  }, []);

  // Fetch initial shifts
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Auto-dismiss last action error after 4 seconds
  useEffect(() => {
    if (state.lastActionError) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_ACTION_ERROR' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.lastActionError]);

  // Derived memoized data using selectors
  const bookedSections = useMemo(
    () => selectBookedSections(state.shifts, state.pending, now),
    [state.shifts, state.pending, now],
  );

  const availableSections = useMemo(
    () => selectAvailableSections(state.shifts, state.selectedCity, state.pending, now),
    [state.shifts, state.selectedCity, state.pending, now],
  );

  const cityCounts = useMemo(() => selectCityCounts(state.shifts, now), [state.shifts, now]);

  const value = useMemo<ShiftContextValue>(
    () => ({
      ...state,
      now,
      bookedSections,
      availableSections,
      cityCounts,
      fetchShifts,
      bookShift,
      cancelShift,
      setSelectedCity,
      clearActionError,
    }),
    [
      state,
      now,
      bookedSections,
      availableSections,
      cityCounts,
      fetchShifts,
      bookShift,
      cancelShift,
      setSelectedCity,
      clearActionError,
    ],
  );

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
}

export function useShiftContext(): ShiftContextValue {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
}
