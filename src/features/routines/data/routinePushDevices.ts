import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, GeoPoint, getFirestore, runTransaction, setDoc } from "@react-native-firebase/firestore";

const deviceRef = (userId: string) => doc(getFirestore(), "routinePushDevices", userId);
const localTokenKey = (userId: string) => `@bustrack/routine-push/${userId}`;
const signingOut = new Set<string>();

export async function unregisterRoutinePushDevice(userId: string) {
  const token = await AsyncStorage.getItem(localTokenKey(userId));
  if (!token) return;
  const reference = deviceRef(userId);
  await runTransaction(getFirestore(), async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.data()?.token === token) transaction.delete(reference);
  });
  await AsyncStorage.removeItem(localTokenKey(userId));
}

export function removeRoutinePushDevice(userId: string) {
  signingOut.add(userId);
  return unregisterRoutinePushDevice(userId);
}

export function resumeRoutinePushRegistration(userId: string) {
  signingOut.delete(userId);
}

export function isRoutinePushSigningOut(userId: string) {
  return signingOut.has(userId);
}

export async function saveRoutinePushDevice(
  userId: string,
  token: string,
  coordinate: { latitude: number; longitude: number },
  canRegister: () => boolean,
) {
  await AsyncStorage.setItem(localTokenKey(userId), token);
  if (canRegister()) {
    await setDoc(deviceRef(userId), {
      token,
      origin: new GeoPoint(coordinate.latitude, coordinate.longitude),
    });
  }
}
