import {
  readOfflinePremiumAccess,
  storeOfflinePremiumAccess,
  verifyOfflinePremiumAccess,
} from "@/src/features/premium/data/offlinePremiumAccess";
import {
  deleteDownloadedRoute,
  listDownloadedRoutes,
  saveDownloadedRoute,
} from "@/src/features/transit-map/data/downloadedRoutes.service";
import { buildDownloadedRoute, nearestDownloadedStop } from "@/src/features/transit-map/domain/downloadedRoute";
import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import type { TransitRoute } from "@/src/features/transit-map/domain/transport.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDocFromServer } from "@react-native-firebase/firestore";

jest.mock("@react-native-async-storage/async-storage", () => {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    getAllKeys: async () => [...data.keys()],
    setItem: async (key: string, value: string) => { data.set(key, value); },
    removeItem: async (key: string) => { data.delete(key); },
    multiGet: async (keys: string[]) => keys.map((key) => [key, data.get(key) ?? null]),
    clear: async () => data.clear(),
  };
});

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: (_db: unknown, ...path: string[]) => path.join("/"),
  getDocFromServer: jest.fn(),
}));

function makeStop(id: string, latitude: number, active = true): Stop {
  return {
    id, name: id, active, adress: { latitude, longitude: -82.43 },
    city: "", district: "", province: "", villageId: "",
  };
}

const route: TransitRoute = {
  id: "ruta-1", name: "David", active: true, routeType: "bus",
  fareAprox: 0.5, estimatedDuration: 20,
  routeOutboundId: ["A", "pendiente", "B"], routeReturnID: ["B", "A"],
};
const stops = [makeStop("B", 8.45), makeStop("A", 8.42), makeStop("pendiente", 8.43, false)];

describe("Rutas descargadas", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  test("guarda una copia con paradas aprobadas en orden de ida y vuelta y la vuelve a leer", async () => {
    const download = buildDownloadedRoute(route, stops);
    await saveDownloadedRoute("usuario/a", download);

    expect(download.directions.map(({ stops }) => stops.map(({ id }) => id)))
      .toEqual([["A", "B"], ["B", "A"]]);
    expect((await listDownloadedRoutes("usuario/a"))[0]).toEqual(download);
    expect(await listDownloadedRoutes("usuario")).toEqual([]);
    expect(nearestDownloadedStop(download.directions[0].stops, stops[0].adress)?.stop.id).toBe("B");

    await deleteDownloadedRoute("usuario/a", route.id);
    expect(await listDownloadedRoutes("usuario/a")).toEqual([]);
  });

  test("ignora una copia dañada y exige un sentido válido al descargar", async () => {
    await AsyncStorage.setItem("@bustrack/downloaded-routes/user/ruta-1", "{malformed");
    expect(await listDownloadedRoutes("user")).toEqual([]);
    expect(() => buildDownloadedRoute(route, [stops[0]])).toThrow("suficientes paradas");
  });

  test("verifica la vigencia con el servidor y conserva el último permiso local si falla la conexión", async () => {
    const expiration = Date.now() + 10_000;
    const graceExpiration = expiration + 5_000;
    jest.mocked(getDocFromServer).mockResolvedValueOnce({
      data: () => ({
        entitlement: "premium", status: "grace_period",
        expiresAt: { toMillis: () => expiration },
        gracePeriodExpiresAt: { toMillis: () => graceExpiration },
      }),
    } as Awaited<ReturnType<typeof getDocFromServer>>);
    expect(await verifyOfflinePremiumAccess("user")).toBe(graceExpiration);
    expect(getDocFromServer).toHaveBeenCalledWith("userSubscriptions/user");
    await storeOfflinePremiumAccess("user", graceExpiration);

    jest.mocked(getDocFromServer).mockRejectedValueOnce(new Error("offline"));
    await expect(verifyOfflinePremiumAccess("user")).rejects.toThrow("offline");
    expect(await readOfflinePremiumAccess("user")).toBe(graceExpiration);
    expect(await readOfflinePremiumAccess("other")).toBe(0);

    jest.mocked(getDocFromServer).mockResolvedValueOnce({
      data: () => ({ entitlement: "premium", status: "expired" }),
    } as Awaited<ReturnType<typeof getDocFromServer>>);
    const revoked = await verifyOfflinePremiumAccess("user");
    expect(revoked).toBe(0);
    await storeOfflinePremiumAccess("user", revoked);
    expect(await readOfflinePremiumAccess("user")).toBe(0);
  });
});
