import { SignUpInput, signUpSchema } from "@/src/features/auth/domain/auth.schema";
import { signUp } from "@/src/features/auth/data/auth.service";
import { createUserProfile } from "@/src/features/auth/data/user.service";
import { deleteUser } from "@react-native-firebase/auth";
import { useMutation } from "@tanstack/react-query";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const validated = signUpSchema.parse(data);

      const credential = await signUp({
        email: validated.email,
        password: validated.password,
      });

      try {
        await createUserProfile({
          uid: credential.user.uid,
          nickname: validated.nickname,
          fullName: validated.fullName,
        });
        return credential;
      } catch (profileError) {
        //esto es para en caso de que falle se borre el registro de un usuario incompleto
        try {
          await deleteUser(credential.user);
        } catch (rollbackError) {
          console.error(
            "No se pudo revertir la cuenta incompleta:",
            rollbackError,
          );
        }
        throw profileError;
      }
    },
  });
};
