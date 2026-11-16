/* eslint-disable max-len, require-jsdoc */
import {getApp, getApps, initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {onDocumentCreated, onDocumentWritten} from "firebase-functions/v2/firestore";

type Kind = "communityRoutes" | "communityTrips";
const db = getFirestore(getApps().length ? getApp() : initializeApp());

async function publish(kind: Kind, itemId: string) {
  const ref = db.collection(kind).doc(itemId);
  const item = await ref.get();
  if (!item.exists || item.get("status") !== "pending") return;
  let valid = false;
  if (kind === "communityRoutes") {
    const stopIds = item.get("stopIds");
    if (Array.isArray(stopIds) && stopIds.length >= 2 && stopIds.length <= 20 &&
        new Set(stopIds).size === stopIds.length &&
        stopIds.every((id) => typeof id === "string" && id.length > 0 && !id.includes("/"))) {
      const stops = await db.getAll(...stopIds.map((id) => db.collection("stops").doc(id)));
      valid = stops.every((stop) => stop.exists && stop.get("active") !== false);
    }
  } else {
    const distance = item.get("distanceKm");
    const duration = item.get("durationMinutes");
    const stops = item.get("stops");
    valid = typeof distance === "number" && distance > 0 && distance <= 1000 &&
      Number.isInteger(duration) && duration > 0 && duration <= 10080 &&
      Array.isArray(stops) && stops.length <= 10 &&
      stops.every((stop) => typeof stop === "string" && stop.length <= 80);
  }
  await ref.update({status: valid ? "published" : "rejected", reviewedAt: FieldValue.serverTimestamp()});
}

async function updateRating(kind: Kind, itemId: string, eventId: string, before: unknown, after: unknown) {
  const oldValue = typeof before === "number" && Number.isInteger(before) && before >= 1 && before <= 5 ? before : null;
  const newValue = typeof after === "number" && Number.isInteger(after) && after >= 1 && after <= 5 ? after : null;
  if (oldValue === newValue) return;
  const ref = db.collection(kind).doc(itemId);
  const processedRef = ref.collection("ratingEvents").doc(eventId);
  await db.runTransaction(async (transaction) => {
    const [snapshot, processed] = await Promise.all([
      transaction.get(ref), transaction.get(processedRef),
    ]);
    if (processed.exists) return;
    if (!snapshot.exists) return;
    const count = Math.max(0, (snapshot.get("ratingCount") ?? 0) + Number(newValue !== null) - Number(oldValue !== null));
    const total = Math.max(0, (snapshot.get("ratingTotal") ?? 0) + (newValue ?? 0) - (oldValue ?? 0));
    transaction.update(ref, {
      ratingCount: count,
      ratingTotal: total,
      ratingAverage: count ? total / count : 0,
      // Three neutral votes prevent a single five-star vote from dominating.
      rankingScore: (total + 9) / (count + 3),
    });
    transaction.create(processedRef, {createdAt: FieldValue.serverTimestamp()});
  });
}

export const communityRouteCreated = onDocumentCreated("communityRoutes/{itemId}", async (event) => {
  if (!event.params.itemId) return;
  try {
    await publish("communityRoutes", event.params.itemId);
  } catch (error) {
    logger.error("Could not validate community route", error);
    throw error;
  }
});

export const communityTripCreated = onDocumentCreated("communityTrips/{itemId}", async (event) => {
  if (!event.params.itemId) return;
  await publish("communityTrips", event.params.itemId);
});

export const communityRouteRated = onDocumentWritten("communityRoutes/{itemId}/ratings/{uid}", async (event) => {
  await updateRating("communityRoutes", event.params.itemId, event.id, event.data?.before.data()?.value, event.data?.after.data()?.value);
});

export const communityTripRated = onDocumentWritten("communityTrips/{itemId}/ratings/{uid}", async (event) => {
  await updateRating("communityTrips", event.params.itemId, event.id, event.data?.before.data()?.value, event.data?.after.data()?.value);
});
