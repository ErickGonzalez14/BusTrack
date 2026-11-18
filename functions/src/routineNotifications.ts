/* eslint-disable max-len, require-jsdoc */
import {getApp, getApps, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {routineWindow} from "./routineSchedule";

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);

function documentId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 1500 &&
    value !== "." && value !== ".." && !value.includes("/");
}

export const sendRoutineNotifications = onSchedule({
  schedule: "every 1 minutes",
  timeZone: "America/Panama",
  maxInstances: 1,
  timeoutSeconds: 55,
}, async () => {
  const routines = await db.collection("routines").where("active", "==", true).get();

  for (const routine of routines.docs) {
    try {
      const {userId, name, time, recordatory, days} = routine.data();
      const window = routineWindow(Date.now(), time, recordatory, days);
      if (!documentId(userId) || !window) continue;

      const delivery = db.collection("routinePushDeliveries").doc(routine.id);
      const device = db.collection("routinePushDevices").doc(userId);
      const [previous, registration] = await db.getAll(delivery, device);
      if (previous.get("date") === window.date) continue;
      const token = registration.get("token");
      if (typeof token !== "string" || !/^(Expo|Exponent)PushToken\[[\w-]+\]$/.test(token)) continue;

      const claimed = await db.runTransaction(async (transaction) => {
        const [existing, currentDevice, currentRoutine] = await transaction.getAll(delivery, device, routine.ref);
        if (existing.get("date") === window.date || currentDevice.get("token") !== token ||
            !currentRoutine.updateTime?.isEqual(routine.updateTime) || Date.now() >= window.deadline) return false;
        transaction.set(delivery, {date: window.date});
        return true;
      });
      if (!claimed) continue;

      const routineName = typeof name === "string" ? name.trim().slice(0, 80) : "";
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          to: token,
          title: routineName ? `Recordatorio · ${routineName}` : "Recordatorio de rutina",
          body: `Hora para tomar el bus: ${time}. Es momento de prepararte para salir.`,
          sound: "default",
          channelId: "routines",
          expiration: Math.floor(window.deadline / 1000),
          data: {type: "routine", userId, routineId: routine.id},
        }),
      });
      const result = await response.json() as {
        data?: {status?: string; details?: {error?: string}};
      };
      if (!response.ok || result.data?.status !== "ok") {
        // A rejected push can be retried. A timeout leaves the claim intact to avoid a duplicate.
        await db.runTransaction(async (transaction) => {
          const [currentDevice, currentDelivery] = await transaction.getAll(device, delivery);
          if (currentDelivery.get("date") === window.date) transaction.delete(delivery);
          if (result.data?.details?.error === "DeviceNotRegistered" &&
              currentDevice.get("token") === token) transaction.delete(device);
        });
        logger.warn("Expo rechazó un recordatorio de rutina", {
          status: response.status, reason: result.data?.details?.error,
        });
      }
    } catch (error) {
      logger.error("No se pudo procesar un recordatorio de rutina", {
        routineId: routine.id, error: error instanceof Error ? error.name : "UnknownError",
      });
    }
  }
});
