import { useAuth } from "@/src/features/auth/context/authContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import {
  getPremiumEntitlement,
  premiumEntitlementQueryKey,
  premiumPurchasesConfigured,
} from "../data/premiumPurchases.service";
import { usePremiumSubscription } from "./usePremiumSubscription";

export function usePremiumAdVisibility() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { status, hasAccess } = usePremiumSubscription();
  const checkStore = Boolean(uid && premiumPurchasesConfigured && !hasAccess);
  const entitlement = useQuery({
    queryKey: premiumEntitlementQueryKey(uid),
    queryFn: () => {
      if (!uid) throw new Error("Inicia sesión para consultar Premium.");
      return getPremiumEntitlement(uid);
    },
    enabled: checkStore,
    refetchInterval: (query) => query.state.data ? 5 * 60_000 : false,
  });
  const { refetch } = entitlement;

  useEffect(() => {
    if (!checkStore) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refetch({ cancelRefetch: false });
    });
    return () => subscription.remove();
  }, [checkStore, refetch]);

  return Boolean(uid) &&
    status === "ready" &&
    !hasAccess &&
    (!premiumPurchasesConfigured || (entitlement.isSuccess && entitlement.data === null));
}
