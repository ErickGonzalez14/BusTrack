import { useAuth } from "@/src/features/auth/context/authContext";
import {
  doc,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { premiumAccessEnd, type PremiumSubscription } from "../domain/premiumSubscription";

type SubscriptionState =
  | { uid: string; status: "error" }
  | { uid: string; status: "ready"; subscription: PremiumSubscription | null; fromCache: boolean };

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
      { includeMetadataChanges: true },
      (snapshot) => {
        setNow(Date.now());
        setState({
          uid,
          status: "ready",
          fromCache: snapshot.metadata.fromCache,
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
  const accessEndsAt = premiumAccessEnd(subscription);

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

  const hasAccess = accessEndsAt > now;

  return {
    status: current?.status ?? "loading",
    subscription,
    hasAccess,
    accessEndsAt,
    isFromServer: current?.status === "ready" && !current.fromCache,
  };
}
