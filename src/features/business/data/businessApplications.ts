import { getAuth } from "@react-native-firebase/auth";
import { addDoc, collection, getFirestore, serverTimestamp } from "@react-native-firebase/firestore";

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

export const submitBusinessApplication = async ({
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
