import { simulateFleet } from "@/functions/shared/simulatedFleet";
import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import type { TransitRoute } from "@/src/features/transit-map/domain/transport.type";
import { getRoutableDirections } from "@/src/features/transit-map/domain/mapRouting";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export function useSimulatedFleet(stops?: Stop[], routes?: TransitRoute[]) {
  const [now, setNow] = useState(Date.now);
  useFocusEffect(useCallback(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 5_000);
    return () => clearInterval(timer);
  }, []));

  const directions = useMemo(() =>
    getRoutableDirections(stops ?? [], routes ?? []).map(({ route, direction, orderedStops }) => ({
      routeId: route.id,
      direction,
      stops: orderedStops.map((stop) => stop.adress),
      duration: route.estimatedDuration,
    })),
  [stops, routes]);

  return useMemo(() => simulateFleet(directions, now), [directions, now]);
}
