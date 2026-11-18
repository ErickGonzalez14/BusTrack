import {timingSafeEqual} from "node:crypto";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {
  hasPremiumAccess,
  syncRevenueCatSubscription,
  type RevenueCatEvent,
} from "./premiumSubscription";
import * as logger from "firebase-functions/logger";
import {defineBoolean, defineSecret} from "firebase-functions/params";
import {onRequest} from "firebase-functions/v2/https";

const app = initializeApp();
const revenueCatApiKey = defineSecret("REVENUECAT_API_KEY");
const webhookToken = defineSecret("REVENUECAT_WEBHOOK_TOKEN");
const allowSandbox = defineBoolean("REVENUECAT_ALLOW_SANDBOX", {
  default: false,
});
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

  await syncRevenueCatSubscription(getFirestore(app), uid, {
    apiKey: revenueCatApiKey.value(),
    allowSandbox: allowSandbox.value(),
    requireExplicitProductionFlag: true,
    timeoutMs: 10_000,
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

/**
 * Rechecks the signed-in customer's purchase against RevenueCat.
 * The client never sends a UID or an entitlement value.
 */
export const syncPremiumSubscription = onRequest(
  {cors: true, maxInstances: 10, secrets: [revenueCatApiKey]},
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST").sendStatus(405);
      return;
    }
    const authorization = request.get("Authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ?
      authorization.slice(7) : "";
    if (!token) {
      response.sendStatus(401);
      return;
    }

    let uid: string;
    try {
      uid = (await getAuth(app).verifyIdToken(token, true)).uid;
    } catch {
      response.sendStatus(401);
      return;
    }

    try {
      await syncSubscription(uid);
      const subscription = await getFirestore(app)
        .collection("userSubscriptions").doc(uid).get();
      response.set("Cache-Control", "no-store").status(200).json({
        hasAccess: hasPremiumAccess(subscription.data()),
      });
    } catch (error) {
      logger.error("No se pudo verificar la suscripción", error);
      response.status(503).json({error: "subscription_sync_unavailable"});
    }
  },
);
