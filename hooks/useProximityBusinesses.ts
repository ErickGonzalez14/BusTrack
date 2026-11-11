import { BusinessListing } from "@/Services/request.service";
import { Coordinate } from "@/interfaces/transport.type";
import { distanceInMeters } from "@/lib/mapRouting";
import { useCallback, useRef, useState } from "react";

/** Radio en metros para activar el popup Pro automáticamente */
const PRO_POPUP_RADIUS_METERS = 500;

/** Tiempo mínimo en ms entre dos popups automáticos del mismo negocio */
const POPUP_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos

/**
 * Hook que gestiona la lógica de popups para negocios Pro:
 * - Automático: cuando el usuario pasa a menos de 500m (con cooldown de 10 min)
 * - Manual: cuando el usuario toca el pin de un negocio Pro directamente
 */
export function useProximityBusinesses(proBusinesses: BusinessListing[]) {
  const [nearbyBusiness, setNearbyBusiness] = useState<BusinessListing | null>(
    null,
  );
  const [popupVisible, setPopupVisible] = useState(false);
  const [isNearbyPopup, setIsNearbyPopup] = useState(false);
  // Map de businessId -> timestamp de último popup mostrado (solo automático)
  const lastShownAt = useRef<Map<string, number>>(new Map());

  /** Verificar si el usuario está cerca de algún negocio Pro (automático) */
  const checkProximity = useCallback(
    (userLocation: Coordinate) => {
      if (proBusinesses.length === 0 || popupVisible) return;

      const now = Date.now();

      const nearby = proBusinesses.map((biz) => ({
        biz,
        distance: distanceInMeters(userLocation, {
          latitude: biz.adress.latitude,
          longitude: biz.adress.longitude,
        }),
      })).filter(({ distance }) => distance <= PRO_POPUP_RADIUS_METERS)
        .sort((a, b) => a.distance - b.distance);

      for (const { biz } of nearby) {
        const lastShown = lastShownAt.current.get(biz.id) ?? 0;
        if (now - lastShown >= POPUP_COOLDOWN_MS) {
          lastShownAt.current.set(biz.id, now);
          setNearbyBusiness(biz);
          setIsNearbyPopup(true);
          setPopupVisible(true);
          break; // solo un popup a la vez
        }
      }
    },
    [proBusinesses, popupVisible],
  );

  /** Mostrar popup directamente al tocar un pin (sin cooldown) */
  const showBusinessPopup = useCallback((business: BusinessListing) => {
    setNearbyBusiness(business);
    setIsNearbyPopup(false);
    setPopupVisible(true);
  }, []);

  const closePopup = useCallback(() => {
    setPopupVisible(false);
  }, []);

  return {
    nearbyBusiness,
    popupVisible,
    isNearbyPopup,
    checkProximity,
    showBusinessPopup,
    closePopup,
  };
}
