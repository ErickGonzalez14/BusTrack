import { Coordinate, RouteRecommendation } from "@/interfaces/transport.type";
import { getRoadRoute } from "@/Services/roadRoute.service";
import { useEffect, useState } from "react";

const routeCache = new Map<string, Coordinate[]>();

function routeKey(route: RouteRecommendation) {
  return `${route.route.id}:${route.direction}:${route.orderedStops
    .map((stop) => stop.id)
    .join(",")}`;
}

export function useRoadRoute(route: RouteRecommendation | null) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!route) {
      setCoordinates([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const key = routeKey(route);
    const cachedCoordinates = routeCache.get(key);
    if (cachedCoordinates) {
      setCoordinates(cachedCoordinates);
      setIsLoading(false);
      setError(null);
      return;
    }

    setCoordinates([]);
    setIsLoading(true);
    setError(null);
    void getRoadRoute(route.orderedStops.map((stop) => stop.adress))
      .then((roadCoordinates) => {
        if (!active) return;
        if (roadCoordinates.length < 2) {
          throw new Error("No se encontró un recorrido válido por carretera.");
        }
        routeCache.set(key, roadCoordinates);
        setCoordinates(roadCoordinates);
      })
      .catch((routeError) => {
        if (active) setError((routeError as Error).message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [route]);

  return { coordinates, isLoading, error };
}
