/* eslint-disable max-len, require-jsdoc */
import {createServer, IncomingMessage, ServerResponse} from "node:http";
import {timingSafeEqual} from "node:crypto";
import {cert, initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";

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

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const revenueCatKey = process.env.REVENUECAT_API_KEY;
const webhookToken = process.env.REVENUECAT_WEBHOOK_TOKEN;
if (!serviceAccount || !revenueCatKey) {
  throw new Error("Faltan FIREBASE_SERVICE_ACCOUNT_JSON o REVENUECAT_API_KEY");
}

const credentials = JSON.parse(serviceAccount) as {
  project_id: string;
  client_email: string;
  private_key: string;
};
if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON no es una cuenta de servicio válida");
}
const app = initializeApp({credential: cert({
  projectId: credentials.project_id,
  clientEmail: credentials.client_email,
  privateKey: credentials.private_key,
})});
const auth = getAuth(app);
const db = getFirestore(app);
const allowSandbox = process.env.REVENUECAT_ALLOW_SANDBOX === "true";

function send(response: ServerResponse, status: number, body: Record<string, unknown> = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > 64_000) throw new Error("Payload demasiado grande");
    chunks.push(buffer);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON inválido");
  }
  return parsed as Record<string, unknown>;
}

function bearer(request: IncomingMessage) {
  const value = request.headers.authorization ?? "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function secureEquals(actual: string, expected: string) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) throw new Error("Fecha de RevenueCat inválida");
  return Timestamp.fromMillis(milliseconds);
}

function hasPremium(data: FirebaseFirestore.DocumentData | undefined) {
  if (!data || data.entitlement !== "premium") return false;
  const expiresAt = data.expiresAt as Timestamp | null;
  const graceAt = data.gracePeriodExpiresAt as Timestamp | null;
  const accessEndsAt = data.status === "grace_period" ?
    Math.max(expiresAt?.toMillis() ?? 0, graceAt?.toMillis() ?? 0) :
    expiresAt?.toMillis() ?? 0;
  return data.status !== "expired" && accessEndsAt > Date.now();
}

async function syncPremium(uid: string) {
  await auth.getUser(uid);
  const result = await fetch("https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(uid), {
    headers: {Authorization: `Bearer ${revenueCatKey}`},
    signal: AbortSignal.timeout(15_000),
  });
  if (!result.ok) throw new Error(`RevenueCat HTTP ${result.status}`);
  const customer = await result.json() as RevenueCatCustomer;
  const checkedAt = customer.request_date_ms;
  if (!Number.isSafeInteger(checkedAt) || checkedAt <= 0) throw new Error("Respuesta inválida de RevenueCat");
  const premium = customer.subscriber.entitlements.premium;
  const productId = premium?.product_identifier ?? null;
  const product = productId ? customer.subscriber.subscriptions[productId] ??
    customer.subscriber.subscriptions[productId.split(":")[0]] : undefined;
  const isSandbox = product?.is_sandbox === true || product?.store.toLowerCase() === "test_store";
  const allowed = Boolean(product && (!isSandbox || allowSandbox));
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
      entitlement: "premium", status, expiresAt, gracePeriodExpiresAt,
      willRenew: status === "active" && !product?.unsubscribe_detected_at &&
        !product?.billing_issues_detected_at,
      store: allowed ? product?.store : null,
      productId: allowed ? productId : null,
      revenueCatCheckedAtMs: checkedAt,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return hasPremium((await ref.get()).data());
}

function webhookUserIds(event: RevenueCatEvent) {
  const candidates = event.type === "TRANSFER" ?
    [...event.transferred_from ?? [], ...event.transferred_to ?? []] :
    [event.app_user_id];
  return [...new Set(candidates.filter((uid): uid is string =>
    typeof uid === "string" && uid.length > 0 && uid.length <= 128 &&
    !uid.startsWith("$RCAnonymousID:") && !uid.includes("/") &&
    uid !== "." && uid !== "..",
  ))];
}

async function requireUser(request: IncomingMessage) {
  const token = bearer(request);
  if (!token) return null;
  try {
    return (await auth.verifyIdToken(token, true)).uid;
  } catch {
    return null;
  }
}

async function requirePremium(uid: string) {
  const subscription = await db.collection("userSubscriptions").doc(uid).get();
  return hasPremium(subscription.data());
}

function text(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}

async function createCommunityRoute(uid: string, body: Record<string, unknown>) {
  const title = text(body.title, 4, 80);
  const description = text(body.description, 0, 500);
  const city = text(body.city, 2, 80);
  const stopIds = body.stopIds;
  if (!title || description === null || !city ||
      !["outbound", "return"].includes(String(body.direction)) ||
      !Array.isArray(stopIds) || stopIds.length < 2 || stopIds.length > 20 ||
      new Set(stopIds).size !== stopIds.length ||
      !stopIds.every((id) => typeof id === "string" && id.length > 0 && !id.includes("/"))) {
    return null;
  }
  const stops = await db.getAll(...stopIds.map((id: string) => db.collection("stops").doc(id)));
  if (!stops.every((stop) => stop.exists && stop.get("active") !== false)) return null;
  const ref = await db.collection("communityRoutes").add({
    authorId: uid, title, description, city, direction: body.direction, stopIds,
    status: "published", ratingAverage: 0, ratingCount: 0,
    ratingTotal: 0, rankingScore: 3, createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function createCommunityTrip(uid: string, body: Record<string, unknown>) {
  const title = text(body.title, 4, 80);
  const description = text(body.description, 0, 500);
  const origin = text(body.origin, 2, 80);
  const destination = text(body.destination, 2, 80);
  const stops = body.stops;
  const distanceKm = body.distanceKm;
  const durationMinutes = body.durationMinutes;
  if (!title || description === null || !origin || !destination ||
      !Array.isArray(stops) || stops.length > 10 ||
      !stops.every((stop) => text(stop, 1, 80) !== null) ||
      typeof distanceKm !== "number" || distanceKm <= 0 || distanceKm > 1000 ||
      !Number.isInteger(durationMinutes) || (durationMinutes as number) < 1 ||
      (durationMinutes as number) > 10080) return null;
  const ref = await db.collection("communityTrips").add({
    authorId: uid, title, description, origin, destination, stops,
    distanceKm, durationMinutes, status: "published",
    ratingAverage: 0, ratingCount: 0, ratingTotal: 0,
    rankingScore: 3, createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function rateCommunity(uid: string, body: Record<string, unknown>) {
  const kind = body.kind;
  const itemId = body.itemId;
  const value = body.value;
  if ((kind !== "communityRoutes" && kind !== "communityTrips") ||
      typeof itemId !== "string" || !itemId || itemId.includes("/") ||
      !Number.isInteger(value) || (value as number) < 1 || (value as number) > 5) return false;
  const ref = db.collection(kind).doc(itemId);
  const ratingRef = ref.collection("ratings").doc(uid);
  return db.runTransaction(async (transaction) => {
    const [item, previous] = await Promise.all([
      transaction.get(ref), transaction.get(ratingRef),
    ]);
    if (!item.exists || item.get("status") !== "published" || item.get("authorId") === uid) return false;
    const oldValue = previous.exists ? previous.get("value") as number : null;
    if (oldValue === value) return true;
    const count = (item.get("ratingCount") ?? 0) + (oldValue === null ? 1 : 0);
    const total = (item.get("ratingTotal") ?? 0) + (value as number) - (oldValue ?? 0);
    transaction.set(ratingRef, {authorId: uid, value, updatedAt: FieldValue.serverTimestamp()});
    transaction.update(ref, {
      ratingCount: count, ratingTotal: total,
      ratingAverage: total / count,
      rankingScore: (total + 9) / (count + 3),
    });
    return true;
  });
}

const server = createServer(async (request, response) => {
  const path = request.url?.split("?")[0];
  if (request.method === "OPTIONS") {
    send(response, 204);
    return;
  }
  if (request.method === "GET" && path === "/health") {
    send(response, 200, {ok: true});
    return;
  }
  if (request.method !== "POST") {
    send(response, 405, {error: "Método no permitido"});
    return;
  }
  try {
    if (path === "/revenuecat/webhook") {
      if (!webhookToken) {
        send(response, 404, {error: "Webhook desactivado"});
        return;
      }
      if (!secureEquals(bearer(request), webhookToken)) {
        send(response, 401, {error: "No autorizado"});
        return;
      }
      const event = (await readJson(request)).event as RevenueCatEvent | undefined;
      if (typeof event?.type !== "string") {
        send(response, 400, {error: "Evento inválido"});
        return;
      }
      if (event.type === "TEST" ||
          ((event.environment === "SANDBOX" || event.store === "TEST_STORE") && !allowSandbox)) {
        send(response, 204);
        return;
      }
      await Promise.all(webhookUserIds(event).map(syncPremium));
      send(response, 204);
      return;
    }

    const uid = await requireUser(request);
    if (!uid) {
      send(response, 401, {error: "Inicia sesión para continuar."});
      return;
    }
    if (path === "/premium/sync") {
      send(response, 200, {hasAccess: await syncPremium(uid)});
      return;
    }
    if (!(await requirePremium(uid))) {
      send(response, 403, {error: "Tu suscripción Premium aún no está validada."});
      return;
    }
    const body = await readJson(request);
    if (path === "/community/routes") {
      const id = await createCommunityRoute(uid, body);
      send(response, id ? 201 : 400, id ? {id} : {error: "Revisa la ruta y sus paradas."});
    } else if (path === "/community/trips") {
      const id = await createCommunityTrip(uid, body);
      send(response, id ? 201 : 400, id ? {id} : {error: "Revisa los datos del trip."});
    } else if (path === "/community/rating") {
      const rated = await rateCommunity(uid, body);
      send(response, rated ? 200 : 400, rated ? {ok: true} : {error: "No se pudo valorar esta publicación."});
    } else {
      send(response, 404, {error: "Ruta no encontrada"});
    }
  } catch (error) {
    console.error("Render API error", error);
    send(response, 503, {error: "No se pudo completar la operación. Inténtalo de nuevo."});
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT ?? 10000);
  server.listen(port, "0.0.0.0", () => console.log(`BusTrack API listening on ${port}`));
}

export {server};
