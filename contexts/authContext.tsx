import { UserProfile } from "@/interfaces/user.type";
import { getUserProfile } from "@/Services/user.service";
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
      const currentProfile = await getUserProfile(currentUser.uid);
      setUser(currentUser);
      setProfile(currentProfile);
      setIsAuthLoading(false);

      try {
        const profileExists = await getUserProfile(currentUser.uid);

        if (currentRevision === authRevision) {
          setProfile(profileExists);
        }
      } catch (profileError) {
        console.error(
          "No se pudo consultar el perfil del usuario:",
          profileError,
        );

        if (currentRevision === authRevision) {
          setProfile(null);
        }
      } finally {
        if (currentRevision === authRevision) {
          setIsAuthLoading(false);
        }
      }
    });

    return unsubscribe;
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
      logOut,
    }),
    [
      profile,
      isAuthFlowInProgress,
      isAuthLoading,
      logOut,
      refreshUserProfile,
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
