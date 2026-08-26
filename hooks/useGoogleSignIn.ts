import { signInWithGoogle } from "@/Services/googleAuth.service";
import { useMutation } from "@tanstack/react-query";

export const useGoogleSignIn = () => {
  return useMutation({
    mutationFn: signInWithGoogle,
    retry: false,
  });
};
