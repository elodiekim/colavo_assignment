// controller.ts
import { Request, Response } from "express";
import { getTimeSlots } from "../services/service";

export function getTimeSlotsController(req: Request, res: Response) {
  const {
    start_day_identifier,
    days,
    service_duration,
    timeslot_interval,
    is_ignore_schedule,
    is_ignore_workhour,
    timezone_identifier,
  } = req.body;
  //console.log(req.body);
  const dayTimeTables = getTimeSlots({
    startDayIdentifier: start_day_identifier,
    days,
    serviceDuration: service_duration,
    timeSlotInterval: timeslot_interval,
    isIgnoreSchedule: is_ignore_schedule,
    isIgnoreWorkhour: is_ignore_workhour,
    timezoneIdentifier: timezone_identifier,
  });

  res.json(dayTimeTables);
}
