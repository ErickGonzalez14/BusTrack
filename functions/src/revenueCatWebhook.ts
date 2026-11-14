import {timingSafeEqual} from "node:crypto";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {defineBoolean, defineSecret} from "firebase-functions/params";
import {onRequest} from "firebase-functions/v2/https";

const app = initializeApp();
const revenueCatApiKey = defineSecret("REVENUECAT_API_KEY");
const webhookToken = defineSecret("REVENUECAT_WEBHOOK_TOKEN");
const allowSandbox = defineBoolean("REVENUECAT_ALLOW_SANDBOX", {
  default: false,
});
const entitlement = "premium";

type RevenueCatCustomer = {
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

type RevenueCatEvent = {
  type?: string;
  environment?: string;
  store?: string;
  app_user_id?: string;
  transferred_from?: string[];
  transferred_to?: string[];
};

/**
 * Converts a RevenueCat date into a Firestore timestamp.
 * @param {string|null} value The date from RevenueCat.
 * @return {Timestamp|null} The timestamp, if a date is present.
 */
function parseDate(value?: string | null): Timestamp | null {
  if (!value) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) {
    throw new Error("Invalid RevenueCat date");
  }
  return Timestamp.fromMillis(milliseconds);
}

/**
 * Identifies the Firebase accounts whose access may have changed.
 * @param {RevenueCatEvent} event The authenticated webhook event.
 * @return {string[]} The candidate Firebase UIDs.
 */
function getUserIds(event: RevenueCatEvent): string[] {
  const candidates = event.type === "TRANSFER" ?
    [...event.transferred_from ?? [], ...event.transferred_to ?? []] :
    [event.app_user_id];

  return [...new Set(candidates.filter((uid): uid is string =>
    typeof uid === "string" && uid.length > 0 && uid.length <= 128 &&
    !uid.startsWith("$RCAnonymousID:") && !uid.includes("/") &&
    uid !== "." && uid !== ".." && !/^__.*__$/.test(uid),
  ))];
}

/**
 * Refreshes a user's entitlement from RevenueCat and saves it in Firestore.
 * @param {string} uid The Firebase UID used as a RevenueCat App User ID.
 */
async function syncSubscription(uid: string): Promise<void> {
  try {
    await getAuth(app).getUser(uid);
  } catch (error) {
    if ((error as {code?: string}).code === "auth/user-not-found") return;
    throw error;
  }

  const url = "https://api.revenuecat.com/v1/subscribers/" +
    encodeURIComponent(uid);
  const result = await fetch(url, {
    headers: {Authorization: `Bearer ${revenueCatApiKey.value()}`},
    signal: AbortSignal.timeout(10_000),
  });
  if (!result.ok) {
    throw new Error(`RevenueCat returned HTTP ${result.status}`);
  }

  const customer = await result.json() as RevenueCatCustomer;
  const checkedAt = customer.request_date_ms;
  if (!Number.isSafeInteger(checkedAt) || checkedAt <= 0) {
    throw new Error("Missing RevenueCat response timestamp");
  }

  const premium = customer.subscriber.entitlements[entitlement];
  const productId = premium?.product_identifier ?? null;
  const product = productId ?
    customer.subscriber.subscriptions[productId] : undefined;
  const isTestStore = product?.store.toLowerCase() === "test_store";
  const allowed = product && (
    (!isTestStore && product.is_sandbox === false) ||
    ((isTestStore || product.is_sandbox === true) && allowSandbox.value())
  );
  const expiresAt = allowed ? parseDate(premium?.expires_date) : null;
  const gracePeriodExpiresAt = allowed ? parseDate(
    premium?.grace_period_expires_date ?? product.grace_period_expires_date,
  ) : null;
  const isActive = (expiresAt?.toMillis() ?? 0) > checkedAt;
  const isInGracePeriod = (gracePeriodExpiresAt?.toMillis() ?? 0) > checkedAt;
  const status = isInGracePeriod && (!isActive ||
    product?.billing_issues_detected_at) ? "grace_period" :
    isActive ? "active" : "expired";
  const willRenew = status === "active" && !product?.unsubscribe_detected_at &&
    !product?.billing_issues_detected_at;

  const db = getFirestore(app);
  const ref = db.collection("userSubscriptions").doc(uid);
  await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(ref);
    if ((previous.get("revenueCatCheckedAtMs") ?? 0) >= checkedAt) return;
    if (!previous.exists && !allowed) return;

    transaction.set(ref, {
      entitlement,
      status,
      expiresAt,
      gracePeriodExpiresAt,
      willRenew,
      store: allowed ? product.store : null,
      productId: allowed ? productId : null,
      revenueCatCheckedAtMs: checkedAt,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export const revenueCatWebhook = onRequest(
  {maxInstances: 10, secrets: [revenueCatApiKey, webhookToken]},
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST").sendStatus(405);
      return;
    }

    const provided = Buffer.from(request.get("Authorization") ?? "");
    const expected = Buffer.from(`Bearer ${webhookToken.value()}`);
    if (provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)) {
      response.sendStatus(401);
      return;
    }

    const body = request.body as {event?: RevenueCatEvent} | undefined;
    const event = body?.event;
    if (typeof event?.type !== "string") {
      response.sendStatus(400);
      return;
    }
    const isSandbox = event.environment === "SANDBOX" ||
      event.store === "TEST_STORE";
    if (event.type === "TEST" || (isSandbox && !allowSandbox.value())) {
      response.sendStatus(204);
      return;
    }

    try {
      await Promise.all(getUserIds(event).map(syncSubscription));
      response.sendStatus(204);
    } catch (error) {
      logger.error("No se pudo sincronizar RevenueCat", error);
      response.sendStatus(500);
    }
  },
);
