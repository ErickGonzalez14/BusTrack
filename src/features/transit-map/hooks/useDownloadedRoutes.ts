import { useAuth } from "@/src/features/auth/context/authContext";
import {
  readOfflinePremiumAccess,
  storeOfflinePremiumAccess,
  verifyOfflinePremiumAccess,
} from "@/src/features/premium/data/offlinePremiumAccess";
import { usePremiumSubscription } from "@/src/features/premium/hooks/usePremiumSubscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { deleteDownloadedRoute, listDownloadedRoutes, saveDownloadedRoute } from "../data/downloadedRoutes.service";
import { buildDownloadedRoute } from "../domain/downloadedRoute";
import type { Stop } from "../domain/stop.type";
import type { TransitRoute } from "../domain/transport.type";

const accessKey = (uid?: string) => ["offline-premium", uid] as const;
const routesKey = (uid?: string) => ["downloaded-routes", uid] as const;

export function useDownloadedRoutes() {
  const { user, profile } = useAuth();
  const uid = profile?.uid === user?.uid ? user?.uid : undefined;
  const client = useQueryClient();
  const { accessEndsAt, isFromServer } = usePremiumSubscription();
  const [clock, setClock] = useState(Date.now);
  const cachedAccess = useQuery({
    queryKey: accessKey(uid),
    enabled: Boolean(uid),
    queryFn: () => uid ? readOfflinePremiumAccess(uid) : 0,
    networkMode: "always",
    staleTime: Infinity,
  });
  const expiresAt = isFromServer ? accessEndsAt : cachedAccess.data ?? 0;
  const canOpen = Boolean(uid) && expiresAt > Date.now();

  const downloads = useQuery({
    queryKey: routesKey(uid),
    enabled: canOpen,
    queryFn: () => uid ? listDownloadedRoutes(uid) : [],
    networkMode: "always",
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!uid || !isFromServer) return;
    void storeOfflinePremiumAccess(uid, accessEndsAt)
      .then(() => client.invalidateQueries({ queryKey: accessKey(uid), exact: true }))
      .catch((error) => console.warn("No se pudo guardar la vigencia de Premium:", error));
  }, [uid, isFromServer, accessEndsAt, client]);

  useEffect(() => {
    if (!uid) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setClock(Date.now());
    });
    return () => subscription.remove();
  }, [uid]);

  useEffect(() => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setClock(Date.now()), Math.min(remaining, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [expiresAt, clock]);

  const download = useMutation({
    networkMode: "always",
    mutationFn: async ({ route, stops }: { route: TransitRoute; stops: Stop[] }) => {
      if (!uid) throw new Error("Inicia sesión para descargar rutas.");
      const entry = buildDownloadedRoute(route, stops);
      const end = await verifyOfflinePremiumAccess(uid).catch(() => {
        throw new Error("Conéctate a internet para verificar Premium y descargar la ruta.");
      });
      await storeOfflinePremiumAccess(uid, end);
      await client.invalidateQueries({ queryKey: accessKey(uid), exact: true });
      if (end <= Date.now()) throw new Error("Necesitas una suscripción Premium activa.");
      await saveDownloadedRoute(uid, entry);
      await client.invalidateQueries({ queryKey: routesKey(uid), exact: true });
    },
  });
  const remove = useMutation({
    networkMode: "always",
    mutationFn: async (id: string) => {
      if (!uid) throw new Error("Inicia sesión para eliminar la descarga.");
      await deleteDownloadedRoute(uid, id);
      await client.invalidateQueries({ queryKey: routesKey(uid), exact: true });
    },
  });

  return {
    canOpen,
    isCheckingAccess: Boolean(uid) && !isFromServer && cachedAccess.isPending,
    routes: canOpen ? downloads.data ?? [] : [],
    isLoading: canOpen && downloads.isPending,
    storageError: (!isFromServer && cachedAccess.isError) || (canOpen && downloads.isError),
    download,
    remove,
  };
}
