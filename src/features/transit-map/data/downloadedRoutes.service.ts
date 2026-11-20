import AsyncStorage from "@react-native-async-storage/async-storage";
import { downloadedRouteSchema, type DownloadedRoute } from "../domain/downloadedRoute";

const routePrefix = (uid: string) => `@bustrack/downloaded-routes/${encodeURIComponent(uid)}/`;
const routeKey = (uid: string, id: string) => routePrefix(uid) + encodeURIComponent(id);

export async function listDownloadedRoutes(uid: string): Promise<DownloadedRoute[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(routePrefix(uid)));
  if (!keys.length) return [];
  const entries = await AsyncStorage.multiGet(keys);
  return entries.flatMap(([key, value]) => {
    if (!value) return [];
    try {
      const route = downloadedRouteSchema.safeParse(JSON.parse(value));
      return route.success && key === routeKey(uid, route.data.id) ? [route.data] : [];
    } catch {
      return [];
    }
  }).sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export function saveDownloadedRoute(uid: string, route: DownloadedRoute) {
  return AsyncStorage.setItem(routeKey(uid, route.id), JSON.stringify(route));
}

export function deleteDownloadedRoute(uid: string, routeId: string) {
  return AsyncStorage.removeItem(routeKey(uid, routeId));
}
