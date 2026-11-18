import { getAuth } from "@react-native-firebase/auth";
import Constants from "expo-constants";

const pending = new Map<string, Promise<boolean>>();

function backendUrl() {
  const configured = Constants.expoConfig?.extra?.backendUrl;
  if (typeof configured !== "string" || !configured.startsWith("https://")) {
    throw new Error("Configura EXPO_PUBLIC_BACKEND_URL con la URL de Render.");
  }
  return configured.replace(/\/+$/, "");
}

export async function authenticatedBackendRequest(
  path: string,
  body?: Record<string, unknown>,
) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Debes iniciar sesión.");
  const uid = user.uid;
  const token = await user.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(`${backendUrl()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });
    if (getAuth().currentUser?.uid !== uid) throw new Error("La sesión cambió.");
    if (!response.ok) {
      const result = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(result?.error ?? `El servidor respondió ${response.status}.`);
    }
    return response.json() as Promise<Record<string, unknown>>;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function syncPremiumPurchase(uid: string): Promise<boolean> {
  const existing = pending.get(uid);
  if (existing) return existing;

  const operation = (async () => {
    if (getAuth().currentUser?.uid !== uid) throw new Error("La sesión cambió.");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await authenticatedBackendRequest("/premium/sync");
      if (result.hasAccess === true) return true;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1_500));
    }
    return false;
  })();
  pending.set(uid, operation);
  void operation.finally(() => pending.delete(uid)).catch(() => undefined);
  return operation;
}
