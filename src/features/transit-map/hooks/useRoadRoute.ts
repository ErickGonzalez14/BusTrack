import { Coordinate, RouteRecommendation } from "@/src/features/transit-map/domain/transport.type";
import { getRoadRouteLegs } from "@/src/features/transit-map/data/roadRoute.service";
import { useEffect, useState } from "react";

type RoadPath = { coordinates: Coordinate[]; legs: Coordinate[][] };
const routeCache = new Map<string, RoadPath>();

function routeKey(route: RouteRecommendation) {
  return `${route.route.id}:${route.direction}:${route.orderedStops
    .map(({ id, adress }) => `${id}:${adress.latitude}:${adress.longitude}`)
    .join(",")}`;
}

export function useRoadRoute(route: RouteRecommendation | null) {
  const key = route ? routeKey(route) : null;
  const [failedKey, setFailedKey] = useState<{ key: string; error: string } | null>(null);
  const [loadedPath, setLoadedPath] = useState<{ key: string; path: RoadPath } | null>(null);
  const path = loadedPath && loadedPath.key === key
    ? loadedPath.path
    : key ? routeCache.get(key) : undefined;
  const error = failedKey && failedKey.key === key ? failedKey.error : null;

  useEffect(() => {
    if (!route || !key || routeCache.has(key)) return;
    let active = true;

    setFailedKey(null);
    void getRoadRouteLegs(route.orderedStops.map((stop) => stop.adress))
      .then((legs) => {
        if (!active) return;
        if (!legs.length) {
          throw new Error("No se encontró un recorrido válido por carretera.");
        }
        const coordinates = legs.flatMap((leg, index) => index ? leg.slice(1) : leg);
        const path = { coordinates, legs };
        routeCache.set(key, path);
        setLoadedPath({ key, path });
      })
      .catch((routeError) => {
        if (active) setFailedKey({ key, error: (routeError as Error).message });
      });

    return () => {
      active = false;
    };
  }, [key, route]);

  return { coordinates: path?.coordinates ?? [], legs: path?.legs, isLoading: !!key && !path && !error, error };
}
