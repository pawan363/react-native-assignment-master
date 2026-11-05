import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { Shift, Area } from '../types/shift';
import * as api from '../api/shiftsApi';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  error: string | null;
  /** IDs of shifts currently being booked / cancelled (per-shift spinners). */
  loadingShiftIds: string[];
  selectedArea: Area;
}

const initialState: ShiftState = {
  shifts: [],
  loading: false,
  error: null,
  loadingShiftIds: [],
  selectedArea: 'Helsinki',
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ShiftAction =
  | { type: 'FETCH_SHIFTS_START' }
  | { type: 'FETCH_SHIFTS_SUCCESS'; payload: Shift[] }
  | { type: 'FETCH_SHIFTS_ERROR'; payload: string }
  | { type: 'BOOK_SHIFT_START'; payload: string }
  | { type: 'BOOK_SHIFT_SUCCESS'; payload: Shift }
  | { type: 'BOOK_SHIFT_ERROR'; payload: { id: string; error: string } }
  | { type: 'CANCEL_SHIFT_START'; payload: string }
  | { type: 'CANCEL_SHIFT_SUCCESS'; payload: Shift }
  | { type: 'CANCEL_SHIFT_ERROR'; payload: { id: string; error: string } }
  | { type: 'SET_AREA'; payload: Area };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Add a shift id to the loading list. */
function addLoadingId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

/** Remove a shift id from the loading list. */
function removeLoadingId(ids: string[], id: string): string[] {
  return ids.filter((i) => i !== id);
}

/** Replace a single shift in the shifts array by matching id. */
function replaceShift(shifts: Shift[], updated: Shift): Shift[] {
  return shifts.map((s) => (s.id === updated.id ? updated : s));
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function shiftReducer(state: ShiftState, action: ShiftAction): ShiftState {
  switch (action.type) {
    // ---- Fetch all shifts ----
    case 'FETCH_SHIFTS_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SHIFTS_SUCCESS':
      return { ...state, loading: false, shifts: action.payload };

    case 'FETCH_SHIFTS_ERROR':
      return { ...state, loading: false, error: action.payload };

    // ---- Book a shift ----
    case 'BOOK_SHIFT_START':
      return {
        ...state,
        loadingShiftIds: addLoadingId(state.loadingShiftIds, action.payload),
      };

    case 'BOOK_SHIFT_SUCCESS':
      return {
        ...state,
        shifts: replaceShift(state.shifts, action.payload),
        loadingShiftIds: removeLoadingId(state.loadingShiftIds, action.payload.id),
      };

    case 'BOOK_SHIFT_ERROR':
      return {
        ...state,
        loadingShiftIds: removeLoadingId(state.loadingShiftIds, action.payload.id),
        error: action.payload.error,
      };

    // ---- Cancel a shift ----
    case 'CANCEL_SHIFT_START':
      return {
        ...state,
        loadingShiftIds: addLoadingId(state.loadingShiftIds, action.payload),
      };

    case 'CANCEL_SHIFT_SUCCESS':
      return {
        ...state,
        shifts: replaceShift(state.shifts, action.payload),
        loadingShiftIds: removeLoadingId(state.loadingShiftIds, action.payload.id),
      };

    case 'CANCEL_SHIFT_ERROR':
      return {
        ...state,
        loadingShiftIds: removeLoadingId(state.loadingShiftIds, action.payload.id),
        error: action.payload.error,
      };

    // ---- Area filter ----
    case 'SET_AREA':
      return { ...state, selectedArea: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ShiftContextValue extends ShiftState {
  fetchShifts: () => Promise<void>;
  bookShift: (id: string) => Promise<void>;
  cancelShift: (id: string) => Promise<void>;
  setSelectedArea: (area: Area) => void;
}

const ShiftContext = createContext<ShiftContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ShiftProviderProps {
  children: ReactNode;
}

export function ShiftProvider({ children }: ShiftProviderProps) {
  const [state, dispatch] = useReducer(shiftReducer, initialState);

  // ---- Action creators (memoised) ----

  const fetchShifts = useCallback(async () => {
    dispatch({ type: 'FETCH_SHIFTS_START' });
    try {
      const shifts = await api.fetchShifts();
      dispatch({ type: 'FETCH_SHIFTS_SUCCESS', payload: shifts });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shifts';
      dispatch({ type: 'FETCH_SHIFTS_ERROR', payload: message });
    }
  }, []);

  const bookShift = useCallback(async (id: string) => {
    dispatch({ type: 'BOOK_SHIFT_START', payload: id });
    try {
      const updated = await api.bookShift(id);
      dispatch({ type: 'BOOK_SHIFT_SUCCESS', payload: updated });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to book shift';
      dispatch({ type: 'BOOK_SHIFT_ERROR', payload: { id, error: message } });
    }
  }, []);

  const cancelShift = useCallback(async (id: string) => {
    dispatch({ type: 'CANCEL_SHIFT_START', payload: id });
    try {
      const updated = await api.cancelShift(id);
      dispatch({ type: 'CANCEL_SHIFT_SUCCESS', payload: updated });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel shift';
      dispatch({ type: 'CANCEL_SHIFT_ERROR', payload: { id, error: message } });
    }
  }, []);

  const setSelectedArea = useCallback((area: Area) => {
    dispatch({ type: 'SET_AREA', payload: area });
  }, []);

  // Auto-fetch shifts on mount
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // ---- Memoised context value ----

  const value = useMemo<ShiftContextValue>(
    () => ({
      ...state,
      fetchShifts,
      bookShift,
      cancelShift,
      setSelectedArea,
    }),
    [state, fetchShifts, bookShift, cancelShift, setSelectedArea],
  );

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Consume the ShiftContext. Must be called inside a <ShiftProvider>.
 */
export function useShiftContext(): ShiftContextValue {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
}
