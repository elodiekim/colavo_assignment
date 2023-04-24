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
  //객체의 값들만을 추출해서 배열에 넣음
  for (const workHour of dayWorkHours) {
    const openInterval = workHour.open_interval as [number, number];
    const closeInterval = workHour.close_interval as [number, number];
    //배열의 첫 번째 값은 시간, 두 번째 값 분
    let currentTime = openInterval[0];
    //workHour시작시간 openInterval[0]
    while (currentTime < closeInterval[0]) {
      const endTime = Math.min(
        currentTime + serviceDuration,
        closeInterval[0] - openInterval[0]
      );
      //현재 시간에서 서비스시간만큼을 더한 값과 종료 시간 중, 더 빠른 시간
      const timeSlot = {
        begin_at: startOfDay + currentTime,
        end_at: startOfDay + endTime,
      };
      //Event와 겹치는 TimeSlot은 생성하지 않도록 isOverlap 변수를 사용하여 체크
      let isOverlap = false;

      //이벤트 목록 순회
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
      //겹치지 않을 경우, closeInterval[0]까지 반복
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
  //DayTimeTable빈 배열 생성

  const timezone = moment.tz(timezoneIdentifier);

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
  //console.log("=====================" + events);
  //days 일수만큼 반복 , 해당 일자의 시작 시간으로 지정
  for (let dayModifier = 0; dayModifier < days; dayModifier++) {
    const day = timezone.clone().add(dayModifier, "days").startOf("day");
    //isoWeekday() 1부터 7까지의 값을 반환
    const startOfDay = day.unix();
    const weekday = day.isoWeekday();
    const isDayOff = false; // 휴무일 off
    let timeSlots: TimeSlot[] = [];

    //const isDayOff = day.isoWeekday() === 6 || day.isoWeekday() === 7;
    if (!isDayOff && !isIgnoreWorkhour) {
      // 해당 요일의 근무시간 가져오기
      console.log("****************1");

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
