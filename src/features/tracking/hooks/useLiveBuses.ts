import { subscribeToLiveBuses, type LiveBusLocation } from "@/src/features/tracking/data/busTracking.service";
import { useEffect, useState } from "react";

const LOCATION_MAX_AGE_MS = 120_000;

export function useLiveBuses() {
  const [locations, setLocations] = useState<LiveBusLocation[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToLiveBuses((next) => {
      setLocations(next);
      setNow(Date.now());
    }, (error) => {
      console.warn("No se pudieron escuchar los buses en vivo:", error);
      setLocations([]);
    });
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  return locations.filter(
    (location) =>
      location.updatedAt <= now + 5_000 &&
      now - location.updatedAt <= LOCATION_MAX_AGE_MS,
  );
}
