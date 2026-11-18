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
      const result = findBestRoute(
        directions,
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
