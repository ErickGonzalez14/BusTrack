import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../context/authContext";

export function useEditNickname(onSaved: () => void) {
  const { profile, updateProfileNickname } = useAuth();
  const currentNickname = profile?.nickname ?? "";
  const [nickname, setNickname] = useState(currentNickname);
  const { error, isPending, mutate, reset } = useMutation({
    mutationFn: updateProfileNickname,
    onSuccess: onSaved,
  });
  const canSave = Boolean(profile && nickname.trim() && nickname.trim() !== currentNickname) && !isPending;

  return {
    nickname,
    changeNickname: (value: string) => {
      if (error) reset();
      setNickname(value);
    },
    canSave,
    isPending,
    error,
    save: () => {
      if (canSave) mutate(nickname);
    },
  };
}
