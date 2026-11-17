import { Coordinate } from "@/interfaces/transport.type";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

export function useMapLocation() {
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadLocation = async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.warn("No se pudo obtener la ubicación inicial:", error);
      }
    };

    void loadLocation();
    return () => {
      mounted = false;
    };
  }, []);

  const getFreshUserLocation = useCallback(async () => {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      permission = await Location.requestForegroundPermissionsAsync();
    }
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error(
        "Activa el permiso de ubicación para continuar.",
      );
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const coordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setUserLocation(coordinate);
    return coordinate;
  }, []);

  return { userLocation, setUserLocation, getFreshUserLocation };
}
