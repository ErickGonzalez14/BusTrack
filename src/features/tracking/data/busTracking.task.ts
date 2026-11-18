import {
  BUS_LOCATION_TASK,
  getActiveBusTracking,
  publishBusLocation,
} from "@/src/features/tracking/data/busTracking.service";
import type { LocationObject } from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  TaskManager.defineTask<{ locations: LocationObject[] }>(
    BUS_LOCATION_TASK,
    async ({ data, error }) => {
      if (error) {
        console.warn("No se pudo actualizar la ubicación del bus:", error.message);
        return;
      }
      try {
        const tracking = await getActiveBusTracking();
        const latest = data?.locations?.at(-1);
        if (!tracking || !latest) return;
        await publishBusLocation(tracking, latest);
      } catch (publishError) {
        console.warn("No se pudo publicar la ubicación del bus:", publishError);
      }
    },
  );
}
