import { Coordinate } from "@/src/features/transit-map/domain/transport.type";
import { Stop } from "@/src/features/transit-map/domain/stop.type";
import Constants from "expo-constants";

const ROUTE_MATRIX_API_URL =
  "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
const MAX_MATRIX_ELEMENTS = 625;

type RouteMatrixElement = {
  originIndex?: number;
  destinationIndex?: number;
  distanceMeters?: number;
  condition?: "ROUTE_EXISTS" | "ROUTE_NOT_FOUND";
  status?: { code?: number; message?: string };
};

export type WalkingDistances = {
  fromUser: ReadonlyMap<string, number>;
  toDestination: ReadonlyMap<string, number>;
};

const getApiKey = () => {
  const apiKey = Constants.expoConfig?.extra?.googleRoutesApiKey;
  if (typeof apiKey !== "string" || !apiKey) {
    throw new Error("La clave de Google Routes no está configurada.");
  }
  return apiKey;
};

const matrixWaypoint = (coordinate: Coordinate) => ({
  waypoint: { location: { latLng: coordinate } },
});

async function requestWalkingMatrix(
  origins: Coordinate[],
  destinations: Coordinate[],
) {
  const response = await fetch(ROUTE_MATRIX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask":
        "originIndex,destinationIndex,status,condition,distanceMeters",
    },
    body: JSON.stringify({
      origins: origins.map(matrixWaypoint),
      destinations: destinations.map(matrixWaypoint),
      travelMode: "WALK",
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      body?.error?.message ||
        "No se pudieron calcular los accesos peatonales a las paradas.",
    );
  }

  return (await response.json()) as RouteMatrixElement[];
}

function hasWalkingRoute(element: RouteMatrixElement) {
  return (
    element.condition === "ROUTE_EXISTS" &&
    (element.status?.code === undefined || element.status.code === 0) &&
    typeof element.distanceMeters === "number"
  );
}

export async function getStopWalkingDistances(
  userLocation: Coordinate,
  destination: Coordinate,
  stops: Stop[],
): Promise<WalkingDistances> {
  const fromUser = new Map<string, number>();
  const toDestination = new Map<string, number>();

  for (let start = 0; start < stops.length; start += MAX_MATRIX_ELEMENTS) {
    const stopGroup = stops.slice(start, start + MAX_MATRIX_ELEMENTS);
    const [boardingResults, destinationResults] = await Promise.all([
      requestWalkingMatrix(
        [userLocation],
        stopGroup.map((stop) => stop.adress),
      ),
      requestWalkingMatrix(
        stopGroup.map((stop) => stop.adress),
        [destination],
      ),
    ]);

    for (const element of boardingResults) {
      if (!hasWalkingRoute(element)) continue;
      const stop = stopGroup[element.destinationIndex ?? 0];
      if (stop) fromUser.set(stop.id.trim(), element.distanceMeters!);
    }

    for (const element of destinationResults) {
      if (!hasWalkingRoute(element)) continue;
      const stop = stopGroup[element.originIndex ?? 0];
      if (stop) toDestination.set(stop.id.trim(), element.distanceMeters!);
    }
  }

  return { fromUser, toDestination };
}
