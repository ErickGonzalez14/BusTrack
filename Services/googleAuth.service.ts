import { userProfileExists } from "@/Services/user.service";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

GoogleOneTapSignIn.configure({
  webClientId: "autoDetect",
});

export type GoogleAuthResult =
  | { status: "cancelled" }
  | {
      status: "authenticated";
      hasProfile: boolean;
      uid: string;
    };

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  await GoogleOneTapSignIn.checkPlayServices();

  const response = await GoogleOneTapSignIn.presentExplicitSignIn();

  if (isCancelledResponse(response)) {
    return { status: "cancelled" };
  }

  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error("Google no devolvió un token de identidad válido.");
  }

  const googleCredential = GoogleAuthProvider.credential(
    response.data.idToken,
  );
  const userCredential = await signInWithCredential(
    getAuth(),
    googleCredential,
  );
  const hasProfile = await userProfileExists(userCredential.user.uid);

  return {
    status: "authenticated",
    hasProfile,
    uid: userCredential.user.uid,
  };
};
