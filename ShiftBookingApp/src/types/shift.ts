export type City = 'Helsinki' | 'Tampere' | 'Turku';
export type Area = City;

export interface Shift {
  id: string;
  area: City | string;
  booked: boolean;
  startTime: number;
  endTime: number;
}

export type ActionStatus = 'idle' | 'booking' | 'cancelling';

export interface ShiftWithStatus extends Shift {
  isStarted: boolean;
  isFinished: boolean;
  isOverlapping: boolean;
  pendingStatus?: ActionStatus;
}

export interface ShiftSection {
  title: string;
  shiftCount: number;
  totalHours: number;
  data: ShiftWithStatus[];
}
