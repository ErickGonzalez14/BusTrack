import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";

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

export type BusinessProfile = {
  phoneNumber?: string;
  adressDescription?: string;
  businessName: string;
};

export const getBusinessInfo = async (
  userId: string,
): Promise<BusinessProfile> => {
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
