import { useLiveBuses } from "@/src/features/tracking/hooks/useLiveBuses";
import { useSimulatedFleet } from "@/src/features/tracking/hooks/useSimulatedFleet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getBuses, getRoutes, getStops } from "../data/transportCatalog";

const STOPS_QUERY = { queryKey: ["stops"], queryFn: getStops, staleTime: 60_000 };
const ROUTES_QUERY = { queryKey: ["routes"], queryFn: getRoutes, staleTime: 60_000 };
const BUSES_QUERY = { queryKey: ["buses"], queryFn: getBuses, staleTime: 60_000 };

export function useMapTransport() {
  const queryClient = useQueryClient();
  const stopsQuery = useQuery(STOPS_QUERY);
  const routesQuery = useQuery(ROUTES_QUERY);
  const busesQuery = useQuery(BUSES_QUERY);
  const simulatedBuses = useSimulatedFleet(stopsQuery.data, routesQuery.data);
  const liveLocations = useLiveBuses();
  const liveBuses = liveLocations.flatMap((location) => {
    const bus = busesQuery.data?.find(
      (candidate) =>
        candidate.id === location.busId &&
        candidate.userId === location.userId &&
        candidate.busStatus === "approved" &&
        candidate.active !== false,
    );
    return bus
      ? [{
          busId: bus.id,
          licensePlate: bus.licensePlate,
          coordinate: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }]
      : [];
  });

  const prefetchCatalog = useCallback(() => {
    void queryClient.prefetchQuery(STOPS_QUERY);
    void queryClient.prefetchQuery(ROUTES_QUERY);
    void queryClient.prefetchQuery(BUSES_QUERY);
  }, [queryClient]);

  return { stopsQuery, routesQuery, busesQuery, simulatedBuses, liveBuses, prefetchCatalog };
}
