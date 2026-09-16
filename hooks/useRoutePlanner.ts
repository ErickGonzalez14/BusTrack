import {
  Bus,
  Coordinate,
  GooglePlace,
  RouteRecommendation,
  TransitRoute,
} from "@/interfaces/transport.type";
import { Stop } from "@/interfaces/stop.type";
import { findBestRoute } from "@/lib/mapRouting";
import { getStopWalkingDistances } from "@/Services/walkingRoute.service";
import { useCallback, useEffect, useState } from "react";

type UseRoutePlannerOptions = {
  stops: Stop[];
  routes: TransitRoute[];
  buses: Bus[];
  selectedPlace: GooglePlace | null;
  getUserLocation: () => Promise<Coordinate>;
  onRouteFound: (
    recommendation: RouteRecommendation,
    userLocation: Coordinate,
  ) => void;
};

export function useRoutePlanner({
  stops,
  routes,
  buses,
  selectedPlace,
  getUserLocation,
  onRouteFound,
}: UseRoutePlannerOptions) {
  const [recommendation, setRecommendation] =
    useState<RouteRecommendation | null>(null);
  const [isFindingRoute, setIsFindingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecommendation(null);
    setError(null);
  }, [selectedPlace?.id]);

  const findRouteToPlace = useCallback(async () => {
    if (!selectedPlace) return;
    setError(null);
    setIsFindingRoute(true);

    try {
      const currentPosition = await getUserLocation();
      const activeRouteIds = new Set(
        buses
          .filter((bus) => bus.active)
          .map((bus) => bus.routeId.trim()),
      );
      const activeStopIds = new Set(
        routes
          .filter(
            (route) => route.active && activeRouteIds.has(route.id.trim()),
          )
          .flatMap((route) => [
            ...route.routeOutboundId,
            ...route.routeReturnID,
          ]),
      );
      const candidateStops = stops.filter((stop) =>
        activeStopIds.has(stop.id.trim()),
      );

      if (candidateStops.length < 2) {
        throw new Error("No hay suficientes paradas activas para calcular la ruta.");
      }

      const walkingDistances = await getStopWalkingDistances(
        currentPosition,
        selectedPlace.coordinate,
        candidateStops,
      );
      const result = findBestRoute(
        stops,
        routes,
        buses,
        selectedPlace.coordinate,
        walkingDistances,
      );

      if (!result) {
        throw new Error(
          "No encontramos una ruta con paradas a las que puedas llegar caminando por calles o cruces válidos.",
        );
      }

      setRecommendation(result);
      onRouteFound(result, currentPosition);
    } catch (routeError) {
      setError((routeError as Error).message);
    } finally {
      setIsFindingRoute(false);
    }
  }, [buses, getUserLocation, onRouteFound, routes, selectedPlace, stops]);

  return {
    recommendation,
    setRecommendation,
    isFindingRoute,
    error,
    findRouteToPlace,
  };
}
