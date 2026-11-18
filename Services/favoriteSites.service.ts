import type { Coordinate } from "@/interfaces/transport.type";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  doc,
  GeoPoint,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";

type SaveFavoriteSiteInput = {
  placeId: string;
  name: string;
  originalName: string;
  address?: string;
  coordinate: Coordinate;
  placeType?: string;
};

export type FavoriteSite = {
  id: string;
  placeId: string;
  name: string;
  originalName: string;
  address?: string;
  coordinate: Coordinate;
  placeType?: string;
  createdAt?: Date;
  public: boolean;
};

const getFavoriteSiteRef = (placeId: string) => {
  const currentUser = getAuth().currentUser;

  if (!currentUser) {
    throw new Error("Debes iniciar sesión para guardar un lugar favorito.");
  }

  return doc(
    getFirestore(),
    "Users",
    currentUser.uid,
    "favoriteSites",
    encodeURIComponent(placeId),
  );
};

export const getFavoriteSite = async (placeId: string) => {
  const snapshot = await getDoc(getFavoriteSiteRef(placeId));

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    name: typeof data.name === "string" ? data.name : "",
  };
};

export async function getFavoriteSiteById(userId: string, id: string) {
  const snapshot = await getDoc(
    doc(getFirestore(), "Users", userId, "favoriteSites", id),
  );
  const data = snapshot.data();
  if (!data?.location || !data.name) return null;
  return {
    placeId: data.placeId ?? snapshot.id,
    name: data.name,
    address: data.address,
    placeType: data.placeType,
    coordinate: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
  };
}

export const saveFavoriteSite = async ({
  placeId,
  name,
  originalName,
  address,
  coordinate,
  placeType,
}: SaveFavoriteSiteInput) => {
  await setDoc(
    getFavoriteSiteRef(placeId),
    {
      name: name.trim(),
      originalName,
      location: new GeoPoint(coordinate.latitude, coordinate.longitude),
      public: false,
      placeId,
      ...(address ? { address } : {}),
      ...(placeType ? { placeType } : {}),
      created_at: serverTimestamp(),
    },
    { merge: true },
  );
};

export const getAllFavoriteSites = async (): Promise<FavoriteSite[]> => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return [];

  const snapshot = await getDocs(
    collection(getFirestore(), "Users", currentUser.uid, "favoriteSites"),
  );

  const sites: FavoriteSite[] = snapshot.docs.map((siteDoc) => {
    const data = siteDoc.data();
    const location = data.location; // GeoPoint
    return {
      id: siteDoc.id,
      placeId: data.placeId ?? siteDoc.id,
      name: data.name ?? "",
      originalName: data.originalName ?? "",
      address: data.address,
      coordinate: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      placeType: data.placeType,
      createdAt: data.created_at?.toDate?.() ?? undefined,
      public: data.public ?? false,
    };
  });

  // Ordenar por fecha de creación descendente (más recientes primero)
  sites.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return sites;
};
