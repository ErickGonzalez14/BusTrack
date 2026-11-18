import {
  type CompleteProfileInput,
  completeProfileSchema,
} from "@/src/features/auth/domain/auth.schema";
import {
  createUserProfile,
  userProfileExists,
} from "@/src/features/auth/data/user.service";
import { useAuth } from "@/src/features/auth/context/authContext";
import { useMutation } from "@tanstack/react-query";

export const useCompleteProfile = () => {
  const { user, refreshUserProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: CompleteProfileInput) => {
      if (!user) {
        throw new Error("No hay una sesión activa.");
      }

      const validated = completeProfileSchema.parse(data);

      if (await userProfileExists(user.uid)) {
        await refreshUserProfile();
        return;
      }

      await createUserProfile({
        uid: user.uid,
        nickname: validated.nickname,
        fullName: validated.fullName,
        photoUrl: user.photoURL ?? "",
      });
      await refreshUserProfile();
    },
    retry: false,
  });
};
