import type { Coordinate } from "@/src/features/transit-map/domain/transport.type";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  GeoPoint,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
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

const getFavoriteSitesRef = (userId: string) =>
  collection(getFirestore(), "Users", userId, "favoriteSites");

const getFavoriteSiteRef = (userId: string, siteId: string) =>
  doc(getFavoriteSitesRef(userId), siteId);

const requireFavoriteUser = (expectedUserId: string) => {
  const currentUser = getAuth().currentUser;

  if (currentUser?.uid !== expectedUserId) {
    throw new Error("Debes iniciar sesión para gestionar tus lugares favoritos.");
  }

  return currentUser.uid;
};

export async function getFavoriteSiteById(userId: string, id: string) {
  const snapshot = await getDoc(getFavoriteSiteRef(userId, id));
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

export const saveFavoriteSite = async (userId: string, {
  placeId,
  name,
  originalName,
  address,
  coordinate,
  placeType,
}: SaveFavoriteSiteInput) => {
  await setDoc(
    getFavoriteSiteRef(requireFavoriteUser(userId), encodeURIComponent(placeId)),
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

export async function updateFavoriteSiteName(userId: string, siteId: string, name: string) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Escribe un nombre para el lugar favorito.");

  await updateDoc(getFavoriteSiteRef(requireFavoriteUser(userId), siteId), {
    name: cleanName,
  });
}

export async function deleteFavoriteSite(userId: string, siteId: string) {
  await deleteDoc(getFavoriteSiteRef(requireFavoriteUser(userId), siteId));
}

export function watchFavoriteSites(
  userId: string,
  onChange: (sites: FavoriteSite[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(getFavoriteSitesRef(userId), (snapshot) => {
    const sites: FavoriteSite[] = [];

    for (const siteDoc of snapshot.docs) {
      const data = siteDoc.data();
      if (!data.location) continue;

      sites.push({
        id: siteDoc.id,
        placeId: data.placeId ?? siteDoc.id,
        name: data.name ?? "",
        originalName: data.originalName ?? "",
        address: data.address,
        coordinate: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        placeType: data.placeType,
        createdAt: data.created_at?.toDate?.() ?? undefined,
        public: data.public ?? false,
      });
    }

    sites.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    onChange(sites);
  }, onError);
}
