export interface RequestBody {
  start_day_identifier: string;
  timezone_identifier: string;
  service_duration: number;
  days?: number;
  timeslot_interval?: number;
  is_ignore_schedule?: boolean;
  is_ignore_workhour?: boolean;
}

export interface ResponseBody {
  start_of_day: number;
  day_modifier: number;
  is_day_off: boolean;
  timeslots: TimeSlot[];
}

export interface DayTimeTable extends ResponseBody {
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
  open_interval: [number, number];
  close_interval: [number, number];
  is_day_off: boolean;
  key: string;
  weekday: number;
}
