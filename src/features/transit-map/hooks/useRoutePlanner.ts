import {
  Bus,
  Coordinate,
  GooglePlace,
  RouteRecommendation,
  TransitRoute,
} from "@/src/features/transit-map/domain/transport.type";
import { Stop } from "@/src/features/transit-map/domain/stop.type";
import { findBestRoute, getRoutableDirections } from "@/src/features/transit-map/domain/mapRouting";
import { getStopWalkingDistances } from "@/src/features/transit-map/data/walkingRoute.service";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [result, setResult] =
    useState<{ place: GooglePlace; recommendation: RouteRecommendation } | null>(null);
  const [isFindingRoute, setIsFindingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRevision = useRef(0);
  const clearRecommendation = useCallback(() => {
    requestRevision.current++;
    setResult(null);
    setError(null);
    setIsFindingRoute(false);
  }, []);

  useEffect(() => {
    clearRecommendation();
  }, [selectedPlace, clearRecommendation]);

  const findRouteToPlace = useCallback(async () => {
    if (!selectedPlace) return;
    const request = ++requestRevision.current;
    setError(null);
    setIsFindingRoute(true);

    try {
      const currentPosition = await getUserLocation();
      if (request !== requestRevision.current) return;
      const directions = getRoutableDirections(stops, routes);
      if (!directions.length) {
        throw new Error("No hay rutas activas con dos paradas disponibles en el mismo sentido.");
      }
      const candidateStops = [...new Set(directions.flatMap(({ orderedStops }) => orderedStops))];

      const walkingDistances = await getStopWalkingDistances(
        currentPosition,
        selectedPlace.coordinate,
        candidateStops,
      );
      if (request !== requestRevision.current) return;
      const recommendation = findBestRoute(
        directions,
        buses,
        selectedPlace.coordinate,
        walkingDistances,
      );

      if (!recommendation) {
        throw new Error(
          "No encontramos una ruta con paradas a las que puedas llegar caminando por calles o cruces válidos.",
        );
      }

      setResult({ place: selectedPlace, recommendation });
      onRouteFound(recommendation, currentPosition);
    } catch (routeError) {
      if (request === requestRevision.current) setError((routeError as Error).message);
    } finally {
      if (request === requestRevision.current) setIsFindingRoute(false);
    }
  }, [buses, getUserLocation, onRouteFound, routes, selectedPlace, stops]);

  return {
    recommendation: result?.place === selectedPlace ? result?.recommendation ?? null : null,
    clearRecommendation,
    isFindingRoute,
    error,
    findRouteToPlace,
  };
}
