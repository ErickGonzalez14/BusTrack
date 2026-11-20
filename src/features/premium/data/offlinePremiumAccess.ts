import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDocFromServer, getFirestore } from "@react-native-firebase/firestore";
import { premiumAccessEnd, type PremiumSubscription } from "../domain/premiumSubscription";

const accessKey = (uid: string) => `@bustrack/offline-premium/${encodeURIComponent(uid)}`;

export async function readOfflinePremiumAccess(uid: string) {
  const end = Number(await AsyncStorage.getItem(accessKey(uid)));
  return Number.isFinite(end) && end > 0 ? end : 0;
}

export async function storeOfflinePremiumAccess(uid: string, end: number) {
  await AsyncStorage.setItem(accessKey(uid), String(end));
}

export async function verifyOfflinePremiumAccess(uid: string) {
  const snapshot = await getDocFromServer(doc(getFirestore(), "userSubscriptions", uid));
  return premiumAccessEnd((snapshot.data() as PremiumSubscription | undefined) ?? null);
}
