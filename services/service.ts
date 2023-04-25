//service.ts
import moment from "moment-timezone";
import {
  WorkHour,
  Event,
  DayTimeTable,
  TimeSlot,
  GetTimeSlotsParams,
} from "../interface/interfaces";
import fs from "fs";

//workHours 업무 시간을 나타내는 객체들로 이루어진 배열
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
  // time slot 생성에 사용할 변수
  let openInterval: number;
  let closeInterval: number;
  let currentTime: number;

  // 각 일자의 근무 시간을 가져와서 타임슬롯 생성
  if (dayWorkHours.length > 0) {
    openInterval = dayWorkHours[0].open_interval as number;
    closeInterval = dayWorkHours[0].close_interval as number;
    currentTime = dayWorkHours[0].open_interval as number;

    //현재 시간에서 서비스시간만큼을 더한 값과 종료 시간 중, 더 빠른 시간
    while (currentTime < closeInterval) {
      const endTime = Math.min(currentTime + serviceDuration, closeInterval);
      const timeSlot = {
        begin_at: startOfDay + currentTime,
        end_at: startOfDay + endTime,
      };
      let isOverlap = false;

      for (const event of events) {
        const eventStartTime = event.begin_at;
        const eventEndTime = event.end_at;
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
  days,
  serviceDuration,
  timeSlotInterval,
  isIgnoreWorkhour = false,
  timezoneIdentifier,
}: GetTimeSlotsParams): DayTimeTable[] {
  const dayTimeTables: DayTimeTable[] = [];
  //DayTimeTable빈 배열 생성

  //const timezone = moment.tz(timezoneIdentifier);
  const timezone = moment.tz(timezoneIdentifier).valueOf();
  //console.log(timezone.format());

  // workhours.json event.json 파일 읽기
  const workHours: { [key: string]: WorkHour } = {};
  JSON.parse(fs.readFileSync("./json/workhours.json", "utf-8")).forEach(
    (workHour: WorkHour) => {
      workHours[workHour.key] = workHour;
    }
  );

  const events: Event[] = JSON.parse(
    fs.readFileSync("./json/events.json", "utf-8")
  );
  //days 일수만큼 반복 , 해당 일자의 시작 시간으로 지정
  for (let dayModifier = 0; dayModifier < days; dayModifier++) {
    const day = moment(startDayIdentifier, "YYYY-MM-DD")
      .add(dayModifier, "days")
      .tz(timezoneIdentifier);
    //isoWeekday() 1부터 7까지의 값을 반환
    const startOfDay = day.unix();
    console.log("startofDay: " + startOfDay);

    //const weekday = day.isoWeekday();
    const weekday = day.day();
    const isDayOff = false; // 휴무일 off
    let timeSlots: TimeSlot[] = [];

    if (!isDayOff && !isIgnoreWorkhour) {
      // 해당 요일의 근무시간 가져오기
      //console.log("****************1");

      timeSlots = generateTimeSlots(
        startOfDay,
        workHours,
        events,
        serviceDuration,
        timeSlotInterval,
        weekday
      );
    }
    console.log(timeSlots);
    dayTimeTables.push({
      start_of_day: startOfDay,
      day_modifier: dayModifier,
      is_day_off: isDayOff,
      timeslots: timeSlots,
    });
  }

  return dayTimeTables;
}
