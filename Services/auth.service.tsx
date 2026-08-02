import {
  createUserWithEmailAndPassword,
  getAuth,
} from "@react-native-firebase/auth";

const auth = getAuth();

export const signUp = async (data: { email: string; password: string }) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );

  return userCredential;
};
