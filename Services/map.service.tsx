import { Stop } from "@/interfaces/stop.type";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";

export const getStops = async (): Promise<Stop[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "stops"));

  return snapshot.docs.map((stopDocument) => ({
    id: stopDocument.id,
    ...(stopDocument.data() as Omit<Stop, "id">),
  }));
};
