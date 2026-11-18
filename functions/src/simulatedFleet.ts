/* eslint-disable require-jsdoc */
// Kept in the Functions source tree so Firebase packages the same fleet
// calculation that Expo imports for the map.
export type Point = {latitude: number; longitude: number};
export type DirectionName = "outbound" | "return";
export type FleetDirection = {
  routeId: string;
  direction: DirectionName;
  stops: Point[];
  duration: number;
};
export type SimulatedBus = Point & {
  id: string;
  routeId: string;
  number: number;
  direction: DirectionName;
  metersAlongRoute: number;
  speed: number;
};

const BUSES_PER_ROUTE = 5;
const DEFAULT_SPEED_METERS_PER_SECOND = 30 / 3.6;
const RADIANS = Math.PI / 180;
const METERS_PER_DEGREE = 111195;

export function offset(from: Point, to: Point) {
  const longitudeScale = Math.cos(from.latitude * RADIANS);
  return {
    x: (to.longitude - from.longitude) * METERS_PER_DEGREE * longitudeScale,
    y: (to.latitude - from.latitude) * METERS_PER_DEGREE,
  };
}

export function distance(from: Point, to: Point) {
  const {x, y} = offset(from, to);
  return Math.hypot(x, y);
}

export function cumulativeDistances(stops: Point[]) {
  const meters = [0];
  for (let i = 1; i < stops.length; i++) {
    meters.push(meters[i - 1] + distance(stops[i - 1], stops[i]));
  }
  return meters;
}

function seededFraction(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  return ((hash ^ (hash >>> 13)) >>> 0) / 0x100000000;
}

export function simulateFleet(directions: FleetDirection[], now: number) {
  type Leg = {
    plan: FleetDirection;
    meters: number[];
    seconds: number;
    speed: number;
  };
  const routes = new Map<string, Leg[]>();
  for (const plan of directions) {
    const meters = cumulativeDistances(plan.stops);
    const length = meters[meters.length - 1];
    if (length <= 0) continue;
    const seconds = Number.isFinite(plan.duration) && plan.duration > 0 ?
      plan.duration * 60 : length / DEFAULT_SPEED_METERS_PER_SECOND;
    const legs = routes.get(plan.routeId) ?? [];
    legs.push({plan, meters, seconds, speed: length / seconds});
    routes.set(plan.routeId, legs);
  }

  const buses: SimulatedBus[] = [];
  for (const [routeId, legs] of routes) {
    legs.sort((a, b) => a.plan.direction.localeCompare(b.plan.direction));
    const cycle = legs.reduce((total, leg) => total + leg.seconds, 0);
    for (let number = 1; number <= BUSES_PER_ROUTE; number++) {
      const fraction = (number - 1 + seededFraction(`${routeId}:${number}`)) /
        BUSES_PER_ROUTE;
      let elapsed = ((now / 1000) % cycle + fraction * cycle) % cycle;
      let legIndex = 0;
      while (legIndex < legs.length - 1 && elapsed >= legs[legIndex].seconds) {
        elapsed -= legs[legIndex].seconds;
        legIndex++;
      }
      const {plan, meters, speed} = legs[legIndex];
      const routeLength = meters[meters.length - 1];
      const metersAlongRoute = Math.min(elapsed * speed, routeLength);
      const endIndex = meters.findIndex((value, i) =>
        i > 0 && value >= metersAlongRoute && value > meters[i - 1]);
      const start = plan.stops[endIndex - 1];
      const end = plan.stops[endIndex];
      const ratio = (metersAlongRoute - meters[endIndex - 1]) /
        (meters[endIndex] - meters[endIndex - 1]);
      buses.push({
        id: `simulated:${encodeURIComponent(routeId)}:${number}`,
        routeId,
        number,
        direction: plan.direction,
        speed,
        metersAlongRoute,
        latitude: start.latitude + (end.latitude - start.latitude) * ratio,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio,
      });
    }
  }
  return buses;
}
