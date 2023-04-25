export interface GetTimeSlotsParams {
  startDayIdentifier: string;
  days?: number;
  serviceDuration: number;
  timeSlotInterval: number;
  isIgnoreSchedule?: boolean;
  isIgnoreWorkhour?: boolean;
  timezoneIdentifier: string;
}
export interface Response {
  start_of_day: number;
  day_modifier: number;
  is_day_off: boolean;
  timeslots: TimeSlot[];
}

export interface DayTimeTable extends Response {
  timeslots: TimeSlot[];
}
export interface TimeSlot {
  begin_at: number;
  end_at: number;
}
export interface Event {
  begin_at: number;
  end_at?: number;
  created_at: number;
  updated_at: number;
}
export interface WorkHour {
  open_interval: number;
  close_interval: number;
  is_day_off: boolean;
  key: string;
  weekday: number;
}
