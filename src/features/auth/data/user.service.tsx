import { UserProfile } from "@/src/features/auth/domain/user.type";
import { nicknameSchema } from "../domain/auth.schema";
import {
  DEFAULT_PROFILE_AVATAR,
  isProfileAvatarPath,
  type ProfileAvatarPath,
} from "../domain/profileAvatar";
import { getAuth } from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getDocFromCache,
  getFirestore,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
const auth = getAuth();

const db = getFirestore();

export interface CreateUserProfileData {
  uid: string;
  nickname: string;
  fullName: string;
  email?: string;
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
      photo: {
        url: DEFAULT_PROFILE_AVATAR,
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  });
};

export async function updateUserAvatar(uid: string, avatarPath: ProfileAvatarPath) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error("Debes iniciar sesión para cambiar tu avatar.");
  }
  if (!isProfileAvatarPath(avatarPath)) {
    throw new Error("Selecciona un avatar de la lista.");
  }

  await updateDoc(doc(db, "Users", uid), {
    photo: { url: avatarPath },
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserNickname(uid: string, input: string) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error("Debes iniciar sesión para cambiar tu nombre de usuario.");
  }

  const parsed = nicknameSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const nickname = parsed.data;
  const normalizedNickname = normalizeNickname(nickname);
  const userRef = doc(db, "Users", uid);
  const usernameRef = doc(db, "usernames", normalizedNickname);

  await runTransaction(db, async (transaction) => {
    const profile = (await transaction.get(userRef)).data();
    if (!profile) throw new Error("No se encontró tu perfil.");

    const username = await transaction.get(usernameRef);
    if (username.exists() && username.data()?.uid !== uid) {
      throw new Error("Este nombre de usuario ya está registrado.");
    }

    const previousName = profile.normalizedNickname || profile.nickname;
    const previousId = typeof previousName === "string" ? normalizeNickname(previousName) : "";
    const previousRef = previousId && previousId !== normalizedNickname
      ? doc(db, "usernames", previousId)
      : null;
    const previousUsername = previousRef ? await transaction.get(previousRef) : null;

    if (!username.exists()) {
      transaction.set(usernameRef, { uid, createdAt: serverTimestamp() });
    }
    if (previousRef && previousUsername?.data()?.uid === uid) {
      transaction.delete(previousRef);
    }
    transaction.update(userRef, { nickname, normalizedNickname, updatedAt: serverTimestamp() });
  });

  return { nickname, normalizedNickname };
}

export const userProfileExists = async (uid: string) => {
  const profileSnapshot = await getDoc(doc(db, "Users", uid));

  return profileSnapshot.exists();
};

export const getUserProfile = async (
  uid: string,
  source: "default" | "cache" = "default",
): Promise<UserProfile | null> => {
  const reference = doc(db, "Users", uid);
  const snapshot = await (source === "cache" ? getDocFromCache(reference) : getDoc(reference));
  const email = auth.currentUser?.email ?? null;

  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  const savedPhoto = typeof data.photo?.url === "string" ? data.photo.url.trim() : "";
  const legacyPhoto = typeof data.photoUrl === "string" ? data.photoUrl.trim() : "";
  const photoUrl = isProfileAvatarPath(savedPhoto)
    ? savedPhoto
    : legacyPhoto || savedPhoto || DEFAULT_PROFILE_AVATAR;
  return {
    uid: snapshot.id,
    fullName: data.fullName ?? "",
    nickname: data.nickname ?? "",
    normalizedNickname: data.normalizedNickname ?? "",
    email: email ?? "",
    accountStatus: data.accountStatus ?? "active",

    photo: {
      url: photoUrl,
      publicId: isProfileAvatarPath(photoUrl)
        ? ""
        : data.photoPublicId ?? data.photo?.publicId ?? "",
    },

    roles: {
      passenger: data.roles?.passenger ?? true,
      driver: data.roles?.driver ?? false,
      companyOwner: data.roles?.companyOwner ?? false,
    },

    premium: {
      active: data.premium?.active ?? false,
      plan: data.premium?.plan ?? null,
      expiresAt: data.premium?.expiresAt ?? null,
    },

    preferences: {
      language: data.preferences?.language ?? "es",
      notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
      locationEnabled: data.preferences?.locationEnabled ?? true,
      theme: data.preferences?.theme ?? "system",
    },
  };
};
