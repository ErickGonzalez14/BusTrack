import type { BusinessListing } from "@/src/features/business/data/businessDirectory";
import PremiumAwareBanner from "@/src/features/premium/components/PremiumAwareBanner";
import ButtonSecondary from "@/src/shared/ui/buttons/buttonSecundary";
import type { Coordinate, GooglePlace, RouteRecommendation } from "../domain/transport.type";
import { buildJourneySimulation } from "../domain/journeySimulation";
import { isBusAvailableForRoute } from "../domain/mapRouting";
import { useRoadRoute } from "../hooks/useRoadRoute";
import { useJourneyFeedback } from "../hooks/useJourneyFeedback";
import { useRoutePlanner } from "../hooks/useRoutePlanner";
import { StopContribution } from "../components/StopContribution";
import { useStopContribution } from "../hooks/useStopContribution";
import { useMapBusinesses } from "../hooks/useMapBusinesses";
import { useMapNavigationRequest } from "../hooks/useMapNavigationRequest";
import { useMapTransport } from "../hooks/useMapTransport";
import { useDownloadedRoutes } from "../hooks/useDownloadedRoutes";
import { useWalkingSimulation } from "../hooks/useWalkingSimulation";
import { PrimaryBottomSheetRef } from "@/src/shared/ui/bottomSheet/primaryBottomSheet";
import FinishRouteCard from "@/src/features/transit-map/components/finishRouteCard";
import BusinessProPopup from "@/src/features/business/components/businessProPopup";
import MapDetailsSheet from "@/src/features/transit-map/components/mapDetailsSheet";
import MapSearchOverlay from "@/src/features/transit-map/components/mapSearchOverlay";
import TransitMap from "@/src/features/transit-map/components/transitMap";
import { useMapLocation } from "@/src/features/transit-map/hooks/useMapLocation";
import { usePassengerJourney } from "@/src/features/transit-map/hooks/usePassengerJourney";
import { usePlaceSearch } from "@/src/features/transit-map/hooks/usePlaceSearch";
import {
  router,
  useFocusEffect,
  useNavigation,
} from "expo-router";
import { MapPin, Position } from "iconoir-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import MapView, { PoiClickEvent } from "react-native-maps";
import { StyleSheet } from "react-native-unistyles";

const DEFAULT_LOCATION = { latitude: 8.4821, longitude: -82.6178 };

type ActiveJourney = {
  route: RouteRecommendation;
  placeId: string;
  simulation: ReturnType<typeof buildJourneySimulation> | null;
  coordinates: Coordinate[];
};

export default function Map() {
  const sheetRef = useRef<PrimaryBottomSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const navigation = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { feedbackRoute, openFeedback, handleRateRoute, dismissFeedback, isSubmitting } = useJourneyFeedback();
  const { stopsQuery, routesQuery, busesQuery, simulatedBuses, liveBuses, prefetchCatalog } = useMapTransport();
  const offline = useDownloadedRoutes();
  const { userLocation, setUserLocation, getFreshUserLocation } =
    useMapLocation({ requestPermissionOnMount: true });

  const [activeJourney, setActiveJourney] = useState<ActiveJourney | null>(null);
  const activeRoute = activeJourney?.route ?? null;
  const stopContribution = useStopContribution(activeRoute?.route.id ?? null, getFreshUserLocation);
  const { clearRouteStop } = stopContribution;
  const activeBus = liveBuses.find((bus) => bus.busId === activeRoute?.bus?.id);
  const activeSimulation = simulatedBuses.find((bus) =>
    bus.id === activeRoute?.bus?.id && bus.direction === activeRoute.direction);

  const {
    lightBusinesses, proBusinesses, activePromotions, proBusinessesError,
    refetchProBusinesses, refreshBusinesses, nearbyBusiness, popupVisible,
    isNearbyPopup, showBusinessPopup, closePopup, handleShowProBusinesses,
  } = useMapBusinesses({
    mapRef,
    userLocation,
    origin: userLocation ?? DEFAULT_LOCATION,
    canFocusBusiness: isMapReady && !activeRoute && !isSheetOpen,
  });

  useFocusEffect(useCallback(() => {
    prefetchCatalog();
    refreshBusinesses();
  }, [prefetchCatalog, refreshBusinesses]));

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : undefined,
    });

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [isSheetOpen, navigation]);

  const openSheet = useCallback(() => sheetRef.current?.open(), []);
  const focusPlace = useCallback((place: GooglePlace) => {
    mapRef.current?.animateToRegion(
      {
        ...place.coordinate,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      600,
    );
  }, []);
  const focusRoute = useCallback(
    (recommendation: RouteRecommendation, currentPosition: Coordinate) => {
      const routeCoordinates = recommendation.orderedStops
        .slice(
          recommendation.boardingIndex,
          recommendation.destinationIndex + 1,
        )
        .map((stop) => stop.adress);
      mapRef.current?.fitToCoordinates(
        [
          currentPosition,
          recommendation.destinationStop.adress,
          ...routeCoordinates,
        ],
        {
          edgePadding: { top: 190, right: 50, bottom: 280, left: 50 },
          animated: true,
        },
      );
      openSheet();
    },
    [openSheet],
  );

  const placeSearch = usePlaceSearch({
    origin: userLocation ?? DEFAULT_LOCATION,
    onFocusPlace: focusPlace,
    onOpenSheet: openSheet,
  });

  const { selectedPlace } = placeSearch;
  const catalogBuses = busesQuery.data;
  const liveBusIds = new Set(liveBuses.map((bus) => bus.busId));
  const busesForPlanning = [...(catalogBuses ?? [])].sort(
    (first, second) => Number(liveBusIds.has(second.id)) - Number(liveBusIds.has(first.id)),
  );
  const routePlanner = useRoutePlanner({
    stops: stopsQuery.data ?? [],
    routes: routesQuery.data ?? [],
    buses: busesForPlanning,
    selectedPlace,
    getUserLocation: getFreshUserLocation,
    onRouteFound: focusRoute,
  });
  const visibleRoute = activeRoute ?? routePlanner.recommendation;
  const roadRoute = useRoadRoute(routePlanner.recommendation);
  const walking = useWalkingSimulation(
    activeJourney?.placeId ?? selectedPlace?.id,
    visibleRoute?.boardingStop,
    stopsQuery.data ?? [],
    userLocation ?? activeRoute?.boardingStop.adress ?? null,
  );
  const walkingOrigin = walking?.origin;
  const walkingTarget = walking?.target;
  const passengerJourney = usePassengerJourney({
    route: activeRoute,
    userLocation,
    busCoordinate: activeRoute?.bus?.simulated ? activeSimulation ?? null : activeBus?.coordinate ?? null,
    simulation: activeJourney?.simulation ?? null,
    isSimulatedPassengerAtStop: walking?.isAtBoardingStop ?? false,
  });
  const simulatedBusCoordinate = passengerJourney.simulatedBusCoordinate;
  const displayingWalk = !activeRoute || passengerJourney.phase === "waitingForBus" ||
    passengerJourney.phase === "boardingPrompt";
  const displayedBusIsLive = !!visibleRoute?.bus && !visibleRoute.bus.simulated && liveBusIds.has(visibleRoute.bus.id);

  useEffect(() => {
    if (selectedPlace) {
      sheetRef.current?.open();
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (!isMapReady || !selectedPlace || visibleRoute || !walkingOrigin || !walkingTarget) return;
    mapRef.current?.fitToCoordinates([walkingOrigin, walkingTarget, selectedPlace.coordinate], {
      edgePadding: { top: 190, right: 50, bottom: 280, left: 50 },
      animated: true,
    });
  }, [isMapReady, selectedPlace, visibleRoute, walkingOrigin, walkingTarget]);

  useEffect(() => {
    if (passengerJourney.phase === "boardingPrompt" || passengerJourney.phase === "exitPrompt") {
      sheetRef.current?.open();
    }
  }, [passengerJourney.phase]);

  const resetJourney = passengerJourney.resetJourney;
  const followRoute = useCallback((
    recommendation: RouteRecommendation,
    placeId: string,
    roadLegs?: Coordinate[][],
  ) => {
    const availableBuses = catalogBuses?.filter((bus) => isBusAvailableForRoute(bus, recommendation.route.id));
    const registeredBus = availableBuses?.find((bus) => bus.id === recommendation.bus?.id) ??
      availableBuses?.[0];
    const simulation = registeredBus ? buildJourneySimulation(recommendation, roadLegs) : null;
    const routeStops = recommendation.orderedStops.map((stop) => stop.adress);
    const coordinates = roadLegs
      ? roadLegs.flatMap((leg, index) => index ? leg.slice(1) : leg)
      : routeStops;
    resetJourney();
    setActiveJourney({
      route: registeredBus ? { ...recommendation, bus: { ...registeredBus, simulated: true } } : recommendation,
      placeId,
      simulation,
      coordinates,
    });
    sheetRef.current?.collapse();
    const tripStops = routeStops.slice(0, recommendation.destinationIndex + 1);
    mapRef.current?.fitToCoordinates(userLocation ? [userLocation, ...tripStops] : tripStops, {
      edgePadding: { top: 190, right: 45, bottom: 130, left: 45 },
      animated: true,
    });
  }, [catalogBuses, resetJourney, userLocation]);

  useMapNavigationRequest({
    isMapReady,
    selectPlace: placeSearch.selectPlace,
    destination: selectedPlace,
    stops: stopsQuery.data,
    routes: routesQuery.data,
    buses: catalogBuses,
    simulatedBuses,
    userLocation,
    followRoute,
  });

  const handlePoiClick = useCallback(
    (event: PoiClickEvent) => {
      const poi = event.nativeEvent;
      void placeSearch.openPlace(poi.placeId, {
        name: poi.name,
        coordinate: poi.coordinate,
      });
    },
    [placeSearch],
  );

  const handleCenterUserLocation = useCallback(async () => {
    try {
      const coordinate =
        userLocation ?? (await getFreshUserLocation());

      mapRef.current?.animateToRegion(
        {
          ...coordinate,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    } catch (error) {
      Alert.alert(
        "Ubicación no disponible",
        error instanceof Error
          ? error.message
          : "No pudimos obtener tu ubicación actual.",
      );
    }
  }, [userLocation, getFreshUserLocation]);

  const handleStartRoute = () => {
    if (!selectedPlace || !routePlanner.recommendation || roadRoute.isLoading || !catalogBuses)
      return;

    followRoute(routePlanner.recommendation, selectedPlace.id, roadRoute.legs);
  };

  const clearRouteAndPlace = useCallback(() => {
    clearRouteStop();
    setActiveJourney(null);
    passengerJourney.resetJourney();
    routePlanner.clearRecommendation();
    placeSearch.clearSelectedPlace();
    sheetRef.current?.close();
  }, [
    clearRouteStop,
    passengerJourney,
    placeSearch,
    routePlanner,
  ]);

  const finishRoute = useCallback(() => {
    if (!activeRoute) return;
    openFeedback(activeRoute);
    clearRouteAndPlace();
  }, [activeRoute, clearRouteAndPlace, openFeedback]);

  useEffect(() => {
    if (!activeJourney?.simulation && passengerJourney.phase === "exitPrompt") finishRoute();
  }, [activeJourney, finishRoute, passengerJourney.phase]);

  const handleRequestSheetClose = useCallback(() => {
    if (activeRoute) {
      Alert.alert(
        "¿Quieres terminar la ruta?",
        "Si terminas la ruta, se cancelará el viaje que está en curso.",
        [
          { text: "No, continuar", style: "cancel" },
          {
            text: "Sí, terminar",
            style: "destructive",
            onPress: finishRoute,
          },
        ],
      );
      return;
    }

    routePlanner.clearRecommendation();
    placeSearch.clearSelectedPlace();
    sheetRef.current?.close();
  }, [activeRoute, finishRoute, placeSearch, routePlanner]);

  const handleLightBusinessPress = useCallback(
    (business: BusinessListing) => {
      placeSearch.selectPlace({
        id: `business-${business.id}`,
        name: business.businessName,
        coordinate: business.adress,
        type: "business",
      });
    },
    [placeSearch],
  );

  const handleProBusinessDetail = useCallback(() => {
    if (!nearbyBusiness) return;
    closePopup();
    handleLightBusinessPress(nearbyBusiness);
  }, [nearbyBusiness, closePopup, handleLightBusinessPress]);

  const isLoading = stopsQuery.isPending || routesQuery.isPending;
  const isError = stopsQuery.isLoadingError || routesQuery.isLoadingError;

  function openDownloads(routeId?: string) {
    router.push({ pathname: "/offlineRoutes", params: routeId ? { routeId } : {} });
  }

  const catalogRoute = visibleRoute?.route;
  const isDownloaded = offline.routes.some(({ id }) => id === catalogRoute?.id);
  const downloadAction = offline.canOpen && catalogRoute ? {
    text: isDownloaded ? "Ver ruta descargada" : "Descargar ruta",
    isLoading: offline.download.isPending,
    onPress: () => {
      if (isDownloaded) {
        openDownloads(catalogRoute.id);
        return;
      }
      offline.download.mutate({ route: catalogRoute, stops: stopsQuery.data ?? [] }, {
        onSuccess: () => Alert.alert("Ruta descargada", "Puedes abrirla sin conexión desde Rutas descargadas."),
        onError: (error) => Alert.alert("No se pudo descargar la ruta", error.message),
      });
    },
  } : undefined;

  if (isLoading || isError) {
    return (
      <View style={styles.centered}>
        {isError ? (
          <Text style={styles.catalogMessage}>No se pudieron cargar las paradas y rutas.</Text>
        ) : <ActivityIndicator size="large" accessibilityLabel="Cargando mapa" />}
        <ButtonSecondary title="Rutas descargadas" onPress={() => openDownloads()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PremiumAwareBanner />
      <TransitMap
        mapRef={mapRef}
        stops={stopsQuery.data ?? []}
        selectedPlace={selectedPlace}
        displayedRoute={visibleRoute}
        routeCoordinates={activeJourney?.coordinates ?? roadRoute.coordinates}
        simulatedPassenger={displayingWalk ? walking : null}
        trackedBuses={[
          ...liveBuses.filter((bus) => !simulatedBusCoordinate || bus.busId !== activeRoute?.bus?.id),
          ...simulatedBuses.map((bus) => ({
            busId: bus.id,
            coordinate: { latitude: bus.latitude, longitude: bus.longitude },
            licensePlate: `Bus simulado ${bus.number}`,
            simulated: true,
          })),
          ...(simulatedBusCoordinate && activeRoute?.bus ? [{
            busId: activeRoute.bus.id,
            coordinate: simulatedBusCoordinate,
            licensePlate: activeRoute.bus.publicTransportPlate || activeRoute.bus.licensePlate,
            simulated: true,
          }] : []),
        ]}
        defaultLocation={DEFAULT_LOCATION}
        proBusinesses={proBusinesses}
        onPoiClick={handlePoiClick}
        onMapPress={placeSearch.hideSuggestions}
        onUserLocationChange={setUserLocation}
        onProBusinessPress={showBusinessPopup}
        onMapReady={() => setIsMapReady(true)}
      />
      <Pressable
        style={styles.locationButton}
        accessibilityRole="button"
        accessibilityLabel="Centrar en mi ubicación"
        hitSlop={8}
        onPress={() => void handleCenterUserLocation()}
      >
        <Position width={25} height={25} color="#FFFFFF" />
      </Pressable>
      <View style={styles.downloadsButton}>
        <ButtonSecondary title="Rutas descargadas" onPress={() => openDownloads()} />
      </View>
      {proBusinesses.length > 0 && (
        <Pressable
          style={styles.proBusinessButton}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${proBusinesses.length} negocios Pro en el mapa`}
          onPress={handleShowProBusinesses}
        >
          <MapPin width={18} height={18} color="#FFFFFF" />
          <Text style={styles.proBusinessButtonText}>
            Locales ({proBusinesses.length})
          </Text>
        </Pressable>
      )}
      {proBusinessesError && (
        <Pressable
          style={styles.proBusinessError}
          onPress={() => void refetchProBusinesses()}
        >
          <Text style={styles.proBusinessErrorText}>
            No se cargaron los negocios Pro. Toca para reintentar.
          </Text>
        </Pressable>
      )}
      <StopContribution {...stopContribution} />

      <MapSearchOverlay
        value={placeSearch.searchText}
        suggestions={placeSearch.suggestions}
        lightBusinesses={lightBusinesses}
        searchOrigin={userLocation ?? DEFAULT_LOCATION}
        isSearching={placeSearch.isSearching}
        hasSearched={placeSearch.hasSearched}
        searchError={placeSearch.searchError}
        showSuggestions={placeSearch.showSuggestions}
        onChangeText={placeSearch.onSearchTextChange}
        onFocus={placeSearch.onSearchFocus}
        onSubmit={placeSearch.submitSearch}
        onSelect={placeSearch.selectSuggestion}
        onSelectBusiness={handleLightBusinessPress}
      />
      <MapDetailsSheet
        sheetRef={sheetRef}
        place={selectedPlace}
        recommendation={visibleRoute}
        isLoadingPlace={placeSearch.isLoadingPlace}
        isFindingRoute={routePlanner.isFindingRoute}
        isLoadingRoad={roadRoute.isLoading}
        canStartRoute={!roadRoute.isLoading && !!catalogBuses}
        isRouteActive={activeRoute !== null}
        activeRoute={activeRoute}
        activeRouteStatus={passengerJourney.phase === "exitPrompt" ? "arrived" : "running"}
        passengerPhase={passengerJourney.phase}
        timeNearestBus={
          passengerJourney.phase === "onBoard"
            ? "A bordo"
            : visibleRoute?.bus?.simulated
              ? "Simulado"
              : displayedBusIsLive
                ? "En vivo"
                : visibleRoute?.bus ? "Sin ubicación en vivo" : "Sin bus asignado"
        }
        hasLiveBus={displayedBusIsLive || !!activeSimulation || !!simulatedBusCoordinate}
        downloadAction={downloadAction}
        error={routePlanner.error ?? roadRoute.error ?? placeSearch.error ??
          (busesQuery.isLoadingError ? "No se pudo cargar el registro de buses." : null)}
        onFindRoute={() => {
          placeSearch.clearError();
          void routePlanner.findRouteToPlace();
        }}
        onStartRoute={handleStartRoute}
        onCancelRoute={clearRouteAndPlace}
        onConfirmBoarding={() => {
          passengerJourney.confirmBoarding();
          sheetRef.current?.collapse();
        }}
        onConfirmExit={finishRoute}
        onFinishRoute={finishRoute}
        onRequestClose={handleRequestSheetClose}
        onSheetChange={(index) => setIsSheetOpen(index >= 0)}
      />

      <FinishRouteCard
        key={feedbackRoute?.route.id ?? "no-route"}
        visible={feedbackRoute !== null}
        isSubmitting={isSubmitting}
        onRate={(rating, fare) => void handleRateRoute(rating, fare)}
        onDismiss={dismissFeedback}
      />

      {/* ── Popup de negocio Pro ────────────────────────────────────────── */}
      <BusinessProPopup
        business={nearbyBusiness}
        visible={popupVisible}
        isNearby={isNearbyPopup}
        promotion={activePromotions?.find(
          (promotion) => promotion.businessId === nearbyBusiness?.id,
        )}
        onClose={closePopup}
        onViewDetail={handleProBusinessDetail}
      />

    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  downloadsButton: {
    position: "absolute",
    top: 140,
    left: 16,
    zIndex: 5,
    elevation: 5,
  },
  catalogMessage: {
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    textAlign: "center",
    marginBottom: 12,
  },
  locationButton: {
    position: "absolute",
    top: 140,
    right: 16,
    zIndex: 5,
    elevation: 5,
    width: 44,
    height: 44,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  addStopButton: {
    position: "absolute",
    top: 192,
    right: 16,
    zIndex: 5,
    elevation: 5,
    minHeight: 44,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  proBusinessButton: {
    position: "absolute",
    top: 244,
    right: 16,
    zIndex: 5,
    elevation: 5,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.tertiary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  proBusinessButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
  },
  proBusinessError: {
    position: "absolute",
    top: 296,
    left: 16,
    right: 16,
    zIndex: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF3E0",
  },
  proBusinessErrorText: {
    color: "#8B4513",
    fontSize: 12,
  },
  addStopButtonDisabled: {
    opacity: 0.7,
  },
  addStopButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(8, 20, 35, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    flexGrow: 0,
    flexShrink: 1,
    borderRadius: theme.size_rounded.lg,
    backgroundColor: theme.surface.background,
  },
  modalContent: {
    gap: 12,
    padding: 20,
  },
  modalTitle: {
    fontFamily: theme.fonts.heavy,
    fontSize: 22,
    color: theme.text.Body,
  },
  modalDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.placeholder,
  },
  stopNameInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    borderRadius: theme.size_rounded.sm,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.text.Body,
    backgroundColor: theme.surface.inputs,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  modalCancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Body,
  },
  modalSaveButton: {
    minHeight: 44,
    minWidth: 145,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.size_rounded.sm,
    paddingHorizontal: 16,
    backgroundColor: theme.components.buttons.primary,
  },
  modalSaveText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: "#FFFFFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface.neutral,
    padding: 20,
  },
}));
