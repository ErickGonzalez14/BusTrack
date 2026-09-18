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
  placeId: string;
  name: string;
  originalName: string;
  address?: string;
  coordinate: Coordinate;
  placeType?: string;
  createdAt?: Date;
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
    collection(
      getFirestore(),
      "Users",
      currentUser.uid,
      "favoriteSites",
    ),
  );

  const sites: FavoriteSite[] = snapshot.docs.map((siteDoc) => {
    const data = siteDoc.data();
    const location = data.location; // GeoPoint
    return {
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
