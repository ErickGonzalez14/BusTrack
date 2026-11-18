import { getRouteOptions } from "@/src/features/transit-map/data/transportCatalog";
import { useQuery } from "@tanstack/react-query";

export const useRoutes = () => {
  return useQuery({
    queryKey: ["route-options"],
    queryFn: getRouteOptions,
  });
};
