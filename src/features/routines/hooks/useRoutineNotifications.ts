import { getFavoriteSiteById } from "@/src/features/favorites/data/favoriteSites.service";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection, getFirestore, onSnapshot, query, where,
} from "@react-native-firebase/firestore";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import {
  isRoutinePushSigningOut,
  resumeRoutinePushRegistration,
  saveRoutinePushDevice,
  unregisterRoutinePushDevice,
} from "../data/routinePushDevices";

const supported = Platform.OS !== "web" &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function useRoutineNotifications(userId?: string) {
  const navigationKey = useRootNavigationState()?.key;
  const handled = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!supported || !userId) return;
    const projectId = Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    if (!projectId) return;

    resumeRoutinePushRegistration(userId);
    let active = true;
    let hasRoutines = false;
    let registering = false;
    let token: string | undefined;
    const canRegister = () => active && hasRoutines && !isRoutinePushSigningOut(userId) &&
      getAuth().currentUser?.uid === userId;
    const register = async () => {
      if (!canRegister() || registering || AppState.currentState === "background") return;
      registering = true;
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("routines", {
            name: "Recordatorios de rutinas",
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
        const current = await Notifications.getPermissionsAsync();
        const permission = current.granted || !current.canAskAgain
          ? current : await Notifications.requestPermissionsAsync();
        if (!permission.granted || !(await Location.getForegroundPermissionsAsync()).granted) {
          if (canRegister()) await unregisterRoutinePushDevice(userId);
          return;
        }
        const { coords } = await Location.getLastKnownPositionAsync({ maxAge: 300_000 }) ??
          await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        token ??= (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (!canRegister()) return;
        await saveRoutinePushDevice(userId, token, coords, canRegister);
      } catch (error) {
        console.warn("No se pudo activar el recordatorio de rutinas:", error);
      } finally {
        registering = false;
      }
    };

    const unsubscribe = onSnapshot(query(collection(getFirestore(), "routines"),
      where("userId", "==", userId)), (snapshot) => {
      hasRoutines = snapshot.docs.some((routine) => routine.data().active !== false);
      void register();
    }, (error) => console.warn("No se pudieron leer las rutinas:", error));
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") void register();
    });
    return () => {
      active = false;
      unsubscribe();
      appState.remove();
    };
  }, [userId]);

  useEffect(() => {
    if (!supported || !userId || !navigationKey) return;
    let active = true;
    const open = async (response: Notifications.NotificationResponse) => {
      const request = response.notification.request;
      const data = request.content.data;
      if (
        response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER ||
        handled.current === request.identifier || data.type !== "routine" ||
        data.userId !== userId || typeof data.favoriteId !== "string" ||
        typeof data.routeId !== "string" || typeof data.boardingId !== "string" ||
        typeof data.dropoffId !== "string" || typeof data.busId !== "string" ||
        (data.direction !== "outbound" && data.direction !== "return")
      ) return;
      handled.current = request.identifier;
      try {
        const favorite = await getFavoriteSiteById(userId, data.favoriteId);
        if (!active || !favorite) return;
        router.navigate({
          pathname: "/(tabs)/map",
          params: {
            favoriteRequest: request.identifier,
            favoritePlaceId: favorite.placeId,
            favoriteName: favorite.name,
            favoriteAddress: favorite.address ?? "",
            favoriteType: favorite.placeType ?? "",
            favoriteLatitude: String(favorite.coordinate.latitude),
            favoriteLongitude: String(favorite.coordinate.longitude),
            routineRouteId: data.routeId,
            routineRequest: request.identifier,
            routineDirection: data.direction,
            routineBoardingId: data.boardingId,
            routineDropoffId: data.dropoffId,
            routineBusId: data.busId,
          },
        });
        Notifications.clearLastNotificationResponse();
      } catch (error) {
        if (active) handled.current = undefined;
        console.warn("No se pudo abrir la ruta de la rutina:", error);
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => void open(response));
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) void open(lastResponse);
    return () => {
      active = false;
      subscription.remove();
    };
  }, [navigationKey, userId]);
}
