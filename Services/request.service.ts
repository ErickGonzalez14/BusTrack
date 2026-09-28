import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp,
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
