import {
  getBusinessId
} from "@/Services/request.service";
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
