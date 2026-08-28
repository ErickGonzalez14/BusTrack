import { userProfileExists } from "@/Services/user.service";
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
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthFlowInProgress, setIsAuthFlowInProgress] = useState(false);

  useEffect(() => {
    let authRevision = 0;

    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      const currentRevision = ++authRevision;

      setUser(currentUser);
      setHasProfile(null);

      if (!currentUser) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const profileExists = await userProfileExists(currentUser.uid);

        if (currentRevision === authRevision) {
          setHasProfile(profileExists);
        }
      } catch (profileError) {
        console.error(
          "No se pudo consultar el perfil del usuario:",
          profileError,
        );

        if (currentRevision === authRevision) {
          setHasProfile(false);
        }
      } finally {
        if (currentRevision === authRevision) {
          setIsAuthLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      setHasProfile(null);
      return false;
    }

    const profileExists = await userProfileExists(currentUser.uid);
    setHasProfile(profileExists);

    return profileExists;
  }, []);

  const logOut = useCallback(async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Ya no existe una sesión activa.
    if (!currentUser) {
      setUser(null);
      setHasProfile(null);
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
    setHasProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hasProfile,
      isAuthLoading,
      isAuthFlowInProgress,
      beginAuthFlow: () => setIsAuthFlowInProgress(true),
      finishAuthFlow: () => setIsAuthFlowInProgress(false),
      refreshUserProfile,
      logOut,
    }),
    [
      hasProfile,
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
