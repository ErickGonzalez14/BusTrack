import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";

type SaveDriverRequest = {
  routeType: string;
  licensePlate: string;
  publicTransportPlate: string;
  routeId: string;
};

export const DriverRequestService = async ({
  routeType,
  licensePlate,
  publicTransportPlate,
  routeId,
}: SaveDriverRequest) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error(
      "Debes iniciar sesión para enviar una solicitud de conductor.",
    );
  }
  await addDoc(collection(db, "buses"), {
    requestStatus: "pending",
    routeType: routeType,
    licensePlate: licensePlate,
    publicTransportPlate: publicTransportPlate,
    routeId: routeId,
    ratingCount: [],
    ratingAverage: 0,
    userId: currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export type SaveBusinessRequest = {
  businessName: string;
  categoryId: string[];
  adress?: {
    latitude: number;
    longitude: number;
  };
  paymentIntentId?: string;
  plan?: string;
  amountPaid?: number;
};

export const BusinessRequestService = async ({
  businessName,
  categoryId,
  adress,
  paymentIntentId,
  plan,
  amountPaid,
}: SaveBusinessRequest) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error(
      "Debes iniciar sesión para enviar una solicitud de negocio.",
    );
  }
  await addDoc(collection(db, "business"), {
    businessName: businessName,
    categoryId: categoryId,
    adress: adress,
    requestStatus: "pending",
    userId: currentUser.uid,
    created_at: serverTimestamp(),
    plan: plan || "BusTrack Business Pro",
    amountPaid: amountPaid ?? 35.0,
    paymentIntentId: paymentIntentId || null,
    paymentStatus: paymentIntentId ? "completed" : "pending",
  });
};

export type Categories = {
  id: string;
  name: string;
};

export const getCategories = async (): Promise<Categories[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "categories"));
  const categories: Categories[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: typeof data.name === "string" ? data.name : "",
    };
  });
  return categories;
};

export type ActiveBusinessInfo = {
  isApproved: boolean;
  plan: string | null;
};

export const subscribeToActiveBusiness = (
  userId: string,
  onChange: (info: ActiveBusinessInfo) => void,
) => {
  const db = getFirestore();

  const businessQuery = query(
    collection(db, "business"),
    where("userId", "==", userId),
  );
  return onSnapshot(businessQuery, (snapshot) => {
    const approvedDoc =
      snapshot.docs.find(
        (document) =>
          document.data().requestStatus === "approved" &&
          document.data().plan === "BusTrack Business Pro",
      ) ??
      snapshot.docs.find(
        (document) => document.data().requestStatus === "approved",
      );
    onChange({
      isApproved: Boolean(approvedDoc),
      plan: approvedDoc ? ((approvedDoc.data().plan as string) ?? null) : null,
    });
  });
};

export const getBusinessId = async (userId: string): Promise<string> => {
  const db = getFirestore();
  const businessDocument = await getApprovedBusinessDocument(userId);
  if (!businessDocument) {
    throw new Error("No business found for the given user ID.");
  }

  return businessDocument.id;
};

export const getBusinessCategories = async (
  businessId: string,
): Promise<string[]> => {
  const db = getFirestore();
  const businessRef = doc(db, "business", businessId);
  const businessSnapshot = await getDoc(businessRef);

  if (!businessSnapshot.exists()) {
    throw new Error("No se encontró el negocio.");
  }

  const data = businessSnapshot.data();

  return Array.isArray(data?.categoryId) ? data.categoryId : [];
};

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
export type businessInfo = {
  phoneNumber?: string;
  adressDescription?: string;
  businessName: string;
};
export const getBusinessInfo = async (
  userId: string,
): Promise<businessInfo> => {
  const businessDocument = await getApprovedBusinessDocument(userId);
  if (!businessDocument) {
    throw new Error("No se encontró un negocio aprobado para este usuario.");
  }
  const data = businessDocument.data();
  const businessName = data.businessName;
  const businessPhone = data.phoneNumber;
  const businessAddress = data.adressDescription;

  if (typeof businessName !== "string" || !businessName.trim()) {
    throw new Error("El negocio no tiene un nombre válido.");
  }

  return {
    businessName: businessName.trim(),
    phoneNumber: typeof businessPhone === "string" ? businessPhone : undefined,
    adressDescription:
      typeof businessAddress === "string" ? businessAddress : undefined,
  };
};

export const getApprovedBusinessDocument = async (userId: string) => {
  const db = getFirestore();
  const snapshot = await getDocs(
    query(collection(db, "business"), where("userId", "==", userId)),
  );
  return (
    snapshot.docs.find(
      (document) =>
        (document.data().requestStatus === "approved" &&
          document.data().plan === "BusTrack Business Pro") ||
        document.data().plan === "BusTrack Business Light",
    ) ??
    snapshot.docs.find(
      (document) => document.data().requestStatus === "approved",
    )
  );
};
