import { Platform } from 'react-native';
import { Shift } from '../types/shift';

/**
 * Base URL for the shifts API.
 * Android emulators route 10.0.2.2 to the host machine's localhost.
 */
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

/**
 * Fetch all available shifts from the API.
 */
export async function fetchShifts(): Promise<Shift[]> {
  const response = await fetch(`${BASE_URL}/shifts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
  }

  const data: Shift[] = await response.json();
  return data;
}

/**
 * Book a shift by its ID.
 */
export async function bookShift(id: string): Promise<Shift> {
  const response = await fetch(`${BASE_URL}/shifts/${id}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      errorBody || `Failed to book shift: ${response.status} ${response.statusText}`,
    );
  }

  const data: Shift = await response.json();
  return data;
}

/**
 * Cancel a previously booked shift by its ID.
 */
export async function cancelShift(id: string): Promise<Shift> {
  const response = await fetch(`${BASE_URL}/shifts/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      errorBody || `Failed to cancel shift: ${response.status} ${response.statusText}`,
    );
  }

  const data: Shift = await response.json();
  return data;
}
