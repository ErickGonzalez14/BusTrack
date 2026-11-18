import { cumulativeDistances } from "@/functions/shared/simulatedFleet";
import type { Coordinate, RouteRecommendation } from "./transport.type";

export const SIMULATION_TICK_MS = 250;
const APPROACH_STEPS = 8_000 / SIMULATION_TICK_MS;
const RIDE_STEPS = 15_000 / SIMULATION_TICK_MS;

export function interpolatePosition(from: Coordinate, to: Coordinate, fraction: number) {
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * fraction,
    longitude: from.longitude + (to.longitude - from.longitude) * fraction,
  };
}

function samplePath(coordinates: Coordinate[], steps: number) {
  const origin = coordinates[0];
  const destination = coordinates[coordinates.length - 1];
  if (coordinates.length === 1) return [origin];

  const distances = cumulativeDistances(coordinates);
  const total = distances[distances.length - 1];
  if (!total) return [origin, destination];

  let endIndex = 1;
  const samples = [origin];
  for (let step = 1; step < steps; step++) {
    const target = total * step / steps;
    while (distances[endIndex] < target) endIndex++;
    const startDistance = distances[endIndex - 1];
    samples.push(interpolatePosition(
      coordinates[endIndex - 1],
      coordinates[endIndex],
      (target - startDistance) / (distances[endIndex] - startDistance),
    ));
  }
  return [...samples, destination];
}

export function buildJourneySimulation(route: RouteRecommendation, roadLegs?: Coordinate[][]) {
  const pathBetween = (start: number, end: number) => {
    if (!roadLegs || start === end) {
      return route.orderedStops.slice(start, end + 1).map((stop) => stop.adress);
    }
    return roadLegs.slice(start, end).flatMap((leg, index) => index ? leg.slice(1) : leg);
  };

  return {
    approach: samplePath(pathBetween(0, route.boardingIndex), APPROACH_STEPS),
    ride: samplePath(pathBetween(route.boardingIndex, route.destinationIndex), RIDE_STEPS),
  };
}
