import { getBusinessId } from "@/Services/request.service";
import { getAuth } from "@react-native-firebase/auth";

import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";
type saveProduct = {
  name: string;
  description: string;
  price: string;
  cardColor: string;
  imageUrl: string;
  categoryId: string[];
};
export const ProductRequestService = async ({
  name,
  description,
  price,
  cardColor,
  imageUrl,
  categoryId,
}: saveProduct) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  const businessId = await getBusinessId(currentUser?.uid || "");
  addDoc(collection(db, "publications"), {
    type: "product",
    active: false,
    name: name,
    description: description,
    price: price,
    cardcolor: cardColor,
    imageUrl: imageUrl,
    businessId: businessId,
    categoryId: categoryId,
    createdAt: serverTimestamp(),
  });
};
type saveDiscount = {
  name: string;
  description: string;
  lastPrice: string;
  currentPrice: string;
  startDate: Date;
  endDate: Date;
  cardColor: string;
  imageUrl: string;
  categoryId: string[];
};
export const DiscountRequestService = async ({
  name,
  description,
  lastPrice,
  currentPrice,
  startDate,
  endDate,
  cardColor,
  imageUrl,
  categoryId,
}: saveDiscount) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  const businessId = await getBusinessId(currentUser?.uid || "");
  addDoc(collection(db, "publications"), {
    type: "discount",
    active: false,
    name: name,
    description: description,
    lastPrice: lastPrice,
    currentPrice: currentPrice,
    startDate: startDate,
    endDate: endDate,
    cardColor: cardColor,
    imageUrl: imageUrl,
    businessId: businessId,
    categoryId: categoryId,
    createdAt: serverTimestamp(),
  });
};

type saveService = {
  name: string;
  description: string;
  price: string;
  cardColor: string;
  imageUrl: string;
  categoryId: string[];
  phoneNumber: string;
};

export const ProfesionalServiceRequestService = async ({
  name,
  description,
  price,
  cardColor,
  imageUrl,
  categoryId,
  phoneNumber,
}: saveService) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  const businessId = await getBusinessId(currentUser?.uid || "");
  addDoc(collection(db, "publications"), {
    type: "service",
    active: false,
    name: name,
    description: description,
    price: price,
    cardColor: cardColor,
    imageUrl: imageUrl,
    businessId: businessId,
    categoryId: categoryId,
    phoneNumber: phoneNumber,
    createdAt: serverTimestamp(),
  });
};

type FirestoreTimestamp = {
  toDate: () => Date;
};

export type Publication = {
  id: string;
  type: "product" | "discount" | "service";
  active: boolean;
  name: string;
  description: string;
  businessId: string;
  categoryId: string[];
  imageUrl: string;
  cardColor: string;
  price?: string;
  lastPrice?: string;
  currentPrice?: string;
  phoneNumber?: string;
  createdAt?: FirestoreTimestamp | null;
  startDate?: FirestoreTimestamp | null;
  endDate?: FirestoreTimestamp | null;
};
export const getBusinessPublications = async (): Promise<Publication[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "publications"));
  const publications: Publication[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      active: data.active,
      name: data.name,
      description: data.description,
      businessId: data.businessId,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      cardColor: data.cardColor,
      price: data.price,
      lastPrice: data.lastPrice,
      currentPrice: data.currentPrice,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  });
  return publications;
};

export const getMyBusinessPublications = async (
  businessId: string,
): Promise<Publication[]> => {
  const db = getFirestore();
  const publicationRef = collection(db, "publications");
  const snapshot = await publicationRef
    .where("businessId", "==", businessId)
    .get();
  const publications: Publication[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data) {
      return;
    }
    publications.push({
      id: doc.id,
      type: data.type,
      active: data.active,
      name: data.name,
      description: data.description,
      businessId: data.businessId,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      cardColor: data.cardColor,
      price: data.price,
      lastPrice: data.lastPrice,
      currentPrice: data.currentPrice,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  });
  return publications;
};
