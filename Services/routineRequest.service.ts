import { getAuth } from "@react-native-firebase/auth";

import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";
export type Routines = {
  name: string;
  route: string;
  days: string[];
  time: string;
  recordatory: number;
};

export const RoutineRequestService = async ({
  name,
  route,
  days,
  time,
  recordatory,
}: Routines) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  addDoc(collection(db, "routines"), {
    active: true,
    name: name,
    route: route,
    days: days,
    time: time,
    recordatory: recordatory,
    userId: currentUser?.uid,
    createdAt: serverTimestamp(),
  });
};

export const getRoutinesService = async (
  userId: string,
): Promise<Routines[]> => {
  const db = getFirestore();
  const routinesCollection = collection(db, "routines");
  const snapshot = await routinesCollection.where("userId", "==", userId).get();
  if (snapshot.empty) {
    return [];
  }
  const routines: Routines[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data) {
      return;
    }
    routines.push({
      name: data.name,
      route: data.route,
      days: data.days,
      time: data.time,
      recordatory: data.recordatory,
    });
  });
  return routines;
};
