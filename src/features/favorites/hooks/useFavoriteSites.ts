import { useAuth } from "@/src/features/auth/context/authContext";
import { useEffect, useState } from "react";
import { type FavoriteSite, watchFavoriteSites } from "../data/favoriteSites.service";

type FavoriteSitesResult = {
  userId: string;
  sites: FavoriteSite[];
  error: string | null;
};

export function useFavoriteSites(enabled = true) {
  const { user } = useAuth();
  const userId = enabled ? user?.uid : undefined;
  const [result, setResult] = useState<FavoriteSitesResult | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchFavoriteSites(
      userId,
      (sites) => setResult({ userId, sites, error: null }),
      (error) => setResult({ userId, sites: [], error: error.message }),
    );

    return () => {
      unsubscribe();
      setResult(null);
    };
  }, [userId]);

  const currentResult = result?.userId === userId ? result : null;

  return {
    sites: currentResult?.sites ?? [],
    isLoading: Boolean(userId) && !currentResult,
    error: currentResult?.error ?? null,
  };
}
