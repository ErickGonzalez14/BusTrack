import { SignInInput, signInSchema } from "@/Schemas/auth.schema";
import { signIn } from "@/Services/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useLogIn = () => {
  return useMutation({
    mutationFn: async (data: SignInInput) => {
      const validated = signInSchema.parse(data);

      const credential = await signIn(validated);
      return credential;
    },
    retry: false,
  });
};
