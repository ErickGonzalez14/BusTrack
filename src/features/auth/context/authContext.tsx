import { removeRoutinePushDevice } from "@/src/features/routines/data/routinePushDevices";
import { UserProfile } from "@/src/features/auth/domain/user.type";
import { getUserProfile, updateUserAvatar, updateUserNickname } from "@/src/features/auth/data/user.service";
import type { ProfileAvatarPath } from "@/src/features/auth/domain/profileAvatar";
import { stopBusTracking } from "@/src/features/tracking/data/busTrackingControl.service";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  type User,
} from "@react-native-firebase/auth";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  hasProfile: boolean | null;
  isAuthLoading: boolean;
  isAuthFlowInProgress: boolean;
  beginAuthFlow: () => void;
  finishAuthFlow: () => void;
  refreshUserProfile: () => Promise<boolean>;
  updateProfileAvatar: (avatarPath: ProfileAvatarPath) => Promise<void>;
  updateProfileNickname: (nickname: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthFlowInProgress, setIsAuthFlowInProgress] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let authRevision = 0;

    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      const currentRevision = ++authRevision;

      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setIsAuthLoading(false);
        setProfile(null);
        setUser(null);
        return;
      }
      const cachedProfile = await getUserProfile(currentUser.uid, "cache").catch(() => null);
      if (currentRevision !== authRevision) return;
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsAuthLoading(false);
      }

      try {
        const currentProfile = await getUserProfile(currentUser.uid);

        if (currentRevision === authRevision) {
          setProfile((profile) => profile === cachedProfile ? currentProfile : profile);
        }
      } catch (profileError) {
        console.error(
          "No se pudo consultar el perfil del usuario:",
          profileError,
        );
      } finally {
        if (currentRevision === authRevision) {
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      authRevision++;
      unsubscribe();
    };
  }, []);

  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      setProfile(null);
      return false;
    }

    const currentProfile = await getUserProfile(currentUser.uid);

    setProfile(currentProfile);

    return currentProfile !== null;
  }, []);

  const updateProfileAvatar = useCallback(async (avatarPath: ProfileAvatarPath) => {
    const uid = user?.uid;
    if (!uid) throw new Error("Debes iniciar sesión para cambiar tu avatar.");

    await updateUserAvatar(uid, avatarPath);
    setProfile((currentProfile) =>
      currentProfile?.uid === uid
        ? { ...currentProfile, photo: { url: avatarPath, publicId: "" } }
        : currentProfile,
    );
  }, [user?.uid]);

  const updateProfileNickname = useCallback(async (nickname: string) => {
    const uid = user?.uid;
    if (!uid) throw new Error("Debes iniciar sesión para cambiar tu nombre de usuario.");

    const names = await updateUserNickname(uid, nickname);
    setProfile((currentProfile) =>
      currentProfile?.uid === uid ? { ...currentProfile, ...names } : currentProfile,
    );
  }, [user?.uid]);

  const logOut = useCallback(async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Ya no existe una sesión activa.
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      return;
    }

    const isGoogleUser = currentUser.providerData.some(
      ({ providerId }) => providerId === "google.com",
    );

    try {
      await stopBusTracking();
    } catch (trackingError) {
      console.warn("No se pudo retirar la ubicación del bus al salir:", trackingError);
    }

    try {
      await removeRoutinePushDevice(currentUser.uid);
    } catch (error) {
      console.warn("No se pudo retirar el registro de recordatorios:", error);
    }

    if (isGoogleUser) {
      try {
        await GoogleOneTapSignIn.signOut();
      } catch (googleError) {
        console.warn(
          "No se pudo cerrar la sesión local de Google:",
          googleError,
        );
      }
    }

    // Google Sign-In pudo tardar y la sesión pudo cambiar.
    if (auth.currentUser) {
      await signOut(auth);
    }

    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      hasProfile: profile !== null,
      isAuthLoading,
      isAuthFlowInProgress,
      beginAuthFlow: () => setIsAuthFlowInProgress(true),
      finishAuthFlow: () => setIsAuthFlowInProgress(false),
      refreshUserProfile,
      updateProfileAvatar,
      updateProfileNickname,
      logOut,
    }),
    [
      profile,
      isAuthFlowInProgress,
      isAuthLoading,
      logOut,
      refreshUserProfile,
      updateProfileAvatar,
      updateProfileNickname,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
