import {
    doc,
    getDoc,
    getFirestore,
    serverTimestamp,
    setDoc,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export interface CreateUserProfileData {
  uid: string;
  nickname: string;
  fullName: string;
  photoUrl?: string;
}

export const createUserProfile = async ({
  uid,
  nickname,
  fullName,
  photoUrl = "",
}: CreateUserProfileData) => {
  await setDoc(doc(db, "Users", uid), {
    nickname,
    fullName,
    role: "passenger",
    isPremium: false,
    premiumExpireAt: null,
    photoUrl,
    createdAt: serverTimestamp(),
  });
};

export const userProfileExists = async (uid: string) => {
  const profileSnapshot = await getDoc(doc(db, "Users", uid));

  return profileSnapshot.exists();
};
