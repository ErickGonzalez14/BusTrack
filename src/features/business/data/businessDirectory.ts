import { collection, getDocs, getFirestore, query, where } from "@react-native-firebase/firestore";

// ─── Tipos para negocios en el mapa ───────────────────────────────────────────
export type BusinessListing = {
  id: string;
  businessName: string;
  plan: string;
  adress: { latitude: number; longitude: number };
  logoUrl?: string | null;
  categoryId: string[];
  adressDescription?: string;
  phoneNumber?: string;
};

export type BusinessPromotion = {
  businessId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: number;
};

export const getActiveBusinessPromotions = async (): Promise<
  BusinessPromotion[]
> => {
  const snapshot = await getDocs(
    query(
      collection(getFirestore(), "publications"),
      where("active", "==", true),
    ),
  );
  return snapshot.docs
    .map((document) => {
      const data = document.data();
      return {
        businessId: data.businessId,
        title: data.name,
        description: data.description,
        imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : null,
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      };
    })
    .filter(
      (promotion) =>
        typeof promotion.businessId === "string" &&
        typeof promotion.title === "string" &&
        typeof promotion.description === "string",
    )
    .sort((a, b) => b.createdAt - a.createdAt);
};

const toBusinessListing = (document: {
  id: string;
  data: () => any;
}): BusinessListing | null => {
  const data = document.data();
  const latitude = Number(data.adress?.latitude);
  const longitude = Number(data.adress?.longitude);
  if (
    typeof data.businessName !== "string" ||
    !data.businessName.trim() ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  )
    return null;
  return {
    id: document.id,
    businessName: data.businessName.trim(),
    plan: data.plan,
    adress: { latitude, longitude },
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
    categoryId: Array.isArray(data.categoryId) ? data.categoryId : [],
    phoneNumber:
      typeof data.phoneNumber === "string" ? data.phoneNumber : undefined,
    adressDescription:
      typeof data.adressDescription === "string"
        ? data.adressDescription
        : undefined,
  };
};

const getApprovedBusinesses = async (
  plan: string,
): Promise<BusinessListing[]> => {
  const snapshot = await getDocs(
    query(
      collection(getFirestore(), "business"),
      where("requestStatus", "==", "approved"),
    ),
  );
  return snapshot.docs
    .filter((document) => document.data().plan === plan)
    .map(toBusinessListing)
    .filter((business): business is BusinessListing => business !== null);
};

// ─── Negocios Light aprobados (para resultados de búsqueda) ──────────────────
export const getLightBusinesses = async (): Promise<BusinessListing[]> => {
  return getApprovedBusinesses("BusTrack Business Light");
};

// ─── Negocios Pro aprobados (para pins y popups en el mapa) ──────────────────
export const getProBusinesses = async (): Promise<BusinessListing[]> => {
  return getApprovedBusinesses("BusTrack Business Pro");
};
