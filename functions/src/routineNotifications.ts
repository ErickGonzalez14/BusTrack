/* eslint-disable max-len, require-jsdoc */
import {getApp, getApps, initializeApp} from "firebase-admin/app";
import {getDatabaseWithUrl} from "firebase-admin/database";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {
  Direction, findRoutineArrival, Point, routineWindow, Stop, TrackedBus,
} from "./routineArrival";
import {simulateFleet} from "./simulatedFleet";

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const liveDatabase = () => getDatabaseWithUrl("https://bustrack-dea8b-default-rtdb.firebaseio.com/", app);

function point(value: unknown): Point | null {
  if (!value || typeof value !== "object") return null;
  const {latitude, longitude} = value as Partial<Point>;
  return typeof latitude === "number" && Math.abs(latitude) <= 90 &&
    typeof longitude === "number" && Math.abs(longitude) <= 180 ? {latitude, longitude} : null;
}

function documentId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 1500 &&
    value !== "." && value !== ".." && !value.includes("/");
}

async function trackedBuses(now: number): Promise<TrackedBus[]> {
  const live = await liveDatabase().ref("liveBuses").get();
  if (!live.exists()) return [];
  const tracked = Object.entries(live.val() as Record<string, {
    busId?: string; updatedAt?: number; heading?: number; speed?: number;
  }>).flatMap(([userId, location]) => {
    const coordinate = point(location);
    if (!coordinate || !documentId(location.busId) || typeof location.updatedAt !== "number" ||
        location.updatedAt < now - 120_000 || location.updatedAt > now + 5000) return [];
    return [{
      ...coordinate, userId, id: location.busId,
      heading: typeof location.heading === "number" && location.heading >= 0 &&
        location.heading <= 360 ? location.heading : null,
      speed: typeof location.speed === "number" && location.speed >= 0 &&
        location.speed <= 45 ? location.speed : null,
    }];
  });
  if (!tracked.length) return [];

  const busRefs = [...new Set(tracked.map((bus) => bus.id))]
    .map((id) => db.collection("buses").doc(id));
  const busDocs = new Map((await db.getAll(...busRefs)).map((bus) => [bus.id, bus.data()]));
  return tracked.flatMap((bus) => {
    const data = busDocs.get(bus.id);
    const routeId = typeof data?.routeId === "string" ? data.routeId.trim() : "";
    return data && data.userId === bus.userId && data.active !== false &&
      (data.busStatus === "approved" || data.requestStatus === "approved") &&
      documentId(routeId) ? [{...bus, routeId}] : [];
  });
}

async function transport(now: number) {
  const [routes, buses] = await Promise.all([
    db.collection("routes").get(),
    trackedBuses(now).catch((error) => {
      logger.warn("No se pudo consultar el GPS de los buses registrados", {
        error: error instanceof Error ? error.name : "UnknownError",
      });
      return [];
    }),
  ]);
  const plans = routes.docs.flatMap((route) => {
    const data = route.data();
    if (!data?.active) return [];
    const stopIds = (ids: unknown): string[] => Array.isArray(ids) ?
      ids.map((id) => typeof id === "string" ? id.trim() : id).filter(documentId) : [];
    const duration = typeof data.estimatedDuration === "number" && data.estimatedDuration > 0 ?
      data.estimatedDuration : 0;
    return [
      {routeId: route.id.trim(), direction: "outbound" as const, duration,
        ids: stopIds(data.routeOutboundId ?? data.routeOutboundID ?? data.routeOutbondId ?? data.stopIds)},
      {routeId: route.id.trim(), direction: "return" as const, duration,
        ids: stopIds(data.routeReturnID ?? data.routeReturnId)},
    ];
  });
  const stopRefs = [...new Set(plans.flatMap((plan) => plan.ids))]
    .map((id) => db.collection("stops").doc(id));
  if (!stopRefs.length) return {directions: [], buses};
  const stops = new Map<string, Stop>();
  for (const stop of await db.getAll(...stopRefs)) {
    const data = stop.data();
    const location = point(data?.adress ?? data?.address ?? data?.location);
    if (data?.active !== false && location) stops.set(stop.id, {...location, id: stop.id});
  }
  const directions: Direction[] = plans.flatMap(({ids, ...plan}) => {
    const ordered = ids.flatMap((id) => {
      const stop = stops.get(id);
      return stop ? [stop] : [];
    });
    return new Set(ordered).size >= 2 ? [{...plan, stops: ordered}] : [];
  });
  return {directions, buses: [...buses, ...simulateFleet(directions, Date.now())]};
}

export const sendRoutineNotifications = onSchedule({
  schedule: "every 1 minutes",
  timeZone: "America/Panama",
  maxInstances: 1,
  timeoutSeconds: 55,
}, async () => {
  const now = Date.now();
  const routines = await db.collection("routines").where("active", "==", true).get();
  const due = routines.docs.filter((routine) => {
    const {time, recordatory, days} = routine.data();
    return routineWindow(now, time, recordatory, days) !== null;
  });
  if (!due.length) return;
  const {directions, buses} = await transport(now);
  if (!directions.length) return;

  for (const routine of due) {
    try {
      const {userId, routeId, route, time, recordatory, days} = routine.data();
      const savedFavorite = routeId ?? route;
      const window = routineWindow(Date.now(), time, recordatory, days);
      if (!documentId(userId) || !documentId(savedFavorite) || !window) continue;

      const delivery = db.collection("routinePushDeliveries").doc(routine.id);
      const device = db.collection("routinePushDevices").doc(userId);
      const favorites = db.collection("Users").doc(userId).collection("favoriteSites");
      const [previous, registration, directFavorite] = await db.getAll(delivery, device, favorites.doc(savedFavorite));
      if (previous.get("date") === window.date) continue;
      const token = registration.get("token");
      const origin = point(registration.get("origin"));
      if (!origin || typeof token !== "string" || !/^(Expo|Exponent)PushToken\[[\w-]+\]$/.test(token)) continue;
      const favorite = directFavorite.exists ? directFavorite :
        await favorites.doc(encodeURIComponent(savedFavorite)).get();
      const destination = point(favorite.get("location"));
      if (!destination) continue;
      const trip = findRoutineArrival(origin, destination, directions, buses, window.secondsLeft);
      if (!trip || Date.now() + trip.eta * 1000 > window.deadline) continue;

      const claimed = await db.runTransaction(async (transaction) => {
        const [existing, currentDevice, currentRoutine] = await transaction.getAll(delivery, device, routine.ref);
        if (existing.get("date") === window.date || currentDevice.get("token") !== token ||
            !currentRoutine.updateTime?.isEqual(routine.updateTime)) return false;
        transaction.set(delivery, {date: window.date});
        return true;
      });
      if (!claimed) continue;

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          to: token,
          title: trip.simulated ? "Simulación · Bus cercano" : "Tu bus va a llegar a tiempo",
          body: trip.eta < 60 ?
            "El bus ya está cerca de tu parada. Toca para seguir el recorrido." :
            `El bus llega a tu parada en unos ${Math.ceil(trip.eta / 60)} min. Toca para seguir el recorrido.`,
          sound: "default",
          channelId: "routines",
          expiration: Math.floor(window.deadline / 1000),
          data: {
            type: "routine", userId, favoriteId: favorite.id, routeId: trip.routeId,
            direction: trip.direction, boardingId: trip.boardingId,
            dropoffId: trip.dropoffId, busId: trip.busId,
          },
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
