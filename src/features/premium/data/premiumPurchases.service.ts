import { getAuth } from "@react-native-firebase/auth";
import { Platform } from "react-native";
import type Purchases from "react-native-purchases";

export const premiumPurchasesAvailable =
  Platform.OS === "android" || Platform.OS === "ios";

const testApiKey = __DEV__
  ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY?.trim()
  : undefined;
const storeApiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim(),
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim(),
});
const storePrefix = Platform.OS === "ios" ? "appl_" : "goog_";

export const isPremiumTestStore = testApiKey?.startsWith("test_") === true;
const apiKey = testApiKey
  ? (isPremiumTestStore ? testApiKey : undefined)
  : (storeApiKey?.startsWith(storePrefix) ? storeApiKey : undefined);

export const premiumPurchasesConfigured = premiumPurchasesAvailable && Boolean(apiKey);

export const premiumEntitlementQueryKey = (uid?: string) =>
  ["premium-entitlement", uid] as const;

export function getPremiumEntitlement(uid: string) {
  return withPremiumPurchases(uid, async (sdk) => {
    const customer = await sdk.getCustomerInfo();
    return customer.entitlements.active.premium ?? null;
  });
}

let pending: Promise<unknown> = Promise.resolve();

export function withPremiumPurchases<T>(
  uid: string,
  action: (sdk: typeof Purchases, checkAccount: () => void) => Promise<T>,
): Promise<T> {
  function checkAccount() {
    if (getAuth().currentUser?.uid !== uid) {
      throw new Error("La sesión cambió. Vuelve a abrir Suscripciones.");
    }
  }

  const operation = pending.then(async () => {
    checkAccount();
    if (!premiumPurchasesAvailable || !apiKey) {
      throw new Error("Las compras de Premium no están disponibles en esta versión.");
    }

    const { default: sdk } = await import("react-native-purchases");
    if (!(await sdk.isConfigured())) {
      checkAccount();
      sdk.configure({ apiKey, appUserID: uid });
    }
    if ((await sdk.getAppUserID()) !== uid) {
      checkAccount();
      await sdk.logIn(uid);
    }
    checkAccount();

    const result = await action(sdk, checkAccount);
    checkAccount();
    return result;
  });

  pending = operation.catch(() => undefined);
  return operation;
}
