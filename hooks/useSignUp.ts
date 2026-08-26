import { SignUpInput, signUpSchema } from "@/Schemas/auth.schema";
import { signUp } from "@/Services/auth.service";
import { createUserProfile } from "@/Services/user.service";
import { deleteUser } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const validated = signUpSchema.parse(data);

      const credential = await signUp(validated);

      try {
        await createUserProfile({
          uid: credential.user.uid,
          nickname: validated.nickname,
          fullName: validated.fullName,
        });
      } catch (profileError) {
        await deleteUser(credential.user);
        throw profileError;
      }

      return credential;
    },
  });
};
