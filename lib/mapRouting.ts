import {
  Bus,
  Coordinate,
  RouteDirection,
  RouteRecommendation,
  TransitRoute,
} from "@/interfaces/transport.type";
import { Stop } from "@/interfaces/stop.type";
import type { WalkingDistances } from "@/Services/walkingRoute.service";

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function normalizeCoordinate(value: unknown): Coordinate | null {
  if (!value || typeof value !== "object") return null;

  const rawCoordinate = value as {
    latitude?: unknown;
    longitude?: unknown;
    _latitude?: unknown;
    _longitude?: unknown;
  };
  const latitude = Number(rawCoordinate.latitude ?? rawCoordinate._latitude);
  const longitude = Number(rawCoordinate.longitude ?? rawCoordinate._longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function isValidCoordinate(value: unknown): value is Coordinate {
  return normalizeCoordinate(value) !== null;
}

export function distanceInMeters(from: Coordinate, to: Coordinate) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function destinationProjectionOnSegment(
  destination: Coordinate,
  segmentStart: Coordinate,
  segmentEnd: Coordinate,
) {
  const longitudeScale = Math.cos(toRadians(destination.latitude));
  const startX =
    toRadians(segmentStart.longitude - destination.longitude) *
    EARTH_RADIUS_METERS *
    longitudeScale;
  const startY =
    toRadians(segmentStart.latitude - destination.latitude) *
    EARTH_RADIUS_METERS;
  const endX =
    toRadians(segmentEnd.longitude - destination.longitude) *
    EARTH_RADIUS_METERS *
    longitudeScale;
  const endY =
    toRadians(segmentEnd.latitude - destination.latitude) *
    EARTH_RADIUS_METERS;
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const squaredLength = segmentX ** 2 + segmentY ** 2;
  const progress =
    squaredLength === 0
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            -(startX * segmentX + startY * segmentY) / squaredLength,
          ),
        );
  const projectedX = startX + segmentX * progress;
  const projectedY = startY + segmentY * progress;

  return {
    progress,
    distance: Math.sqrt(projectedX ** 2 + projectedY ** 2),
  };
}

function getCorridorDropoffIndex(
  orderedStops: Stop[],
  boardingIndex: number,
  destination: Coordinate,
) {
  let closestSegmentIndex = boardingIndex;
  let closestSegmentProgress = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (
    let segmentIndex = boardingIndex;
    segmentIndex < orderedStops.length - 1;
    segmentIndex += 1
  ) {
    const projection = destinationProjectionOnSegment(
      destination,
      orderedStops[segmentIndex].adress,
      orderedStops[segmentIndex + 1].adress,
    );
    if (projection.distance >= closestDistance) continue;

    closestDistance = projection.distance;
    closestSegmentIndex = segmentIndex;
    closestSegmentProgress = projection.progress;
  }

  const destinationIsAtSegmentStart = closestSegmentProgress <= 0.1;
  return destinationIsAtSegmentStart
    ? Math.max(boardingIndex + 1, closestSegmentIndex)
    : closestSegmentIndex + 1;
}

export function getRoutableDirections(stops: Stop[], routes: TransitRoute[]) {
  const stopsById = new Map(
    stops.filter((stop) => stop.active !== false).map((stop) => [stop.id.trim(), stop]),
  );
  return routes.filter((route) => route.active).flatMap((route) => {
    const directions: { direction: RouteDirection; stopIds: string[] }[] = [
      { direction: "outbound", stopIds: route.routeOutboundId },
      { direction: "return", stopIds: route.routeReturnID },
    ];
    return directions.flatMap(({ direction, stopIds }) => {
      const orderedStops = stopIds.flatMap((id) => {
        const stop = stopsById.get(id.trim());
        return stop ? [stop] : [];
      });
      return new Set(orderedStops).size >= 2 ? [{ route, direction, orderedStops }] : [];
    });
  });
}

export function findBestRoute(
  directions: ReturnType<typeof getRoutableDirections>,
  buses: Bus[],
  destination: Coordinate,
  walkingDistances: WalkingDistances,
): RouteRecommendation | null {
  let best: RouteRecommendation | null = null;
  let bestTotalWalkingDistance = Number.POSITIVE_INFINITY;
  let bestRideMinutes = Number.POSITIVE_INFINITY;
  let bestFollowsRouteProgress = false;

  for (const { route, direction, orderedStops } of directions) {
    const bus = buses.find(
      (candidate) =>
        candidate.active !== false &&
        candidate.busStatus !== "pending" &&
        candidate.busStatus !== "rejected" &&
        candidate.routeId.trim() === route.id.trim(),
    ) ?? null;

    for (let boardingIndex = 0; boardingIndex < orderedStops.length - 1; boardingIndex += 1) {
      const boardingStop = orderedStops[boardingIndex];
      const boardingDistance = walkingDistances.fromUser.get(
        boardingStop.id.trim(),
      );
      if (boardingDistance === undefined) continue;
      const corridorDropoffIndex = getCorridorDropoffIndex(
        orderedStops,
        boardingIndex,
        destination,
      );

      for (
        let destinationIndex = boardingIndex + 1;
        destinationIndex < orderedStops.length;
        destinationIndex += 1
      ) {
        const destinationStop = orderedStops[destinationIndex];
        if (destinationStop === boardingStop) continue;
        const destinationDistance = walkingDistances.toDestination.get(
          destinationStop.id.trim(),
        );
        if (destinationDistance === undefined) continue;

        const coveredSegments = destinationIndex - boardingIndex;
        const totalSegments = orderedStops.length - 1;
        const estimatedRideMinutes = Number.isFinite(route.estimatedDuration) && route.estimatedDuration > 0
          ? Math.max(1, Math.round(route.estimatedDuration * coveredSegments / totalSegments))
          : null;
        const rideMinutesForRanking = estimatedRideMinutes ?? Number.POSITIVE_INFINITY;
        const totalWalkingDistance =
          boardingDistance + destinationDistance;
        const walkingIsShorter =
          totalWalkingDistance < bestTotalWalkingDistance - 25;
        const walkingIsEquivalent =
          Math.abs(totalWalkingDistance - bestTotalWalkingDistance) <= 25;
        const followsRouteProgress =
          destinationIndex === corridorDropoffIndex;
        const routeProgressIsBetter =
          followsRouteProgress && !bestFollowsRouteProgress;
        const routeProgressIsEquivalent =
          followsRouteProgress === bestFollowsRouteProgress;

        if (
          !routeProgressIsBetter &&
          (!routeProgressIsEquivalent ||
            (!walkingIsShorter &&
              !(
                walkingIsEquivalent && rideMinutesForRanking < bestRideMinutes
              )))
        ) {
          continue;
        }

        bestFollowsRouteProgress = followsRouteProgress;
        bestTotalWalkingDistance = totalWalkingDistance;
        bestRideMinutes = rideMinutesForRanking;
        best = {
          route,
          direction,
          bus,
          orderedStops,
          boardingStop,
          destinationStop,
          boardingIndex,
          destinationIndex,
          walkingDistanceMeters: boardingDistance,
          destinationDistanceMeters: destinationDistance,
          estimatedRideMinutes,
        };
      }
    }
  }

  return best;
}

export function buildSimulationPath(
  coordinates: Coordinate[],
  totalSteps = 100,
): Coordinate[] {
  if (coordinates.length < 2) return coordinates;

  const segmentDistances = coordinates.slice(0, -1).map((coordinate, index) =>
    distanceInMeters(coordinate, coordinates[index + 1]),
  );
  const totalDistance = segmentDistances.reduce((sum, distance) => sum + distance, 0);

  const cumulativeDistances = segmentDistances.reduce(
    (distances, distance) => [...distances, distances.at(-1)! + distance],
    [0],
  );

  return Array.from({ length: totalSteps + 1 }, (_, step) => {
    const targetDistance = (totalDistance * step) / totalSteps;
    const segmentIndex = Math.min(
      segmentDistances.length - 1,
      cumulativeDistances.findIndex(
        (distance, index) =>
          index > 0 && distance >= targetDistance,
      ) - 1,
    );
    const safeSegmentIndex = Math.max(0, segmentIndex);
    const coordinate = coordinates[safeSegmentIndex];
    const next = coordinates[safeSegmentIndex + 1];
    const segmentStart = cumulativeDistances[safeSegmentIndex];
    const segmentDistance = Math.max(segmentDistances[safeSegmentIndex], 1);
    const progress = Math.min(
      1,
      Math.max(0, (targetDistance - segmentStart) / segmentDistance),
    );

    return {
      latitude:
        coordinate.latitude + (next.latitude - coordinate.latitude) * progress,
      longitude:
        coordinate.longitude + (next.longitude - coordinate.longitude) * progress,
    };
  });
}

export function getRemainingRouteCoordinates(
  coordinates: Coordinate[],
  progress: number,
): Coordinate[] {
  if (coordinates.length < 2) return coordinates;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  if (clampedProgress === 0) return coordinates;
  if (clampedProgress === 1) return [];

  const segmentDistances = coordinates.slice(0, -1).map((coordinate, index) =>
    distanceInMeters(coordinate, coordinates[index + 1]),
  );
  const totalDistance = segmentDistances.reduce(
    (sum, distance) => sum + distance,
    0,
  );
  if (totalDistance === 0) return [];

  const traveledDistance = totalDistance * clampedProgress;
  let accumulatedDistance = 0;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segmentDistance = segmentDistances[index];
    const segmentEndDistance = accumulatedDistance + segmentDistance;
    if (segmentEndDistance < traveledDistance) {
      accumulatedDistance = segmentEndDistance;
      continue;
    }

    const segmentProgress =
      segmentDistance === 0
        ? 1
        : (traveledDistance - accumulatedDistance) / segmentDistance;
    const start = coordinates[index];
    const end = coordinates[index + 1];
    const currentCoordinate = {
      latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
      longitude:
        start.longitude + (end.longitude - start.longitude) * segmentProgress,
    };

    return [currentCoordinate, ...coordinates.slice(index + 1)];
  }

  return [];
}
