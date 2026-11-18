import type { BusinessListing } from "@/src/features/business/data/businessDirectory";
import { useActiveBusinessPromotions, useLightBusinesses, useProBusinesses } from "@/src/features/business/hooks/useBusinessDirectory";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type MapView from "react-native-maps";
import { distanceInMeters } from "../domain/mapRouting";
import type { Coordinate } from "../domain/transport.type";
import { useProximityBusinesses } from "./useProximityBusinesses";

const EMPTY_BUSINESSES: BusinessListing[] = [];

export function useMapBusinesses({
  mapRef, origin, userLocation, canFocusBusiness,
}: {
  mapRef: RefObject<MapView | null>;
  origin: Coordinate;
  userLocation: Coordinate | null;
  canFocusBusiness: boolean;
}) {
  const hasFocusedProBusiness = useRef(false);
  const { data: lightBusinessData, refetch: refetchLightBusinesses } =
    useLightBusinesses();
  const {
    data: proBusinessData,
    isError: proBusinessesError,
    refetch: refetchProBusinesses,
  } = useProBusinesses();
  const { data: activePromotions, refetch: refetchActivePromotions } =
    useActiveBusinessPromotions();
  const lightBusinesses = lightBusinessData ?? EMPTY_BUSINESSES;
  const proBusinesses = proBusinessData ?? EMPTY_BUSINESSES;

  const {
    nearbyBusiness,
    popupVisible,
    isNearbyPopup,
    checkProximity,
    showBusinessPopup,
    closePopup,
  } = useProximityBusinesses(proBusinesses);

  useEffect(() => {
    if (userLocation) checkProximity(userLocation);
  }, [userLocation, checkProximity]);

  useEffect(() => {
    if (
      !canFocusBusiness ||
      hasFocusedProBusiness.current ||
      proBusinesses.length === 0
    )
      return;
    const nearest = [...proBusinesses].sort(
      (a, b) =>
        distanceInMeters(origin, a.adress) - distanceInMeters(origin, b.adress),
    )[0];
    const distance = distanceInMeters(origin, nearest.adress);
    if (distance > 15000) return;
    hasFocusedProBusiness.current = true;
    if (distance < 1000) {
      mapRef.current?.animateToRegion(
        {
          ...nearest.adress,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        500,
      );
    } else {
      mapRef.current?.fitToCoordinates([origin, nearest.adress], {
        edgePadding: { top: 180, right: 60, bottom: 150, left: 60 },
        animated: true,
      });
    }
  }, [canFocusBusiness, mapRef, origin, proBusinesses]);

  const handleShowProBusinesses = useCallback(() => {
    if (proBusinesses.length === 0) return;
    if (proBusinesses.length === 1) {
      mapRef.current?.animateToRegion(
        {
          ...proBusinesses[0].adress,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        500,
      );
      return;
    }
    mapRef.current?.fitToCoordinates(
      proBusinesses.map((business) => business.adress),
      {
        edgePadding: { top: 180, right: 60, bottom: 150, left: 60 },
        animated: true,
      },
    );
  }, [mapRef, proBusinesses]);

  const refreshBusinesses = useCallback(() => {
    void refetchLightBusinesses();
    void refetchProBusinesses();
    void refetchActivePromotions();
  }, [refetchLightBusinesses, refetchProBusinesses, refetchActivePromotions]);

  return {
    lightBusinesses, proBusinesses, activePromotions, proBusinessesError,
    refetchProBusinesses, refreshBusinesses, nearbyBusiness, popupVisible,
    isNearbyPopup, showBusinessPopup, closePopup, handleShowProBusinesses,
  };
}
