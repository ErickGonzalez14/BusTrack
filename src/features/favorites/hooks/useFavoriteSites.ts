import { useAuth } from "@/src/features/auth/context/authContext";
import {
    type FavoriteSite,
    getAllFavoriteSites,
} from "@/src/features/favorites/data/favoriteSites.service";
import { useCallback, useEffect, useState } from "react";

export function useFavoriteSites() {
  const { user } = useAuth();

  const [sites, setSites] = useState<FavoriteSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    if (!user) {
      setSites([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllFavoriteSites();
      setSites(result);
    } catch (fetchError) {
      setError((fetchError as Error).message);
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carga automática al montar o cuando cambia el usuario
  useEffect(() => {
    let active = true;

    if (!user) {
      setSites([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    void getAllFavoriteSites()
      .then((result) => {
        if (active) setSites(result);
      })
      .catch((fetchError) => {
        if (active) {
          setError((fetchError as Error).message);
          setSites([]);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return {
    sites,
    isLoading,
    error,
    refresh: fetchSites,
  };
}
