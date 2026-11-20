import type { Timestamp } from "@react-native-firebase/firestore";

export type PremiumSubscription = {
  entitlement: "premium";
  status: "active" | "grace_period" | "expired";
  expiresAt: Timestamp | null;
  gracePeriodExpiresAt: Timestamp | null;
  willRenew: boolean;
};

export function premiumAccessEnd(subscription: PremiumSubscription | null) {
  if (subscription?.entitlement !== "premium") return 0;
  const expiresAt = subscription.expiresAt?.toMillis() ?? 0;
  if (subscription.status === "active") return expiresAt;
  if (subscription.status === "grace_period") {
    return Math.max(expiresAt, subscription.gracePeriodExpiresAt?.toMillis() ?? 0);
  }
  return 0;
}
