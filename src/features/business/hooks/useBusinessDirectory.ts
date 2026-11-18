import {
  getActiveBusinessPromotions,
  getLightBusinesses,
  getProBusinesses,
  type BusinessListing,
  type BusinessPromotion,
} from "@/src/features/business/data/businessDirectory";
import { useQuery } from "@tanstack/react-query";

// ─── Hook para negocios Light (resultados de búsqueda) ───────────────────────
export const useLightBusinesses = () => {
  return useQuery<BusinessListing[]>({
    queryKey: ["light-businesses"],
    queryFn: getLightBusinesses,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ─── Hook para negocios Pro (pins en el mapa) ────────────────────────────────
export const useProBusinesses = () => {
  return useQuery<BusinessListing[]>({
    queryKey: ["pro-businesses"],
    queryFn: getProBusinesses,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useActiveBusinessPromotions = () =>
  useQuery<BusinessPromotion[]>({
    queryKey: ["active-business-promotions"],
    queryFn: getActiveBusinessPromotions,
    staleTime: 1000 * 60,
  });
