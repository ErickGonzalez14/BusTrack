import { SignUpInput, signUpSchema } from "@/Schemas/auth.schema";
import { signUp } from "@/Services/auth.service";
import { createUserProfile } from "@/Services/user.service";
import { useMutation } from "@tanstack/react-query";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const validated = signUpSchema.parse(data);

      const credential = await signUp(validated);

      await createUserProfile({
        uid: credential.user.uid,
        nickname: validated.nickname,
        fullName: validated.nickname,
      });

      return credential;
    },
  });
};
