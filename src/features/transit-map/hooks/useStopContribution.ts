import { addCrowdSourcedStop, addPendingStop, CROWD_BUS_TYPES } from "../data/stopContributions";
import type { Coordinate, RouteDirection } from "../domain/transport.type";
import * as Location from "expo-location";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

export function useStopContribution(
  activeRouteId: string | null,
  getFreshUserLocation: () => Promise<Coordinate>,
) {
  const [isAddingStop, setIsAddingStop] = useState(false);
  const savingStop = useRef(false);
  const [stopTarget, setStopTarget] = useState<{ routeId: string | null } | null>(null);
  const [stopName, setStopName] = useState("");
  const [crowdRouteName, setCrowdRouteName] = useState("");
  const [crowdDirection, setCrowdDirection] = useState<RouteDirection | null>(null);
  const [crowdBusType, setCrowdBusType] =
    useState<(typeof CROWD_BUS_TYPES)[number]["id"] | null>(null);
  const isCrowdStop = stopTarget?.routeId === null;
  const canSaveStop = !!stopTarget && !!stopName.trim() && !isAddingStop &&
    (!isCrowdStop || (!!crowdRouteName.trim() && !!crowdDirection && !!crowdBusType));

  const handleAddStop = useCallback(async () => {
    const cleanStopName = stopName.trim();
    if (!stopTarget || savingStop.current || !cleanStopName) return;
    const routeId = stopTarget.routeId;
    const routeName = crowdRouteName.trim();
    if (routeId === null && (!routeName || !crowdDirection || !crowdBusType)) return;

    savingStop.current = true;
    setIsAddingStop(true);

    try {
      const coordinate = await getFreshUserLocation();
      if (routeId !== null) {
        const [address] = await Location.reverseGeocodeAsync(coordinate);
        const city =
          address?.city?.trim() ||
          address?.district?.trim() ||
          address?.subregion?.trim() ||
          address?.region?.trim() ||
          "Por confirmar";
        await addPendingStop({ coordinate, routeId, city, name: cleanStopName });
      } else if (crowdDirection && crowdBusType) {
        await addCrowdSourcedStop({
          coordinate,
          stopName: cleanStopName,
          routeName,
          direction: crowdDirection,
          busType: crowdBusType,
        });
      }

      setStopTarget(null);
      Alert.alert(
        "¡Gracias por colaborar con BusTrack!",
        "Guardamos la parada para confirmar su posición antes de mostrarla.",
      );
    } catch (error) {
      Alert.alert(
        "No pudimos agregar la parada",
        error instanceof Error
          ? error.message
          : "Inténtalo nuevamente en unos momentos.",
      );
    } finally {
      savingStop.current = false;
      setIsAddingStop(false);
    }
  }, [crowdBusType, crowdDirection, crowdRouteName, getFreshUserLocation, stopName, stopTarget]);

  const openStopNameModal = useCallback(() => {
    if (savingStop.current) return;
    setStopName("");
    setCrowdRouteName("");
    setCrowdDirection(null);
    setCrowdBusType(null);
    setStopTarget({ routeId: activeRouteId });
  }, [activeRouteId]);

  const closeStopNameModal = useCallback(() => {
    if (!savingStop.current) setStopTarget(null);
  }, []);

  const clearRouteStop = useCallback(() => {
    setStopTarget((target) => target?.routeId ? null : target);
  }, []);

  return {
    isAddingStop, isCrowdStop, isOpen: stopTarget !== null, canSaveStop,
    stopName, setStopName, crowdRouteName, setCrowdRouteName, setCrowdDirection,
    setCrowdBusType, handleAddStop, openStopNameModal, closeStopNameModal, clearRouteStop,
  };
}
