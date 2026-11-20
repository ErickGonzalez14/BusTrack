export const DEFAULT_PROFILE_AVATAR = "assets/images/userAvatars/boy.png";

export const PROFILE_AVATARS = [
  { path: DEFAULT_PROFILE_AVATAR, label: "Chico" },
  { path: "assets/images/userAvatars/girl.png", label: "Chica" },
  { path: "assets/images/userAvatars/girl2.png", label: "Chica 2" },
  { path: "assets/images/userAvatars/busDriver.png", label: "Conductor" },
] as const;

export type ProfileAvatarPath = (typeof PROFILE_AVATARS)[number]["path"];

export function isProfileAvatarPath(path: unknown): path is ProfileAvatarPath {
  return PROFILE_AVATARS.some((avatar) => avatar.path === path);
}
