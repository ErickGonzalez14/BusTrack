import {
  isPremiumTestStore,
  premiumEntitlementQueryKey,
  premiumPurchasesAvailable,
  premiumPurchasesConfigured,
  withPremiumPurchases,
} from "@/src/features/premium/data/premiumPurchases.service";
import { useAuth } from "@/src/features/auth/context/authContext";
import { syncPremiumPurchase } from "@/src/features/premium/data/premiumSync.service";
import { getAuth } from "@react-native-firebase/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type {
  PurchasesEntitlementInfo,
  PurchasesPackage,
} from "react-native-purchases";

type CheckoutOffer = {
  monthly: PurchasesPackage | null;
  premium: PurchasesEntitlementInfo | null;
};

export function usePremiumCheckout(enabled = true) {
  const { user } = useAuth();
  const uid = user?.uid;
  const queryClient = useQueryClient();
  const queryKey = ["premium-offer", uid] as const;
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const operationInProgress = useRef(false);
  const offer = useQuery<CheckoutOffer>({
    queryKey,
    enabled: Boolean(enabled && uid && premiumPurchasesConfigured),
    staleTime: 0,
    retry: false,
    queryFn: () => {
      if (!uid) throw new Error("Inicia sesión para consultar Premium.");
      return withPremiumPurchases(uid, async (sdk) => {
        const customer = await sdk.getCustomerInfo();
        const premium = customer.entitlements.active.premium;
        if (premium) {
          return { monthly: null, premium };
        }
        const offerings = await sdk.getOfferings();
        return {
          monthly: offerings.current?.monthly ?? null,
          premium: null,
        };
      });
    },
  });

  const sync = useCallback(async () => {
    if (!uid) return;
    setSyncing(true);
    setSyncError(null);
    try {
      const verified = await syncPremiumPurchase(uid);
      if (!verified && getAuth().currentUser?.uid === uid) {
        setSyncError("RevenueCat aún no confirma el acceso en el servidor.");
      }
    } catch (error) {
      if (getAuth().currentUser?.uid === uid) {
        setSyncError((error as Error).message);
      }
    } finally {
      setSyncing(false);
    }
  }, [uid]);

  useEffect(() => {
    if (offer.data?.premium) void sync();
  }, [offer.data?.premium, sync]);

  async function runPurchase(monthly?: PurchasesPackage) {
    if (!uid || operationInProgress.current) return;
    operationInProgress.current = true;
    setBusy(true);
    try {
      const premium = await withPremiumPurchases(uid, async (sdk, checkAccount) => {
        if (!monthly) {
          return (await sdk.restorePurchases()).entitlements.active.premium;
        }

        const existing = await sdk.getCustomerInfo();
        if (existing.entitlements.active.premium) {
          return existing.entitlements.active.premium;
        }
        checkAccount();
        const { customerInfo } = await sdk.purchasePackage(monthly);
        return customerInfo.entitlements.active.premium;
      });
      if (premium) {
        const entitlementKey = premiumEntitlementQueryKey(uid);
        await queryClient.cancelQueries({ queryKey: entitlementKey, exact: true });
        queryClient.setQueryData(entitlementKey, premium);
        await queryClient.cancelQueries({ queryKey, exact: true });
        queryClient.setQueryData<CheckoutOffer>(queryKey, { monthly: null, premium });
      } else {
        Alert.alert(
          "BusTrack Premium",
          monthly
            ? "La tienda aún no confirma el acceso. Revisa tus suscripciones en la tienda."
            : "La tienda no encontró una suscripción Premium activa.",
        );
      }
    } catch (error) {
      const cancelled = (error as { userCancelled?: boolean } | null)
        ?.userCancelled === true;
      if (!cancelled && getAuth().currentUser?.uid === uid) {
        Alert.alert(
          "BusTrack Premium",
          monthly
            ? "No se pudo confirmar la compra. Revisa el estado en la tienda antes de volver a intentarlo."
            : "No se pudieron restaurar las compras. Inténtalo de nuevo.",
        );
      }
    } finally {
      operationInProgress.current = false;
      setBusy(false);
    }
  }

  return {
    available: premiumPurchasesAvailable,
    configured: premiumPurchasesConfigured,
    isTestStore: isPremiumTestStore,
    busy,
    monthly: offer.data?.monthly ?? null,
    loading: offer.isFetching,
    premium: offer.data?.premium ?? null,
    syncing,
    syncError,
    retrySync: () => void sync(),
    reload: () => void offer.refetch(),
    purchase: () => {
      if (offer.data?.monthly) {
        void runPurchase(offer.data.monthly);
      }
    },
    restore: () => void runPurchase(),
  };
}
