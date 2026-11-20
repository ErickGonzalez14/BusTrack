import {
  BUS_LOCATION_TASK,
  clearActiveBusTracking,
  getActiveBusTracking,
  publishBusLocation,
  removeLiveBusLocation,
  saveActiveBusTracking,
} from "@/src/features/tracking/data/busTracking.service";
import { getAuth } from "@react-native-firebase/auth";
import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import { Platform } from "react-native";
import {
  dismissBusTrackingNotification,
  notifyBusTrackingStarted,
} from "./busTrackingNotifications.service";

export async function startBusTracking(busId: string) {
  if (Platform.OS === "web") {
    throw new Error("El seguimiento en segundo plano requiere la app móvil.");
  }
  const userId = getAuth().currentUser?.uid;
  if (!userId) throw new Error("Inicia sesión para compartir la ubicación.");

  const busSnapshot = await getDoc(doc(getFirestore(), "buses", busId));
  const bus = busSnapshot.data();
  if (
    !busSnapshot.exists() ||
    bus?.userId !== userId ||
    (bus.busStatus !== "approved" && bus.requestStatus !== "approved")
  ) {
    throw new Error("Selecciona un bus aprobado de tu cuenta.");
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    throw new Error("Activa el GPS del teléfono para iniciar el seguimiento.");
  }
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) {
    throw new Error("Permite el acceso a la ubicación para seguir el bus.");
  }
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) {
    throw new Error("Permite la ubicación en segundo plano para seguir el bus durante el viaje.");
  }

  if (await Location.hasStartedLocationUpdatesAsync(BUS_LOCATION_TASK)) {
    await stopBusTracking();
  }

  const tracking = { userId, busId };
  const firstLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  await saveActiveBusTracking(tracking);
  try {
    await publishBusLocation(tracking, firstLocation);
    await Location.startLocationUpdatesAsync(BUS_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 0,
      timeInterval: 10_000,
      activityType: Location.ActivityType.AutomotiveNavigation,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "BusTrack está siguiendo tu bus",
        notificationBody: "Tu ubicación se comparte mientras el seguimiento está activo.",
        notificationColor: "#173C89",
      },
    });
  } catch (error) {
    await clearActiveBusTracking();
    await removeLiveBusLocation(userId).catch(() => undefined);
    throw error;
  }

  await notifyBusTrackingStarted().catch((error) => {
    console.warn("No se pudo mostrar el aviso de ubicación:", error);
  });
}

export async function stopBusTracking() {
  const tracking = await getActiveBusTracking();
  if (
    Platform.OS !== "web" &&
    (await Location.hasStartedLocationUpdatesAsync(BUS_LOCATION_TASK))
  ) {
    await Location.stopLocationUpdatesAsync(BUS_LOCATION_TASK);
  }
  await dismissBusTrackingNotification().catch((error) => {
    console.warn("No se pudo retirar el aviso de ubicación:", error);
  });
  await clearActiveBusTracking();
  if (tracking && getAuth().currentUser?.uid === tracking.userId) {
    try {
      await removeLiveBusLocation(tracking.userId);
    } catch (error) {
      console.warn("No se pudo retirar la última ubicación del bus:", error);
    }
  }
}
