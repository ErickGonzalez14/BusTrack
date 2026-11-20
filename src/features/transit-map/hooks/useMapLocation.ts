import { Coordinate } from "@/src/features/transit-map/domain/transport.type";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

export function useMapLocation({ requestPermissionOnMount = false, loadOnMount = true } = {}) {
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);

  useEffect(() => {
    if (!loadOnMount) return;
    let mounted = true;
    const loadMapLocation = async () => {
      try {
        const existingPermission =
          await Location.getForegroundPermissionsAsync();
        const permission =
          existingPermission.granted || !existingPermission.canAskAgain || !requestPermissionOnMount
            ? existingPermission
            : await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) return;
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted)
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
      } catch (error) {
        console.warn("No se pudo obtener la ubicación del mapa:", error);
      }
    };
    void loadMapLocation();
    return () => {
      mounted = false;
    };
  }, [loadOnMount, requestPermissionOnMount]);

  const getFreshUserLocation = useCallback(async (timeoutMs?: number) => {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error(
        "Activa el permiso de ubicación para continuar.",
      );
    }

    const request = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      mayShowUserSettingsDialog: !timeoutMs,
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const location = await (timeoutMs ? Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("No se obtuvo señal GPS. Inténtalo de nuevo al aire libre.")), timeoutMs);
      }),
    ]) : request).finally(() => clearTimeout(timer));
    const coordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setUserLocation(coordinate);
    return coordinate;
  }, []);

  return { userLocation, setUserLocation, getFreshUserLocation };
}
