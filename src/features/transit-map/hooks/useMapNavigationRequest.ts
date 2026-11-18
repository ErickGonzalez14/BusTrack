import type { SimulatedBus } from "@/functions/shared/simulatedFleet";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { distanceInMeters, getRoutableDirections } from "../domain/mapRouting";
import type { Stop } from "../domain/stop.type";
import type { Bus, Coordinate, GooglePlace, RouteRecommendation, TransitRoute } from "../domain/transport.type";

type MapNavigationOptions = {
  isMapReady: boolean;
  selectPlace: (place: GooglePlace) => void;
  destination: GooglePlace | null;
  stops?: Stop[];
  routes?: TransitRoute[];
  buses?: Bus[];
  simulatedBuses: SimulatedBus[];
  userLocation: Coordinate | null;
  followRoute: (recommendation: RouteRecommendation, coordinates: Coordinate[]) => void;
};

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function useMapNavigationRequest({
  isMapReady, selectPlace, destination, stops, routes, buses, simulatedBuses,
  userLocation, followRoute,
}: MapNavigationOptions) {
  const handledFavoriteRequest = useRef<string | null>(null);
  const followedRoutineRequest = useRef<string | null>(null);
  const favoriteParams = useLocalSearchParams<{
    favoriteRequest?: string | string[];
    favoritePlaceId?: string | string[];
    favoriteName?: string | string[];
    favoriteAddress?: string | string[];
    favoriteLatitude?: string | string[];
    favoriteLongitude?: string | string[];
    favoriteType?: string | string[];
    routineRouteId?: string | string[];
    routineRequest?: string | string[];
    routineDirection?: string | string[];
    routineBoardingId?: string | string[];
    routineDropoffId?: string | string[];
    routineBusId?: string | string[];
  }>();

  useEffect(() => {
    const requestId = getSearchParam(favoriteParams.favoriteRequest);
    const placeId = getSearchParam(favoriteParams.favoritePlaceId);
    const name = getSearchParam(favoriteParams.favoriteName);
    const latitude = Number(getSearchParam(favoriteParams.favoriteLatitude));
    const longitude = Number(getSearchParam(favoriteParams.favoriteLongitude));

    if (
      !isMapReady ||
      !requestId ||
      requestId === handledFavoriteRequest.current ||
      !placeId ||
      !name ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    handledFavoriteRequest.current = requestId;

    selectPlace({
      id: placeId,
      name,
      coordinate: { latitude, longitude },
      address: getSearchParam(favoriteParams.favoriteAddress) || undefined,
      type: getSearchParam(favoriteParams.favoriteType) || undefined,
    });
  }, [favoriteParams, isMapReady, selectPlace]);

  useEffect(() => {
    const requestId = getSearchParam(favoriteParams.favoriteRequest);
    const routeId = getSearchParam(favoriteParams.routineRouteId);
    if (
      !isMapReady || !requestId || !routeId ||
      requestId !== getSearchParam(favoriteParams.routineRequest) ||
      followedRoutineRequest.current === requestId ||
      !destination || destination.id !== getSearchParam(favoriteParams.favoritePlaceId) ||
      !stops || !routes || !buses
    ) return;

    followedRoutineRequest.current = requestId;
    const direction = getSearchParam(favoriteParams.routineDirection);
    const plan = getRoutableDirections(stops, routes).find(
      (entry) => entry.route.id === routeId && entry.direction === direction,
    );
    const boardingIndex = plan?.orderedStops.findIndex(
      (stop) => stop.id === getSearchParam(favoriteParams.routineBoardingId),
    ) ?? -1;
    const destinationIndex = plan?.orderedStops.findIndex(
      (stop, index) => index > boardingIndex &&
        stop.id === getSearchParam(favoriteParams.routineDropoffId),
    ) ?? -1;
    if (!plan || boardingIndex < 0 || destinationIndex <= boardingIndex) {
      Alert.alert("Recorrido no disponible", "El destino está abierto en el mapa. Busca una ruta actualizada para continuar.");
      return;
    }

    const boardingStop = plan.orderedStops[boardingIndex];
    const destinationStop = plan.orderedStops[destinationIndex];
    const origin = userLocation ?? boardingStop.adress;
    const busId = getSearchParam(favoriteParams.routineBusId);
    const simulated = simulatedBuses.find((bus) => bus.id === busId && bus.routeId === routeId);
    const recommendation: RouteRecommendation = {
      ...plan,
      bus: simulated ? {
        id: simulated.id,
        simulated: true,
        active: true,
        routeType: plan.route.routeType,
        licensePlate: `Bus simulado ${simulated.number}`,
        publicTransportPlate: "",
        ratingCount: [],
        ratingAverage: 0,
        routeId,
      } : buses.find((bus) => bus.id === busId &&
        bus.routeId === routeId && bus.active !== false && bus.busStatus === "approved") ?? null,
      boardingStop,
      destinationStop,
      boardingIndex,
      destinationIndex,
      walkingDistanceMeters: distanceInMeters(origin, boardingStop.adress),
      destinationDistanceMeters: distanceInMeters(destination.coordinate, destinationStop.adress),
      estimatedRideMinutes: null,
    };
    followRoute(recommendation, plan.orderedStops.slice(boardingIndex, destinationIndex + 1)
      .map((stop) => stop.adress));
  }, [favoriteParams, isMapReady, destination, stops,
    routes, buses, simulatedBuses, userLocation, followRoute]);
}
