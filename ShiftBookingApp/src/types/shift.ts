/**
 * Core type definitions for the Shift Booking App.
 */

export interface Shift {
  id: string;
  area: string;
  booked: boolean;
  startTime: number;
  endTime: number;
}

export type Area = 'Helsinki' | 'Tampere' | 'Turku';

/** A section used by React Native's SectionList to render grouped shifts. */
export interface ShiftSection {
  title: string;
  data: Shift[];
}
