/* eslint-disable max-len, require-jsdoc */
import {createServer, IncomingMessage, ServerResponse} from "node:http";
import {timingSafeEqual} from "node:crypto";
import {cert, initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {hasPremiumAccess, syncRevenueCatSubscription, type RevenueCatEvent} from "./premiumSubscription";
import {createCommunityRoute, createCommunityTrip, rateCommunity} from "./communityOperations";
import {trafficForecast} from "./trafficForecast";

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

async function syncPremium(uid: string) {
  await auth.getUser(uid);
  await syncRevenueCatSubscription(db, uid, {
    apiKey: revenueCatKey as string,
    allowSandbox,
    requireExplicitProductionFlag: false,
    timeoutMs: 15_000,
  });
  return requirePremium(uid);
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
  return hasPremiumAccess(subscription.data());
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
    if (path === "/premium/traffic-forecast") {
      const forecast = await trafficForecast(db, uid, body.date);
      send(response, forecast.status, forecast.body);
    } else if (path === "/community/routes") {
      const id = await createCommunityRoute(db, uid, body);
      send(response, id ? 201 : 400, id ? {id} : {error: "Revisa la ruta y sus paradas."});
    } else if (path === "/community/trips") {
      const result = await createCommunityTrip(db, uid, body);
      send(response, result.id ? 201 : 400, result);
    } else if (path === "/community/rating") {
      const rated = await rateCommunity(db, uid, body);
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
