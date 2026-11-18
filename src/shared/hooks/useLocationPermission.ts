import * as Location from "expo-location";
import { useEffect, useRef } from "react";

type UseLocationPermissionOptions = {
  enabled: boolean;
  userId?: string;
};

export function useLocationPermission({
  enabled,
  userId,
}: UseLocationPermissionOptions) {
  const requestedUsers = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || !userId || requestedUsers.current.has(userId)) {
      return;
    }

    requestedUsers.current.add(userId);

    const requestPermission = async () => {
      try {
        const currentPermission =
          await Location.getForegroundPermissionsAsync();

        if (
          currentPermission.status !== Location.PermissionStatus.GRANTED &&
          currentPermission.canAskAgain
        ) {
          await Location.requestForegroundPermissionsAsync();
        }
      } catch (permissionError) {
        console.warn(
          "No se pudo solicitar el permiso de ubicación:",
          permissionError,
        );
      }
    };

    void requestPermission();
  }, [enabled, userId]);
}
