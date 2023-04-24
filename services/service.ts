//service.ts
import moment from "moment-timezone";
import {
  WorkHour,
  Event,
  DayTimeTable,
  TimeSlot,
} from "../interface/interfaces";
import fs from "fs";

interface GetTimeSlotsParams {
  startDayIdentifier: string;
  days?: number;
  serviceDuration: number;
  timeSlotInterval: number;
  isIgnoreSchedule?: boolean;
  isIgnoreWorkhour?: boolean;
  timezoneIdentifier: string;
}
function generateTimeSlots(
  startOfDay: number,
  workHours: { [key: string]: WorkHour },
  events: Event[],
  serviceDuration: number,
  timeSlotInterval: number,
  weekday: number
): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];

  const dayWorkHours = Object.values(workHours).filter(
    (workHour) => workHour.weekday === weekday
  );

  for (const workHour of dayWorkHours) {
    const openInterval = workHour.open_interval as [number, number];
    const closeInterval = workHour.close_interval as [number, number];

    let currentTime = openInterval[0];

    while (currentTime < closeInterval[0]) {
      const endTime = Math.min(
        currentTime + serviceDuration,
        closeInterval[0] - openInterval[0]
      );

      const timeSlot = {
        begin_at: startOfDay + currentTime,
        end_at: startOfDay + endTime,
      };

      let isOverlap = false;

      for (const event of events) {
        const eventStartTime = event.begin_at;
        const eventEndTime = event.end_at || eventStartTime + 3600; //1시간
        const timeSlotStartTime = timeSlot.begin_at;
        const timeSlotEndTime = timeSlot.end_at;

        if (
          eventStartTime < timeSlotEndTime &&
          eventEndTime > timeSlotStartTime
        ) {
          isOverlap = true;
          break;
        }
      }

      if (!isOverlap) {
        timeSlots.push(timeSlot);
      }
      currentTime += timeSlotInterval;
    }
  }

  return timeSlots;
}
export function getTimeSlots({
  startDayIdentifier,
  days = 1,
  serviceDuration,
  timeSlotInterval,
  isIgnoreSchedule = false,
  isIgnoreWorkhour = false,
  timezoneIdentifier,
}: GetTimeSlotsParams): DayTimeTable[] {
  const dayTimeTables: DayTimeTable[] = [];

  const timezone = moment.tz(timezoneIdentifier);

  // Read workhours.json and parse it as an array of WorkHour objects
  const workHours: { [key: string]: WorkHour } = {};

  JSON.parse(fs.readFileSync("./json/workhours.json", "utf-8")).forEach(
    (workHour: WorkHour) => {
      workHours[workHour.key] = workHour;
    }
  );
  console.log("@@@@@@@@@@@@@" + workHours);
  // Read events.json and parse it as an array of Event objects
  const events: Event[] = JSON.parse(
    fs.readFileSync("./json/events.json", "utf-8")
  );
  //console.log("=====================" + events);
  for (let dayModifier = 0; dayModifier < days; dayModifier++) {
    //const startOfDay = startDayIdentifier + dayModifier * 24 * 60 * 60;
    //const day = moment.unix(startOfDay).tz(timezoneIdentifier);
    const day = timezone.clone().add(dayModifier, "days").startOf("day");

    const startOfDay = day.unix();
    const weekday = day.isoWeekday();
    const isDayOff = false; // TODO: Implement a way to check if it's a day off
    let timeSlots: TimeSlot[] = [];

    //const isDayOff = day.isoWeekday() === 6 || day.isoWeekday() === 7;
    if (!isDayOff && !isIgnoreWorkhour) {
      // 해당 요일의 근무시간 가져오기
      console.log("****************1");
      const dayWorkHours = Object.values(workHours).filter((workHour) => {
        return workHour.weekday === weekday;
      });

      timeSlots = generateTimeSlots(
        startOfDay,
        workHours,
        events,
        serviceDuration,
        timeSlotInterval,
        weekday
      );
    }

    dayTimeTables.push({
      start_of_day: day.unix(),
      day_modifier: dayModifier,
      is_day_off: isDayOff,
      timeslots: timeSlots,
    });
  }

  return dayTimeTables;
}
