export type UserRole = {
  passenger: boolean;
  driver: boolean;
  companyOwner: boolean;
};

export type UserPremium = {
  active: boolean;
  plan: string | null;
  expiresAt: unknown;
};

export type UserPreferences = {
  language: "es" | "en";
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: "system" | "light" | "dark";
};
export type photo = {
  url: string;
  publicId: string;
};

export type UserProfile = {
  uid: string;
  fullName: string;
  nickname: string;
  normalizedNickname: string;
  email: string;
  photo: photo | null;
  accountStatus: "active" | "suspended";
  roles: UserRole;
  premium: UserPremium;
  preferences: UserPreferences;
};
