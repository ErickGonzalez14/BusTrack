import { z } from "zod";
import { distanceInMeters, getRoutableDirections, normalizeCoordinate } from "./mapRouting";
import type { Stop } from "./stop.type";
import type { Coordinate, TransitRoute } from "./transport.type";

const stopSchema = z.object({
  id: z.string(),
  name: z.string(),
  coordinate: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const downloadedRouteSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1),
  name: z.string().min(1),
  downloadedAt: z.number().positive(),
  duration: z.number().positive().optional(),
  fare: z.number().nonnegative().optional(),
  directions: z.array(z.object({
    direction: z.enum(["outbound", "return"]),
    stops: z.array(stopSchema).min(2),
  })).min(1),
});

export type DownloadedRoute = z.infer<typeof downloadedRouteSchema>;
type DownloadedStop = z.infer<typeof stopSchema>;

export function buildDownloadedRoute(route: TransitRoute, stops: Stop[]): DownloadedRoute {
  const directions = getRoutableDirections(stops, [route]).flatMap(({ direction, orderedStops }) => {
    const routeStops = orderedStops.flatMap(({ id, name, adress }) => {
      const coordinate = normalizeCoordinate(adress);
      return coordinate ? [{ id, name: typeof name === "string" && name.trim() ? name.trim() : id, coordinate }] : [];
    });
    return new Set(routeStops.map((stop) => stop.id)).size >= 2
      ? [{ direction, stops: routeStops }]
      : [];
  });
  if (!directions.length) throw new Error("La ruta no tiene suficientes paradas para descargar.");

  return downloadedRouteSchema.parse({
    version: 1,
    id: route.id,
    name: typeof route.name === "string" && route.name.trim() ? route.name.trim() : route.id,
    downloadedAt: Date.now(),
    duration: Number.isFinite(route.estimatedDuration) && route.estimatedDuration > 0
      ? route.estimatedDuration : undefined,
    fare: Number.isFinite(route.fareAprox) && route.fareAprox >= 0 ? route.fareAprox : undefined,
    directions,
  });
}

export function nearestDownloadedStop(stops: DownloadedStop[], location: Coordinate) {
  let nearest: { stop: DownloadedStop; index: number; meters: number } | undefined;
  stops.forEach((stop, index) => {
    const meters = distanceInMeters(location, stop.coordinate);
    if (!nearest || meters < nearest.meters) nearest = { stop, index, meters };
  });
  return nearest;
}
