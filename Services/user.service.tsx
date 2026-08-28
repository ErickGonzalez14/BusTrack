import {
  doc,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export interface CreateUserProfileData {
  uid: string;
  nickname: string;
  fullName: string;
  email?: string;
  photoUrl?: string;
}

const normalizeNickname = (nickname: string) =>
  nickname
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "");

export const createUserProfile = async ({
  uid,
  nickname,
  fullName,
  email = "",
  photoUrl = "",
}: CreateUserProfileData) => {
  const cleanNickname = nickname.trim();
  const normalizedNickname = normalizeNickname(cleanNickname);

  if (!normalizedNickname) {
    throw new Error("El nombre de usuario no es válido.");
  }

  const userRef = doc(db, "Users", uid);
  const usernameRef = doc(db, "usernames", normalizedNickname);

  await runTransaction(db, async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef);

    if (usernameSnapshot.exists()) {
      throw new Error("Este nombre de usuario ya está registrado.");
    }

    // Reserva el nickname.
    transaction.set(usernameRef, {
      uid,
      createdAt: serverTimestamp(),
    });

    // Crea el perfil.
    transaction.set(userRef, {
      fullName: fullName.trim(),
      nickname: cleanNickname,
      normalizedNickname,
      email: email.trim().toLowerCase(),
      photoUrl,

      accountStatus: "active",

      roles: {
        passenger: true,
        driver: false,
        companyOwner: false,
      },

      premium: {
        active: false,
        plan: null,
        expiresAt: null,
      },

      preferences: {
        notificationsEnabled: true,
        locationEnabled: true,
        theme: "system",
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  });
};

export const userProfileExists = async (uid: string) => {
  const profileSnapshot = await getDoc(doc(db, "Users", uid));

  return profileSnapshot.exists();
};
