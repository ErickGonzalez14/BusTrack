import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
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

export const SignIn = async (data: { email: string; password: string }) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );

  return userCredential;
};
