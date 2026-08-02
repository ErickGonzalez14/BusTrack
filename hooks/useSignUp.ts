import { SignUpInput, signUpSchema } from "@/Schemas/auth.schema";
import { signUp } from "@/Services/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const validated = signUpSchema.parse(data);

      return signUp(validated);
    },
  });
};
