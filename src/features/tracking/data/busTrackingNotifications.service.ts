import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const TRACKING_CHANNEL = "bus-tracking";
const TRACKING_NOTIFICATION_ID = "bus-tracking-started";

function canNotify(permission: Notifications.NotificationPermissionsStatus) {
  return permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function notifyBusTrackingStarted() {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(TRACKING_CHANNEL, {
      name: "Seguimiento del bus",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = canNotify(currentPermission) || !currentPermission.canAskAgain
    ? currentPermission
    : await Notifications.requestPermissionsAsync();
  if (!canNotify(permission)) return;

  await Notifications.scheduleNotificationAsync({
    identifier: TRACKING_NOTIFICATION_ID,
    content: {
      title: "BusTrack está usando tu ubicación",
      body: "Tu ubicación se comparte para seguir el bus mientras el seguimiento está activo.",
      sound: "default",
    },
    trigger: Platform.OS === "android" ? { channelId: TRACKING_CHANNEL } : null,
  });
}

export async function dismissBusTrackingNotification() {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return;

  await Notifications.dismissNotificationAsync(TRACKING_NOTIFICATION_ID);
}
