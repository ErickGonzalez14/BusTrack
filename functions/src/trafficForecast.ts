/* eslint-disable max-len, require-jsdoc */
import type {Firestore} from "firebase-admin/firestore";

const DAY_MS = 86_400_000;
const PANAMA_OFFSET_MS = 5 * 60 * 60 * 1000;
const HOURS = [7, 12, 17, 20];
const CORRIDORS = [
  {label: "David → Boquete", origin: "David, Chiriquí, Panamá", destination: "Bajo Boquete, Chiriquí, Panamá"},
  {label: "Santiago → Atalaya", origin: "Santiago, Veraguas, Panamá", destination: "Atalaya, Veraguas, Panamá"},
  {label: "Ciudad de Panamá → Tocumen", origin: "Vía España, Bella Vista, Panamá", destination: "Tocumen, Panamá"},
] as const;
const REQUESTS_PER_FORECAST = HOURS.length * CORRIDORS.length;
const GLOBAL_DAILY_REQUESTS = 72;
const USER_DAILY_FORECASTS = 3;

function minutes(duration: unknown) {
  if (typeof duration !== "string" || !/^\d+(\.\d+)?s$/.test(duration)) return null;
  const seconds = Number(duration.slice(0, -1));
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : null;
}

async function estimate(
  key: string, date: string, hour: number, corridor: typeof CORRIDORS[number],
) {
  const unavailable = {hour, minutes: null};
  const departure = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00-05:00`);
  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.duration,fallbackInfo.routingMode",
      },
      body: JSON.stringify({
        origin: {address: corridor.origin},
        destination: {address: corridor.destination},
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE_OPTIMAL",
        trafficModel: "BEST_GUESS",
        regionCode: "pa",
        departureTime: departure.toISOString(),
      }),
    });
    if (!response.ok) {
      console.warn("Google Routes forecast failed", response.status);
      return unavailable;
    }
    const result = await response.json() as {
      routes?: {duration?: string}[];
      fallbackInfo?: {routingMode?: string};
    };
    if (result.fallbackInfo?.routingMode === "FALLBACK_TRAFFIC_UNAWARE") return unavailable;
    return {hour, minutes: minutes(result.routes?.[0]?.duration)};
  } catch (error) {
    console.warn("Google Routes forecast unavailable", (error as Error).name);
    return unavailable;
  }
}

export async function trafficForecast(db: Firestore, uid: string, date: unknown) {
  const panamaNow = Date.now() - PANAMA_OFFSET_MS;
  const isoDate = (daysAhead: number) =>
    new Date(panamaNow + daysAhead * DAY_MS).toISOString().slice(0, 10);
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      date < isoDate(1) || date > isoDate(14)) {
    return {status: 400, body: {error: "Elige un día futuro del calendario."}};
  }

  const key = process.env.GOOGLE_ROUTES_TRAFFIC_API_KEY?.trim();
  if (!key) return {status: 503, body: {error: "El pronóstico de tráfico aún no está habilitado."}};

  const daily = db.collection("trafficUsage").doc(isoDate(0));
  const personal = daily.collection("users").doc(uid);
  const allowed = await db.runTransaction(async (transaction) => {
    const [globalUsage, userUsage] = await transaction.getAll(daily, personal);
    const requests = (globalUsage.get("requests") as number | undefined) ?? 0;
    const queries = (userUsage.get("queries") as number | undefined) ?? 0;
    if (requests + REQUESTS_PER_FORECAST > GLOBAL_DAILY_REQUESTS || queries >= USER_DAILY_FORECASTS) {
      return false;
    }
    transaction.set(daily, {requests: requests + REQUESTS_PER_FORECAST});
    transaction.set(personal, {queries: queries + 1});
    return true;
  });
  if (!allowed) {
    return {status: 429, body: {error: "Se alcanzó el límite diario de consultas de tráfico."}};
  }

  const corridors = await Promise.all(CORRIDORS.map(async (corridor) => ({
    label: corridor.label,
    hours: await Promise.all(HOURS.map((hour) => estimate(key, date, hour, corridor))),
  })));
  if (corridors.every(({hours}) => hours.every((hour) => hour.minutes === null))) {
    return {status: 502, body: {error: "Google Maps no devolvió un pronóstico para este día."}};
  }
  return {status: 200, body: {date, corridors}};
}
