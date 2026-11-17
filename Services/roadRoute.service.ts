import { Coordinate } from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import Constants from "expo-constants";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";
const MAX_COORDINATES_PER_REQUEST = 27;

const getApiKey = () => {
  const apiKey = Constants.expoConfig?.extra?.googleRoutesApiKey;
  if (typeof apiKey !== "string" || !apiKey) {
    throw new Error("La clave de Google Routes no está configurada.");
  }
  return apiKey;
};

function waypoint(coordinate: Coordinate) {
  return {
    location: { latLng: coordinate },
  };
}

export async function getRoadTripEstimate(origin: Coordinate, destination: Coordinate) {
  const response = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: waypoint(origin),
      destination: waypoint(destination),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
      languageCode: "es",
      units: "METRIC",
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message || "No se pudo calcular el trip por carretera.");
  }
  const body = (await response.json()) as { routes?: { distanceMeters?: number; duration?: string }[] };
  const route = body.routes?.[0];
  const seconds = Number(route?.duration?.replace(/s$/, ""));
  if (!route?.distanceMeters || !Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Google Routes no devolvió distancia y duración para estos lugares.");
  }
  return {
    distanceKm: Math.max(0.1, Math.round(route.distanceMeters / 100) / 10),
    durationMinutes: Math.max(1, Math.ceil(seconds / 60)),
  };
}

function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let latitude = 0;
  let longitude = 0;
  let index = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    const coordinate = normalizeCoordinate({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
    if (coordinate) coordinates.push(coordinate);
  }

  return coordinates;
}

async function requestRoadSegment(coordinates: Coordinate[]) {
  const response = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: waypoint(coordinates[0]),
      destination: waypoint(coordinates.at(-1)!),
      intermediates: coordinates
        .slice(1, -1)
        .map((coordinate) => waypoint(coordinate)),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
      optimizeWaypointOrder: false,
      polylineQuality: "HIGH_QUALITY",
      polylineEncoding: "ENCODED_POLYLINE",
      languageCode: "es",
      units: "METRIC",
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      body?.error?.message || "No se pudo calcular el recorrido por carretera.",
    );
  }

  const body = (await response.json()) as {
    routes?: { polyline?: { encodedPolyline?: string } }[];
  };
  const encodedPolyline = body.routes?.[0]?.polyline?.encodedPolyline;
  if (!encodedPolyline) {
    throw new Error("Google Routes no devolvió un recorrido por carretera.");
  }

  return decodePolyline(encodedPolyline);
}

export async function getRoadRoute(coordinates: Coordinate[]) {
  const validCoordinates = coordinates
    .map(normalizeCoordinate)
    .filter((coordinate): coordinate is Coordinate => coordinate !== null);
  if (validCoordinates.length < 2) return [];

  const route: Coordinate[] = [];
  for (
    let start = 0;
    start < validCoordinates.length - 1;
    start += MAX_COORDINATES_PER_REQUEST - 1
  ) {
    const segment = validCoordinates.slice(
      start,
      start + MAX_COORDINATES_PER_REQUEST,
    );
    const roadSegment = await requestRoadSegment(segment);
    route.push(...(route.length ? roadSegment.slice(1) : roadSegment));
  }

  return route;
}
