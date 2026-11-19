import { routineWindow } from "@/functions/src/routineSchedule";
import { RoutineRequestSchema } from "@/src/features/routines/domain/routine.schema";

const now = Date.parse("2026-11-18T12:55:00Z");

describe("Rutinas", () => {
  test("acepta una rutina con ruta, hora, días y recordatorio", () => {
    const routine = {
      name: "Viaje al trabajo", route: "r1", time: "08:00",
      days: ["miércoles"], recordatory: "5min",
    };
    expect(RoutineRequestSchema.parse(routine)).toEqual(routine);
    expect(RoutineRequestSchema.safeParse({ ...routine, days: [] }).success).toBe(false);
  });

  test("incluye el límite de anticipación y normaliza el día seleccionado", () => {
    expect(routineWindow(now, "08:00", undefined, ["  MIÉRCOLES  "])).toEqual({
      date: "2026-11-18",
      deadline: Date.parse("2026-11-18T13:00:00Z"),
    });
    expect(routineWindow(now - 1, "08:00", "5min", ["miércoles"])).toBeNull();
  });

  test("usa el día siguiente para un viaje después de la medianoche en Panamá", () => {
    const beforeMidnight = Date.parse("2026-11-19T04:40:00Z");
    expect(routineWindow(beforeMidnight, "00:15", "1h", ["jueves"])).toEqual({
      date: "2026-11-19",
      deadline: Date.parse("2026-11-19T05:15:00Z"),
    });
    expect(routineWindow(beforeMidnight, "00:15", "1h", ["miércoles"])).toBeNull();
  });

  test.each([
    ["8 am", "5min", ["miércoles"]],
    ["24:00", "5min", ["miércoles"]],
    ["08:60", "5min", ["miércoles"]],
    ["08:00", "mañana", ["miércoles"]],
    ["08:00", "0min", ["miércoles"]],
    ["08:00", "61min", ["miércoles"]],
    ["08:00", "5min", "miércoles"],
  ])("rechaza hora %s, anticipación %s y días %j cuando algún campo es inválido",
    (time, lead, days) => expect(routineWindow(now, time, lead, days)).toBeNull(),
  );
});
