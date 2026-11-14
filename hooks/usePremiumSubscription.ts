import { useAuth } from "@/contexts/authContext";
import {
  doc,
  getFirestore,
  onSnapshot,
  type Timestamp,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

type PremiumSubscription = {
  entitlement: "premium";
  status: "active" | "grace_period" | "expired";
  expiresAt: Timestamp | null;
  gracePeriodExpiresAt: Timestamp | null;
  willRenew: boolean;
};

type SubscriptionState =
  | { uid: string; status: "error" }
  | { uid: string; status: "ready"; subscription: PremiumSubscription | null };

export function usePremiumSubscription() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState<SubscriptionState>();
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!uid) return;

    const ref = doc(getFirestore(), "userSubscriptions", uid);
    return onSnapshot(
      ref,
      (snapshot) => {
        setNow(Date.now());
        setState({
          uid,
          status: "ready",
          subscription: snapshot.exists()
            ? (snapshot.data() as PremiumSubscription)
            : null,
        });
      },
      () => setState({ uid, status: "error" }),
    );
  }, [uid]);

  const current = uid && state?.uid === uid ? state : undefined;
  const subscription = current?.status === "ready" ? current.subscription : null;
  const expiresAt = subscription?.expiresAt?.toMillis() ?? 0;
  const graceEndsAt = subscription?.gracePeriodExpiresAt?.toMillis() ?? 0;
  const accessEndsAt = subscription?.status === "grace_period"
    ? Math.max(expiresAt, graceEndsAt)
    : expiresAt;

  useEffect(() => {
    if (accessEndsAt <= now) return;

    const timeout = setTimeout(
      () => setNow(Date.now()),
      Math.min(accessEndsAt - now, 2_147_483_647),
    );
    const appState = AppState.addEventListener("change", (status) => {
      if (status === "active") setNow(Date.now());
    });
    return () => {
      clearTimeout(timeout);
      appState.remove();
    };
  }, [accessEndsAt, now]);

  const hasAccess = subscription?.entitlement === "premium" &&
    subscription.status !== "expired" && accessEndsAt > now;

  return {
    status: current?.status ?? "loading",
    subscription,
    hasAccess,
    accessEndsAt,
  };
}
