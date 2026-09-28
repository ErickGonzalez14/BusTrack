import { getRouteOptions } from "@/Services/map.service";
import { useQuery } from "@tanstack/react-query";

export const useRoutes = () => {
  return useQuery({
    queryKey: ["route-options"],
    queryFn: getRouteOptions,
  });
};
