import type { ImageSource } from "expo-image";
import {
  DEFAULT_PROFILE_AVATAR,
  isProfileAvatarPath,
  type ProfileAvatarPath,
} from "../domain/profileAvatar";

const avatarSources: Record<ProfileAvatarPath, number> = {
  [DEFAULT_PROFILE_AVATAR]: require("@/assets/images/userAvatars/boy.png"),
  "assets/images/userAvatars/girl.png": require("@/assets/images/userAvatars/girl.png"),
  "assets/images/userAvatars/girl2.png": require("@/assets/images/userAvatars/girl2.png"),
  "assets/images/userAvatars/busDriver.png": require("@/assets/images/userAvatars/busDriver.png"),
};

export function getProfileAvatarSource(path?: string | null): ImageSource | number {
  if (isProfileAvatarPath(path)) return avatarSources[path];
  if (path && /^https?:\/\//i.test(path)) return { uri: path };
  return avatarSources[DEFAULT_PROFILE_AVATAR];
}
