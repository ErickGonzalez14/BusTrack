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
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: "system" | "light" | "dark";
};

export type UserProfile = {
  uid: string;
  fullName: string;
  nickname: string;
  normalizedNickname: string;
  email: string;
  photoUrl: string;
  accountStatus: "active" | "suspended";
  roles: UserRole;
  premium: UserPremium;
  preferences: UserPreferences;
};
