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
  addDoc(collection(db, "buses"), {
    approved: false,
    active: false,
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
  adress: {
    latitude: number;
    longitude: number;
  };
};

export const BusinessRequestService = async ({
  businessName,
  categoryId,
  adress,
}: SaveBusinessRequest) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error(
      "Debes iniciar sesión para enviar una solicitud de negocio.",
    );
  }
  addDoc(collection(db, "business"), {
    active: false,
    businessName: businessName,
    categoryId: categoryId,
    adress: adress,
    userId: currentUser.uid,
    created_at: serverTimestamp(),
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

export const subscribeToActiveBusiness = (
  userId: string,
  onChange: (isActive: boolean) => void,
) => {
  const db = getFirestore();

  const businessQuery = query(
    collection(db, "business"),
    where("userId", "==", userId),
  );
  return onSnapshot(businessQuery, (snapshot) => {
    const hasActiveBusiness = snapshot.docs.some(
      (document) => document.data().active === true,
    );
    onChange(hasActiveBusiness);
  });
};

export const getBusinessId = async (userId: string): Promise<string> => {
  const db = getFirestore();
  const businessQuery = query(
    collection(db, "business"),
    where("userId", "==", userId),
  );
  const snapshot = await getDocs(businessQuery);
  if (!snapshot.empty) {
    const businessDoc = snapshot.docs[0];
    return businessDoc.id;
  }
  throw new Error("No business found for the given user ID.");
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
