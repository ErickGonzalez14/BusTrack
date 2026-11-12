import {
  startBusTracking,
  stopBusTracking,
} from "@/Services/busTrackingControl.service";
import {
  BUS_LOCATION_TASK,
  clearActiveBusTracking,
  getActiveBusTracking,
  removeLiveBusLocation,
} from "@/Services/busTracking.service";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export function useBusTracking(userId: string | undefined) {
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const [saved, running] = await Promise.all([
          getActiveBusTracking(),
          Platform.OS === "web"
            ? Promise.resolve(false)
            : Location.hasStartedLocationUpdatesAsync(BUS_LOCATION_TASK),
        ]);
        if (saved && !running && saved.userId === userId) {
          await clearActiveBusTracking();
          await removeLiveBusLocation(saved.userId).catch(() => undefined);
        }
        if (mounted) {
          setActiveBusId(running && saved && saved.userId === userId ? saved.busId : null);
        }
      } catch (error) {
        console.warn("No se pudo restaurar el seguimiento:", error);
      }
    };
    void restore();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const start = useCallback(async (busId: string) => {
    setIsBusy(true);
    try {
      await startBusTracking(busId);
      setActiveBusId(busId);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setIsBusy(true);
    try {
      await stopBusTracking();
    } finally {
      setActiveBusId(null);
      setIsBusy(false);
    }
  }, []);

  return { activeBusId, isTracking: activeBusId !== null, isBusy, start, stop };
}
