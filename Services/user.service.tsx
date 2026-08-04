import {
    doc,
    getFirestore,
    serverTimestamp,
    setDoc,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export interface CreateUserProfileData {
  uid: string;
  nickname: string;
  fullName: string;
}

export const createUserProfile = async ({
  uid,
  nickname,
  fullName,
}: CreateUserProfileData) => {
  await setDoc(doc(db, "Users", uid), {
    nickname,
    fullName,
    role: "passenger",
    isPremium: false,
    premiumExpireAt: null,
    photoUrl: "",
    createdAt: serverTimestamp(),
  });
};
