import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/authContext";

export function useEditProfileAvatar() {
  const { profile, updateProfileAvatar } = useAuth();
  const mutation = useMutation({ mutationFn: updateProfileAvatar });

  return { profile, ...mutation };
}
