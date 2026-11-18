import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDatabase,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
} from "@react-native-firebase/database";
import * as Location from "expo-location";

export const BUS_LOCATION_TASK = "bus-location-updates";
const ACTIVE_BUS_KEY = "@bustrack/active-bus";
const DATABASE_URL = "https://bustrack-dea8b-default-rtdb.firebaseio.com/";

export type ActiveBusTracking = { userId: string; busId: string };
export type LiveBusLocation = ActiveBusTracking & {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  updatedAt: number;
};

const liveBusesRef = () => ref(getDatabase(undefined, DATABASE_URL), "liveBuses");
const liveBusRef = (userId: string) =>
  ref(getDatabase(undefined, DATABASE_URL), `liveBuses/${userId}`);

export const getActiveBusTracking = async (): Promise<ActiveBusTracking | null> => {
  const saved = await AsyncStorage.getItem(ACTIVE_BUS_KEY);
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      parsed &&
      typeof parsed === "object" &&
      "userId" in parsed &&
      "busId" in parsed &&
      typeof parsed.userId === "string" &&
      typeof parsed.busId === "string"
    ) {
      return { userId: parsed.userId, busId: parsed.busId };
    }
  } catch {
    // Un valor local incompleto no debe reactivar el GPS.
  }
  return null;
};

export const saveActiveBusTracking = (tracking: ActiveBusTracking) =>
  AsyncStorage.setItem(ACTIVE_BUS_KEY, JSON.stringify(tracking));

export const clearActiveBusTracking = () => AsyncStorage.removeItem(ACTIVE_BUS_KEY);

export const publishBusLocation = async (
  tracking: ActiveBusTracking,
  location: Location.LocationObject,
) => {
  const { latitude, longitude, heading, speed } = location.coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("El GPS entregó una coordenada no válida.");
  }
  await set(liveBusRef(tracking.userId), {
    busId: tracking.busId,
    latitude,
    longitude,
    heading: heading != null && Number.isFinite(heading) && heading >= 0 && heading <= 360 ? heading : null,
    speed: speed != null && Number.isFinite(speed) && speed >= 0 ? speed : null,
    updatedAt: serverTimestamp(),
  });
};

export const removeLiveBusLocation = (userId: string) => remove(liveBusRef(userId));

export const subscribeToLiveBuses = (
  onChange: (locations: LiveBusLocation[]) => void,
  onError?: (error: Error) => void,
) =>
  onValue(
    liveBusesRef(),
    (snapshot) => {
      const raw = snapshot.val() as Record<string, unknown> | null;
      const locations = Object.entries(raw ?? {}).flatMap(([userId, value]) => {
        if (!value || typeof value !== "object") return [];
        const entry = value as Record<string, unknown>;
        if (
          typeof entry.busId !== "string" ||
          typeof entry.latitude !== "number" ||
          typeof entry.longitude !== "number" ||
          typeof entry.updatedAt !== "number" ||
          !Number.isFinite(entry.latitude) ||
          !Number.isFinite(entry.longitude) ||
          !Number.isFinite(entry.updatedAt) ||
          entry.latitude < -90 ||
          entry.latitude > 90 ||
          entry.longitude < -180 ||
          entry.longitude > 180
        ) {
          return [];
        }
        return [{
          userId,
          busId: entry.busId,
          latitude: entry.latitude,
          longitude: entry.longitude,
          heading: typeof entry.heading === "number" ? entry.heading : null,
          speed: typeof entry.speed === "number" ? entry.speed : null,
          updatedAt: entry.updatedAt,
        }];
      });
      onChange(locations);
    },
    onError,
  );
