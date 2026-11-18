/* eslint-disable max-len, require-jsdoc */
import {FieldValue, type Firestore} from "firebase-admin/firestore";

function text(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}

export async function createCommunityRoute(db: Firestore, uid: string, body: Record<string, unknown>) {
  const title = text(body.title, 4, 80);
  const description = text(body.description, 0, 500);
  const city = text(body.city, 2, 80);
  const stopIds = body.stopIds;
  if (!title || description === null || !city ||
      !["outbound", "return"].includes(String(body.direction)) ||
      !Array.isArray(stopIds) || stopIds.length < 2 || stopIds.length > 20 ||
      new Set(stopIds).size !== stopIds.length ||
      !stopIds.every((id) => typeof id === "string" && id.length > 0 && !id.includes("/"))) {
    return null;
  }
  const stops = await db.getAll(...stopIds.map((id: string) => db.collection("stops").doc(id)));
  if (!stops.every((stop) => stop.exists && stop.get("active") !== false)) return null;
  const ref = await db.collection("communityRoutes").add({
    authorId: uid, title, description, city, direction: body.direction, stopIds,
    status: "published", ratingAverage: 0, ratingCount: 0,
    ratingTotal: 0, rankingScore: 3, createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function createCommunityTrip(db: Firestore, uid: string, body: Record<string, unknown>) {
  const title = text(body.title, 4, 80);
  const description = text(body.description ?? "", 0, 500);
  const origin = text(body.origin, 2, 80);
  const destination = text(body.destination, 2, 80);
  const originPlaceId = text(body.originPlaceId, 1, 200);
  const destinationPlaceId = text(body.destinationPlaceId, 1, 200);
  const originCoordinate = body.originCoordinate as {latitude?: unknown; longitude?: unknown} | undefined;
  const destinationCoordinate = body.destinationCoordinate as {latitude?: unknown; longitude?: unknown} | undefined;
  const validCoordinate = (coordinate: typeof originCoordinate) =>
    coordinate && typeof coordinate.latitude === "number" &&
    Number.isFinite(coordinate.latitude) && Math.abs(coordinate.latitude) <= 90 &&
    typeof coordinate.longitude === "number" &&
    Number.isFinite(coordinate.longitude) && Math.abs(coordinate.longitude) <= 180;
  const distanceKm = body.distanceKm;
  const durationMinutes = body.durationMinutes;
  if (!title) return {error: "El título debe tener entre 4 y 80 caracteres."};
  if (description === null) return {error: "La descripción puede tener hasta 500 caracteres."};
  if (!origin || !destination ||
      !originPlaceId || !destinationPlaceId ||
      !validCoordinate(originCoordinate) || !validCoordinate(destinationCoordinate)) {
    return {error: "Selecciona un origen y un destino válidos de las sugerencias."};
  }
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 1000 ||
      !Number.isInteger(durationMinutes) || (durationMinutes as number) < 1 ||
      (durationMinutes as number) > 10080) {
    return {error: "La distancia o la duración calculada está fuera del rango admitido."};
  }
  const ref = await db.collection("communityTrips").add({
    authorId: uid, title, description, origin, destination,
    originPlaceId, destinationPlaceId, originCoordinate, destinationCoordinate,
    distanceKm, durationMinutes, status: "published",
    ratingAverage: 0, ratingCount: 0, ratingTotal: 0,
    rankingScore: 3, createdAt: FieldValue.serverTimestamp(),
  });
  return {id: ref.id};
}

export async function rateCommunity(db: Firestore, uid: string, body: Record<string, unknown>) {
  const kind = body.kind;
  const itemId = body.itemId;
  const value = body.value;
  if ((kind !== "communityRoutes" && kind !== "communityTrips") ||
      typeof itemId !== "string" || !itemId || itemId.includes("/") ||
      !Number.isInteger(value) || (value as number) < 1 || (value as number) > 5) return false;
  const ref = db.collection(kind).doc(itemId);
  const ratingRef = ref.collection("ratings").doc(uid);
  return db.runTransaction(async (transaction) => {
    const [item, previous] = await Promise.all([
      transaction.get(ref), transaction.get(ratingRef),
    ]);
    if (!item.exists || item.get("status") !== "published" || item.get("authorId") === uid) return false;
    const oldValue = previous.exists ? previous.get("value") as number : null;
    if (oldValue === value) return true;
    const count = (item.get("ratingCount") ?? 0) + (oldValue === null ? 1 : 0);
    const total = (item.get("ratingTotal") ?? 0) + (value as number) - (oldValue ?? 0);
    transaction.set(ratingRef, {authorId: uid, value, updatedAt: FieldValue.serverTimestamp()});
    transaction.update(ref, {
      ratingCount: count, ratingTotal: total,
      ratingAverage: total / count,
      rankingScore: (total + 9) / (count + 3),
    });
    return true;
  });
}
