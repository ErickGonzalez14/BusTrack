/* eslint-disable max-len, require-jsdoc */
import {FieldValue, Timestamp, type Firestore} from "firebase-admin/firestore";

export const PREMIUM_ENTITLEMENT = "premium";

export type RevenueCatCustomer = {
  request_date_ms: number;
  subscriber: {
    entitlements: Record<string, {
      product_identifier: string;
      expires_date: string | null;
      grace_period_expires_date?: string | null;
    }>;
    subscriptions: Record<string, {
      store: string;
      is_sandbox: boolean;
      unsubscribe_detected_at?: string | null;
      billing_issues_detected_at?: string | null;
      grace_period_expires_date?: string | null;
    }>;
  };
};

export type RevenueCatEvent = {
  type?: string;
  environment?: string;
  store?: string;
  app_user_id?: string;
  transferred_from?: string[];
  transferred_to?: string[];
};

export function hasPremiumAccess(data: FirebaseFirestore.DocumentData | undefined) {
  if (!data || data.entitlement !== PREMIUM_ENTITLEMENT) return false;
  const expiresAt = data.expiresAt as Timestamp | null;
  const graceAt = data.gracePeriodExpiresAt as Timestamp | null;
  const accessEndsAt = data.status === "grace_period" ?
    Math.max(expiresAt?.toMillis() ?? 0, graceAt?.toMillis() ?? 0) :
    expiresAt?.toMillis() ?? 0;
  return data.status !== "expired" && accessEndsAt > Date.now();
}

type SyncOptions = {
  apiKey: string;
  allowSandbox: boolean;
  requireExplicitProductionFlag: boolean;
  timeoutMs: number;
};

export async function syncRevenueCatSubscription(
  db: Firestore,
  uid: string,
  options: SyncOptions,
) {
  const url = "https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(uid);
  const result = await fetch(url, {
    headers: {Authorization: `Bearer ${options.apiKey}`},
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!result.ok) throw new Error(`RevenueCat HTTP ${result.status}`);
  const customer = await result.json() as RevenueCatCustomer;
  const checkedAt = customer.request_date_ms;
  if (!Number.isSafeInteger(checkedAt) || checkedAt <= 0) {
    throw new Error("Respuesta inválida de RevenueCat");
  }

  const premium = customer.subscriber.entitlements[PREMIUM_ENTITLEMENT];
  const productId = premium?.product_identifier ?? null;
  const product = productId ? customer.subscriber.subscriptions[productId] ??
    customer.subscriber.subscriptions[productId.split(":")[0]] : undefined;
  const isSandbox = product?.is_sandbox === true || product?.store.toLowerCase() === "test_store";
  const allowed = Boolean(product && (isSandbox ? options.allowSandbox :
    !options.requireExplicitProductionFlag || product.is_sandbox === false));
  const expiresAt = allowed ? parseDate(premium?.expires_date) : null;
  const gracePeriodExpiresAt = allowed ? parseDate(
    premium?.grace_period_expires_date ?? product?.grace_period_expires_date,
  ) : null;
  const active = (expiresAt?.toMillis() ?? 0) > checkedAt;
  const grace = (gracePeriodExpiresAt?.toMillis() ?? 0) > checkedAt;
  const status = grace && (!active || product?.billing_issues_detected_at) ?
    "grace_period" : active ? "active" : "expired";
  const ref = db.collection("userSubscriptions").doc(uid);
  await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ref);
    if ((previous.get("revenueCatCheckedAtMs") ?? 0) >= checkedAt) return;
    if (!previous.exists && !allowed) return;
    transaction.set(ref, {
      entitlement: PREMIUM_ENTITLEMENT, status, expiresAt, gracePeriodExpiresAt,
      willRenew: status === "active" && !product?.unsubscribe_detected_at &&
        !product?.billing_issues_detected_at,
      store: allowed ? product?.store ?? null : null,
      productId: allowed ? productId : null,
      revenueCatCheckedAtMs: checkedAt,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) throw new Error("Fecha de RevenueCat inválida");
  return Timestamp.fromMillis(milliseconds);
}

