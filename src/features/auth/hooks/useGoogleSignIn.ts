import { signInWithGoogle } from "@/src/features/auth/data/googleAuth.service";
import { useMutation } from "@tanstack/react-query";

export const useGoogleSignIn = () => {
  return useMutation({
    mutationFn: signInWithGoogle,
    retry: false,
  });
};
