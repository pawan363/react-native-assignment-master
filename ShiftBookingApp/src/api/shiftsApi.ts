import { Shift } from '../types/shift';
import { API_BASE_URL } from '../config/apiConfig';

export const BASE_URL = API_BASE_URL;

export class ApiError extends Error {
  statusCode?: number;
  serverError?: string;

  constructor(message: string, statusCode?: number, serverError?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.serverError = serverError;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    let serverError: string | undefined;
    try {
      const json = await response.json();
      if (json && json.message) {
        errorMsg = json.message;
      }
      if (json && json.error) {
        serverError = json.error;
      }
    } catch {
      // not JSON
    }
    throw new ApiError(errorMsg, response.status, serverError);
  }
  return response.json();
}

export async function fetchShifts(): Promise<Shift[]> {
  try {
    const res = await fetch(`${BASE_URL}/shifts`);
    return await handleResponse<Shift[]>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to the server. Please check your connection.', 0);
  }
}

export async function bookShift(id: string): Promise<Shift> {
  try {
    const res = await fetch(`${BASE_URL}/shifts/${id}/book`, {
      method: 'POST',
    });
    return await handleResponse<Shift>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Failed to book shift. Please try again.', 0);
  }
}

export async function cancelShift(id: string): Promise<Shift> {
  try {
    const res = await fetch(`${BASE_URL}/shifts/${id}/cancel`, {
      method: 'POST',
    });
    return await handleResponse<Shift>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Failed to cancel shift. Please try again.', 0);
  }
}
