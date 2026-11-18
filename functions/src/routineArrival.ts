/* eslint-disable max-len, require-jsdoc */
import {cumulativeDistances, distance, offset, type Point, type SimulatedBus} from "../shared/simulatedFleet";
export type {Point} from "../shared/simulatedFleet";
export type Stop = Point & {id: string};
export type Direction = {
  routeId: string;
  direction: "outbound" | "return";
  stops: Stop[];
  duration: number;
};
export type TrackedBus = Point & {
  id: string;
  routeId: string;
  heading: number | null;
  speed: number | null;
};

const RADIANS = Math.PI / 180;
const MAX_STOP_DISTANCE_METERS = 1500;
const MAX_BUS_OFFSET_METERS = 300;
const WEEKDAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export function routineWindow(now: number, time: unknown, reminder: unknown, days: unknown) {
  const clock = typeof time === "string" && /^(\d{1,2}):(\d{2})$/.exec(time);
  const lead = /^(\d+)\s*(min|h)?$/i.exec(String(reminder ?? "").trim() || "5min");
  if (!clock || !lead || !Array.isArray(days)) return null;
  const [, hours, minutes] = clock;
  const leadMinutes = Number(lead[1]) * (lead[2]?.toLowerCase() === "h" ? 60 : 1);
  if (+hours > 23 || +minutes > 59 || leadMinutes <= 0 || leadMinutes > 60) return null;

  // Panamá usa UTC-5 todo el año.
  const local = new Date(now - 5 * 60 * 60_000);
  const today = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const localNow = local.getTime();
  let deadline = today + (+hours * 60 + +minutes) * 60_000;
  if (deadline < localNow) deadline += 24 * 60 * 60_000;
  const secondsLeft = (deadline - localNow) / 1000;
  const date = new Date(deadline);
  const enabled = days.some((day) => typeof day === "string" &&
    day.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === WEEKDAYS[date.getUTCDay()]);
  if (!enabled || secondsLeft > leadMinutes * 60) return null;
  return {date: date.toISOString().slice(0, 10), secondsLeft, deadline: now + secondsLeft * 1000};
}

function busProgress(bus: TrackedBus, stops: Stop[], cumulative: number[]) {
  let best: {meters: number; offset: number} | undefined;
  for (let i = 0; i < stops.length - 1; i++) {
    const segment = offset(stops[i], stops[i + 1]);
    const position = offset(stops[i], bus);
    const length = cumulative[i + 1] - cumulative[i];
    if (length <= 0) continue;
    if (bus.heading !== null) {
      const heading = bus.heading * RADIANS;
      const dot = Math.sin(heading) * segment.x + Math.cos(heading) * segment.y;
      if (dot / length < 0.5) continue;
    }
    const ratio = (position.x * segment.x + position.y * segment.y) / (length * length);
    const fraction = Math.max(0, Math.min(1, ratio));
    const gap = Math.hypot(position.x - segment.x * fraction, position.y - segment.y * fraction);
    if ((!best || gap < best.offset) && gap <= MAX_BUS_OFFSET_METERS) {
      // Let the projection extend past the termini to identify a bus that already passed.
      const progress = (i === 0 && ratio < 0) ||
        (i === stops.length - 2 && ratio > 1) ? ratio : fraction;
      best = {meters: cumulative[i] + length * progress, offset: gap};
    }
  }
  return best;
}

export function findRoutineArrival(
  origin: Point,
  destination: Point,
  directions: Direction[],
  buses: (TrackedBus | SimulatedBus)[],
  secondsLeft: number,
) {
  let best: {
    routeId: string; direction: Direction["direction"]; boardingId: string;
    dropoffId: string; busId: string; eta: number; walking: number; simulated: boolean;
  } | undefined;
  for (const {routeId, direction, stops, duration} of directions) {
    const cumulative = cumulativeDistances(stops);
    const remainingBuses = buses.filter((bus) => bus.routeId === routeId &&
      ("metersAlongRoute" in bus ? bus.direction === direction :
        bus.heading !== null || !directions.some((other) =>
          other.routeId === routeId && other.direction !== direction)));
    for (const bus of remainingBuses) {
      const simulated = "metersAlongRoute" in bus;
      const progress = simulated ?
        {meters: bus.metersAlongRoute, offset: 0} : busProgress(bus, stops, cumulative);
      const typicalSpeed = cumulative[cumulative.length - 1] / (duration * 60);
      const speed = simulated ? bus.speed :
        bus.speed !== null && bus.speed >= 2 ? bus.speed : typicalSpeed;
      if (!progress || !Number.isFinite(speed) || speed <= 0) continue;
      for (let i = 0; i < stops.length - 1; i++) {
        const walking = distance(origin, stops[i]);
        const remaining = cumulative[i] - progress.meters;
        const eta = Math.ceil(Math.max(0, remaining) / speed);
        if (walking > MAX_STOP_DISTANCE_METERS || (best && walking > best.walking) ||
            remaining < (simulated ? 0 : -40) || eta > secondsLeft ||
            (remaining <= 40 && progress.offset > 85)) continue;

        let dropoff: Stop | undefined;
        let dropoffDistance = MAX_STOP_DISTANCE_METERS;
        for (const stop of stops.slice(i + 1)) {
          const gap = distance(stop, destination);
          if (gap < dropoffDistance) {
            dropoff = stop;
            dropoffDistance = gap;
          }
        }
        if (dropoff && (!best || walking < best.walking || eta < best.eta)) {
          best = {routeId, direction, boardingId: stops[i].id, dropoffId: dropoff.id,
            busId: bus.id, eta, walking, simulated};
        }
      }
    }
  }
  return best;
}
