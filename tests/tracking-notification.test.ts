import { startBusTracking, stopBusTracking } from "@/src/features/tracking/data/busTrackingControl.service";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: () => ({ currentUser: { uid: "driver" } }),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: async () => ({
    exists: () => true,
    data: () => ({ userId: "driver", busStatus: "approved" }),
  }),
}));

jest.mock("@/src/features/tracking/data/busTracking.service", () => ({
  BUS_LOCATION_TASK: "bus-location",
  clearActiveBusTracking: jest.fn(),
  getActiveBusTracking: jest.fn(),
  publishBusLocation: jest.fn(),
  removeLiveBusLocation: jest.fn().mockResolvedValue(undefined),
  saveActiveBusTracking: jest.fn(),
}));

jest.mock("expo-location", () => ({
  Accuracy: { High: 4 },
  ActivityType: { AutomotiveNavigation: 2 },
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  hasStartedLocationUpdatesAsync: jest.fn().mockResolvedValue(false),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({}),
  startLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
  stopLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 4 },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
}));

describe("Aviso de ubicación del bus", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  test.each(["android", "ios"] as const)(
    "publica el aviso en %s después de iniciar la tarea de ubicación",
    async (platform) => {
      jest.replaceProperty(Platform, "OS", platform);

      await startBusTracking("bus-1");

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: "bus-tracking-started",
          content: expect.objectContaining({ title: "BusTrack está usando tu ubicación" }),
          trigger: platform === "android" ? { channelId: "bus-tracking" } : null,
        }),
      );
      const [start] = jest.mocked(Location.startLocationUpdatesAsync).mock.invocationCallOrder;
      const [notify] = jest.mocked(Notifications.scheduleNotificationAsync).mock.invocationCallOrder;
      expect(start).toBeLessThan(notify);
    },
  );

  test("omite el aviso si el seguimiento no se pudo iniciar", async () => {
    jest.mocked(Location.startLocationUpdatesAsync).mockRejectedValueOnce(new Error("GPS no disponible"));

    await expect(startBusTracking("bus-1")).rejects.toThrow("GPS no disponible");
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test("mantiene el seguimiento si el usuario no permite notificaciones", async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      granted: false,
      canAskAgain: false,
    } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);

    await expect(startBusTracking("bus-1")).resolves.toBeUndefined();
    expect(Location.startLocationUpdatesAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test("retira el aviso al detener el seguimiento", async () => {
    jest.mocked(Location.hasStartedLocationUpdatesAsync).mockResolvedValueOnce(true);

    await stopBusTracking();

    expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith("bus-location");
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith("bus-tracking-started");
  });
});
