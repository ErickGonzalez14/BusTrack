/* eslint-disable max-len, require-jsdoc */
const WEEKDAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export function routineWindow(now: number, time: unknown, reminder: unknown, days: unknown) {
  const clock = typeof time === "string" && /^(\d{1,2}):(\d{2})$/.exec(time);
  const lead = /^(\d+)\s*(min|h)?$/i.exec(String(reminder ?? "").trim() || "5min");
  if (!clock || !lead || !Array.isArray(days)) return null;
  const [, hours, minutes] = clock;
  const leadMinutes = Number(lead[1]) * (lead[2]?.toLowerCase() === "h" ? 60 : 1);
  if (+hours > 23 || +minutes > 59 || leadMinutes <= 0 || leadMinutes > 60) return null;

  // Panamá usa UTC-5 todo el año.
  const panamaOffset = 5 * 60 * 60_000;
  const local = new Date(now - panamaOffset);
  const today = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  let deadline = today + (+hours * 60 + +minutes) * 60_000;
  if (deadline < local.getTime()) deadline += 24 * 60 * 60_000;
  const date = new Date(deadline);
  const enabled = days.some((day) => typeof day === "string" &&
    day.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === WEEKDAYS[date.getUTCDay()]);
  if (!enabled || deadline - local.getTime() > leadMinutes * 60_000) return null;
  return {date: date.toISOString().slice(0, 10), deadline: deadline + panamaOffset};
}
