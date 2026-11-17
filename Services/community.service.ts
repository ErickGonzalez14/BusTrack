import { getAuth } from "@react-native-firebase/auth";
import { authenticatedBackendRequest } from "@/Services/premiumSync.service";
import type { Coordinate } from "@/interfaces/transport.type";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";

export type CommunityKind = "communityRoutes" | "communityTrips";
export type CommunityItem = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  status: "pending" | "published" | "rejected";
  ratingAverage: number;
  ratingCount: number;
  rankingScore: number;
  createdAt?: Date;
};
export type CommunityRoute = CommunityItem & {
  city: string;
  direction: "outbound" | "return";
  stopIds: string[];
};
export type CommunityTrip = CommunityItem & {
  origin: string;
  destination: string;
  originPlaceId?: string;
  destinationPlaceId?: string;
  originCoordinate?: Coordinate;
  destinationCoordinate?: Coordinate;
  distanceKm: number;
  durationMinutes: number;
};

function currentUid() {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Debes iniciar sesión.");
  return uid;
}

const clean = (value: string) => value.trim();

export async function createCommunityRoute(input: {
  title: string;
  description: string;
  city: string;
  direction: "outbound" | "return";
  stopIds: string[];
}) {
  const title = clean(input.title);
  const description = clean(input.description);
  const city = clean(input.city);
  const stopIds = [...new Set(input.stopIds)];
  if (title.length < 4 || title.length > 80 || description.length > 500 ||
      city.length < 2 || city.length > 80 || stopIds.length < 2 || stopIds.length > 20) {
    throw new Error("Completa el nombre, la ciudad y al menos dos paradas.");
  }
  await authenticatedBackendRequest("/community/routes", {
    title, description, city, direction: input.direction, stopIds,
  });
}

export async function createCommunityTrip(input: {
  title: string;
  description: string;
  origin: string;
  destination: string;
  originPlaceId: string;
  destinationPlaceId: string;
  originCoordinate: Coordinate;
  destinationCoordinate: Coordinate;
  distanceKm: number;
  durationMinutes: number;
}) {
  const title = clean(input.title);
  const description = clean(input.description);
  const origin = clean(input.origin);
  const destination = clean(input.destination);
  if (title.length < 4 || title.length > 80) {
    throw new Error("El título debe tener entre 4 y 80 caracteres.");
  }
  if (description.length > 500) {
    throw new Error("La descripción puede tener hasta 500 caracteres.");
  }
  if (origin.length < 2 || origin.length > 80 || destination.length < 2 || destination.length > 80 ||
      !input.originPlaceId || !input.destinationPlaceId ||
      !Number.isFinite(input.originCoordinate.latitude) || !Number.isFinite(input.originCoordinate.longitude) ||
      !Number.isFinite(input.destinationCoordinate.latitude) || !Number.isFinite(input.destinationCoordinate.longitude)) {
    throw new Error("Selecciona un origen y un destino válidos de las sugerencias.");
  }
  if (!Number.isFinite(input.distanceKm) || input.distanceKm <= 0 || input.distanceKm > 1000 ||
      !Number.isInteger(input.durationMinutes) || input.durationMinutes < 1 || input.durationMinutes > 10080) {
    throw new Error("La distancia o la duración calculada está fuera del rango admitido.");
  }
  await authenticatedBackendRequest("/community/trips", {
    title, description, origin, destination,
    // Older Render deployments still require this field.
    stops: [],
    originPlaceId: input.originPlaceId, destinationPlaceId: input.destinationPlaceId,
    originCoordinate: input.originCoordinate, destinationCoordinate: input.destinationCoordinate,
    distanceKm: input.distanceKm, durationMinutes: input.durationMinutes,
  });
}

function toItem<T extends CommunityItem>(snapshot: { docs: { id: string; data: () => Record<string, any> }[] }): T[] {
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return { ...data, id: entry.id, createdAt: data.createdAt?.toDate?.() } as T;
  });
}

export function watchCommunityItems<T extends CommunityItem>(
  kind: CommunityKind,
  onChange: (items: T[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(query(
    collection(getFirestore(), kind), where("status", "==", "published"),
    orderBy("rankingScore", "desc"), orderBy("ratingCount", "desc"), limit(50),
  ), (snapshot) => onChange(toItem<T>(snapshot)), onError);
}

export function watchMyPendingItems<T extends CommunityItem>(
  kind: CommunityKind,
  onChange: (items: T[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(query(
    collection(getFirestore(), kind), where("authorId", "==", currentUid()),
    where("status", "==", "pending"), limit(20),
  ), (snapshot) => onChange(toItem<T>(snapshot)), onError);
}

export async function rateCommunityItem(kind: CommunityKind, itemId: string, value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("La valoración debe estar entre 1 y 5.");
  }
  await authenticatedBackendRequest("/community/rating", { kind, itemId, value });
}

export async function getMyCommunityRating(kind: CommunityKind, itemId: string) {
  const snapshot = await getDoc(doc(getFirestore(), kind, itemId, "ratings", currentUid()));
  const value = snapshot.data()?.value;
  return typeof value === "number" ? value : null;
}
