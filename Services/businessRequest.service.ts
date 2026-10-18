import { getBusinessId } from "@/Services/request.service";
import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";
type saveProduct = {
  name: string;
  description: string;
  price: number;
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
  lastPrice: number;
  currentPrice: number;
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
  price: number;
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
