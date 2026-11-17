import { PrimaryBottomSheetRef } from "@/components/bottomSheet/primaryBottomSheet";
import FinishRouteCard from "@/components/ui/Cards/finishRouteCard";
import BusinessProPopup from "@/components/map/businessProPopup";
import MapDetailsSheet from "@/components/map/mapDetailsSheet";
import MapSearchOverlay from "@/components/map/mapSearchOverlay";
import TransitMap from "@/components/map/transitMap";
import DropDown from "@/components/ui/dropDown";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import { useMapLocation } from "@/hooks/useMapLocation";
import { useLiveBuses } from "@/hooks/useLiveBuses";
import { usePassengerJourney } from "@/hooks/usePassengerJourney";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { useProximityBusinesses } from "@/hooks/useProximityBusinesses";
import {
  useActiveBusinessPromotions,
  useLightBusinesses,
  useProBusinesses,
} from "@/hooks/useRequests";
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { useRoutePlanner } from "@/hooks/useRoutePlanner";
import { useRouteFeedback } from "@/hooks/useRouteFeedback";
import { useUserSimulation } from "@/hooks/useUserSimulation";
import {
  Coordinate,
  GooglePlace,
  RouteRecommendation,
  RouteDirection,
} from "@/interfaces/transport.type";
import { distanceInMeters } from "@/lib/mapRouting";
import {
  addCrowdSourcedStop,
  addPendingStop,
  CROWD_BUS_TYPES,
  CROWD_ROUTE_DIRECTIONS,
  getBuses,
  getRoutes,
  getStops,
} from "@/Services/map.service";
import { BusinessListing } from "@/Services/request.service";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { MapPin, Plus, Position } from "iconoir-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import MapView, { PoiClickEvent } from "react-native-maps";
import { StyleSheet } from "react-native-unistyles";

const DEFAULT_LOCATION = { latitude: 8.4821, longitude: -82.6178 };
const EMPTY_BUSINESSES: BusinessListing[] = [];
const windowWidth = Dimensions.get("window").width;
const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatBusArrival = (seconds: number | null) => {
  if (seconds === null) return "Calculando";
  if (seconds <= 0) return "En la parada";
  if (seconds < 60) return "Menos de 1 min";
  return `${Math.ceil(seconds / 60)} min`;
};

export default function Map() {
  const sheetRef = useRef<PrimaryBottomSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const handledFavoriteRequest = useRef<string | null>(null);
  const hasFocusedProBusiness = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const navigation = useNavigation();
  const favoriteParams = useLocalSearchParams<{
    favoriteRequest?: string | string[];
    favoritePlaceId?: string | string[];
    favoriteName?: string | string[];
    favoriteAddress?: string | string[];
    favoriteLatitude?: string | string[];
    favoriteLongitude?: string | string[];
    favoriteType?: string | string[];
  }>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const savingStop = useRef(false);
  const [stopTarget, setStopTarget] = useState<{ routeId: string | null } | null>(null);
  const [stopName, setStopName] = useState("");
  const [crowdRouteName, setCrowdRouteName] = useState("");
  const [crowdDirection, setCrowdDirection] = useState<RouteDirection | null>(null);
  const [crowdBusType, setCrowdBusType] =
    useState<(typeof CROWD_BUS_TYPES)[number]["id"] | null>(null);
  const isCrowdStop = stopTarget?.routeId === null;
  const canSaveStop = !!stopTarget && !!stopName.trim() && !isAddingStop &&
    (!isCrowdStop || (!!crowdRouteName.trim() && !!crowdDirection && !!crowdBusType));
  const [feedbackRoute, setFeedbackRoute] = useState<RouteRecommendation | null>(null);
  const routeFeedback = useRouteFeedback();
  const stopsQuery = useQuery({
    queryKey: ["stops"],
    queryFn: getStops,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const routesQuery = useQuery({ queryKey: ["routes"], queryFn: getRoutes });
  const busesQuery = useQuery({ queryKey: ["buses"], queryFn: getBuses });
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
  const { userLocation, setUserLocation, getFreshUserLocation } =
    useMapLocation();

  useEffect(() => {
    let mounted = true;
    const loadMapLocation = async () => {
      try {
        const existingPermission =
          await Location.getForegroundPermissionsAsync();
        const permission =
          existingPermission.granted || !existingPermission.canAskAgain
            ? existingPermission
            : await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) return;
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted)
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
      } catch (error) {
        console.warn("No se pudo obtener la ubicación del mapa:", error);
      }
    };
    void loadMapLocation();
    return () => {
      mounted = false;
    };
  }, [setUserLocation]);
  const {
    activeRoute,
    busCoordinate,
    status: journeyStatus,
    etaToBoardingSeconds,
    hasPassedBoardingStop,
    busRunNumber,
    routeProgress,
    startSimulation,
    startNextBus,
    finishSimulation,
  } = useBusSimulation();
  const {
    userCoordinate: simulatedUserCoordinate,
    status: userSimulationStatus,
    startSimulation: startUserSimulation,
    finishSimulation: finishUserSimulation,
  } = useUserSimulation({
    busCoordinate,
    busStatus: journeyStatus,
  });
  const effectiveUserLocation = simulatedUserCoordinate ?? userLocation;
  const passengerJourney = usePassengerJourney({
    route: activeRoute,
    userLocation: effectiveUserLocation,
    busCoordinate,
    busStatus: journeyStatus,
    hasBusPassedBoardingStop: hasPassedBoardingStop,
    busRunNumber,
  });
  const handledMissedBusSequence = useRef(0);

  // ── Negocios Light y Pro ─────────────────────────────────────────────────
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

  useFocusEffect(
    useCallback(() => {
      void refetchLightBusinesses();
      void refetchProBusinesses();
      void refetchActivePromotions();
    }, [refetchLightBusinesses, refetchProBusinesses, refetchActivePromotions]),
  );
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
      !isMapReady ||
      hasFocusedProBusiness.current ||
      proBusinesses.length === 0 ||
      activeRoute ||
      isSheetOpen
    )
      return;
    const origin = userLocation ?? DEFAULT_LOCATION;
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
  }, [isMapReady, proBusinesses, userLocation, activeRoute, isSheetOpen]);

  useEffect(() => {
    if (
      userSimulationStatus === "onBus" &&
      passengerJourney.phase === "boardingPrompt"
    ) {
      passengerJourney.confirmBoarding();
    }
  }, [userSimulationStatus, passengerJourney]);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : undefined,
    });

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [isSheetOpen, navigation]);

  useEffect(() => {
    if (
      passengerJourney.missedBusSequence === 0 ||
      passengerJourney.missedBusSequence === handledMissedBusSequence.current
    ) {
      return;
    }

    handledMissedBusSequence.current = passengerJourney.missedBusSequence;
    startNextBus();
    sheetRef.current?.open();
    Alert.alert(
      "El bus ya pasó",
      "No estabas cerca de la parada de abordaje. Ya estamos calculando la llegada del siguiente bus.",
    );
  }, [passengerJourney.missedBusSequence, startNextBus]);

  useEffect(() => {
    if (
      passengerJourney.phase === "boardingPrompt" ||
      passengerJourney.phase === "exitPrompt"
    ) {
      sheetRef.current?.open();
    }
  }, [passengerJourney.phase]);

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

  useEffect(() => {
    if (placeSearch.selectedPlace) {
      sheetRef.current?.open();
    }
  }, [placeSearch.selectedPlace]);

  useEffect(() => {
    const requestId = getSearchParam(favoriteParams.favoriteRequest);
    const placeId = getSearchParam(favoriteParams.favoritePlaceId);
    const name = getSearchParam(favoriteParams.favoriteName);
    const latitude = Number(getSearchParam(favoriteParams.favoriteLatitude));
    const longitude = Number(getSearchParam(favoriteParams.favoriteLongitude));

    if (
      !requestId ||
      requestId === handledFavoriteRequest.current ||
      !placeId ||
      !name ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    handledFavoriteRequest.current = requestId;

    // Dar tiempo al BottomSheet de montarse completamente tras la navegación
    const timer = setTimeout(() => {
      placeSearch.selectPlace({
        id: placeId,
        name,
        coordinate: { latitude, longitude },
        address: getSearchParam(favoriteParams.favoriteAddress) || undefined,
        type: getSearchParam(favoriteParams.favoriteType) || undefined,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [favoriteParams, placeSearch.selectPlace]);

  const routePlanner = useRoutePlanner({
    stops: stopsQuery.data ?? [],
    routes: routesQuery.data ?? [],
    buses: busesQuery.data ?? [],
    selectedPlace: placeSearch.selectedPlace,
    getUserLocation: getFreshUserLocation,
    onRouteFound: focusRoute,
  });
  const visibleRoute = routePlanner.recommendation ?? activeRoute;
  const roadRoute = useRoadRoute(visibleRoute);

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
        effectiveUserLocation ?? (await getFreshUserLocation());

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
  }, [effectiveUserLocation, getFreshUserLocation]);

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
  }, [proBusinesses]);

  const handleStartRoute = () => {
    if (!routePlanner.recommendation || roadRoute.coordinates.length < 2)
      return;

    const coordinates = startSimulation(
      routePlanner.recommendation,
      roadRoute.coordinates,
    );
    startUserSimulation(
      routePlanner.recommendation,
      userLocation ?? DEFAULT_LOCATION,
    );
    sheetRef.current?.collapse();
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 190, right: 45, bottom: 130, left: 45 },
      animated: true,
    });
  };

  const handleAddStop = useCallback(async () => {
    const cleanStopName = stopName.trim();
    if (!stopTarget || savingStop.current || !cleanStopName) return;
    const routeId = stopTarget.routeId;
    const routeName = crowdRouteName.trim();
    if (routeId === null && (!routeName || !crowdDirection || !crowdBusType)) return;

    savingStop.current = true;
    setIsAddingStop(true);

    try {
      const coordinate = await getFreshUserLocation();
      if (routeId !== null) {
        const [address] = await Location.reverseGeocodeAsync(coordinate);
        const city =
          address?.city?.trim() ||
          address?.district?.trim() ||
          address?.subregion?.trim() ||
          address?.region?.trim() ||
          "Por confirmar";
        await addPendingStop({ coordinate, routeId, city, name: cleanStopName });
      } else if (crowdDirection && crowdBusType) {
        await addCrowdSourcedStop({
          coordinate,
          stopName: cleanStopName,
          routeName,
          direction: crowdDirection,
          busType: crowdBusType,
        });
      }

      setStopTarget(null);
      Alert.alert(
        "¡Gracias por colaborar con BusTrack!",
        "Guardamos la parada para confirmar su posición antes de mostrarla.",
      );
    } catch (error) {
      Alert.alert(
        "No pudimos agregar la parada",
        error instanceof Error
          ? error.message
          : "Inténtalo nuevamente en unos momentos.",
      );
    } finally {
      savingStop.current = false;
      setIsAddingStop(false);
    }
  }, [crowdBusType, crowdDirection, crowdRouteName, getFreshUserLocation, stopName, stopTarget]);

  const openStopNameModal = useCallback(() => {
    if (savingStop.current) return;
    setStopName("");
    setCrowdRouteName("");
    setCrowdDirection(null);
    setCrowdBusType(null);
    setStopTarget({ routeId: activeRoute?.route.id ?? null });
  }, [activeRoute]);

  const closeStopNameModal = useCallback(() => {
    if (!savingStop.current) setStopTarget(null);
  }, []);

  const clearRouteAndPlace = useCallback(() => {
    setStopTarget((target) => target?.routeId ? null : target);
    finishSimulation();
    finishUserSimulation();
    passengerJourney.resetJourney();
    routePlanner.setRecommendation(null);
    placeSearch.clearSelectedPlace();
    sheetRef.current?.close();
  }, [
    finishSimulation,
    finishUserSimulation,
    passengerJourney,
    placeSearch,
    routePlanner,
  ]);

  useEffect(() => {
    if (passengerJourney.phase !== "exitPrompt" || !activeRoute || feedbackRoute) return;
    setFeedbackRoute(activeRoute);
    clearRouteAndPlace();
  }, [activeRoute, clearRouteAndPlace, feedbackRoute, passengerJourney.phase]);

  const handleRateRoute = useCallback(async (rating: number, fare: number) => {
    if (!feedbackRoute) return;
    try {
      await routeFeedback.mutateAsync({
        busId: feedbackRoute.bus.id,
        routeId: feedbackRoute.route.id,
        rating,
        fare,
      });
      setFeedbackRoute(null);
    } catch (error) {
      Alert.alert(
        "No pudimos guardar tu calificación",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    }
  }, [feedbackRoute, routeFeedback]);

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
            onPress: clearRouteAndPlace,
          },
        ],
      );
      return;
    }

    routePlanner.setRecommendation(null);
    placeSearch.clearSelectedPlace();
    sheetRef.current?.close();
  }, [activeRoute, clearRouteAndPlace, placeSearch, routePlanner]);

  // ── Verificar proximidad a negocios Pro cuando cambia la ubicación ────────
  const handleUserLocationChange = useCallback(
    (coordinate: Coordinate) => {
      setUserLocation(coordinate);
    },
    [setUserLocation],
  );

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

  // ── Manejar tap en pin de negocio Pro ─────────────────────────────────────
  const handleProBusinessPress = useCallback(
    (business: BusinessListing) => {
      showBusinessPopup(business);
    },
    [showBusinessPopup],
  );

  const handleProBusinessDetail = useCallback(() => {
    if (!nearbyBusiness) return;
    closePopup();
    placeSearch.selectPlace({
      id: `business-${nearbyBusiness.id}`,
      name: nearbyBusiness.businessName,
      coordinate: nearbyBusiness.adress,
      type: "business",
    });
  }, [nearbyBusiness, closePopup, placeSearch]);

  const isLoading =
    stopsQuery.isLoading || routesQuery.isLoading || busesQuery.isLoading;
  const isError =
    stopsQuery.isError || routesQuery.isError || busesQuery.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>No se pudieron cargar las paradas, rutas y buses.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId="ca-app-pub-3940256099942544/6300978111"
        size={`${Math.floor(windowWidth)}x50` as BannerAdSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
      <TransitMap
        mapRef={mapRef}
        stops={stopsQuery.data ?? []}
        selectedPlace={placeSearch.selectedPlace}
        displayedRoute={visibleRoute}
        routeCoordinates={roadRoute.coordinates}
        routeProgress={activeRoute ? routeProgress : 0}
        busCoordinate={busCoordinate}
        liveBuses={liveBuses}
        userCoordinate={simulatedUserCoordinate}
        userSimulationStatus={userSimulationStatus}
        defaultLocation={DEFAULT_LOCATION}
        proBusinesses={proBusinesses}
        onPoiClick={handlePoiClick}
        onMapPress={placeSearch.hideSuggestions}
        onUserLocationChange={handleUserLocationChange}
        onProBusinessPress={handleProBusinessPress}
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
      <Pressable
        style={[
          styles.addStopButton,
          isAddingStop && styles.addStopButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Agregar parada en mi ubicación"
        accessibilityState={{ busy: isAddingStop, disabled: isAddingStop }}
        hitSlop={4}
        disabled={isAddingStop}
        onPress={openStopNameModal}
      >
        {isAddingStop ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Plus width={20} height={20} color="#FFFFFF" strokeWidth={2.5} />
        )}
        <Text style={styles.addStopButtonText}>
          {isAddingStop ? "Guardando" : "Agregar parada"}
        </Text>
      </Pressable>

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
        place={placeSearch.selectedPlace}
        recommendation={routePlanner.recommendation}
        isLoadingPlace={placeSearch.isLoadingPlace}
        isFindingRoute={routePlanner.isFindingRoute}
        isLoadingRoad={roadRoute.isLoading}
        canStartRoute={roadRoute.coordinates.length >= 2}
        isRouteActive={activeRoute !== null}
        activeRoute={activeRoute}
        activeRouteStatus={journeyStatus === "idle" ? "running" : journeyStatus}
        passengerPhase={passengerJourney.phase}
        timeNearestBus={
          activeRoute
            ? passengerJourney.phase === "onBoard"
              ? "A bordo"
              : passengerJourney.phase === "exitPrompt"
                ? "Llegaste"
                : formatBusArrival(etaToBoardingSeconds)
            : "Al confirmar"
        }
        error={routePlanner.error ?? roadRoute.error ?? placeSearch.error}
        onFindRoute={() => {
          placeSearch.clearError();
          void routePlanner.findRouteToPlace();
        }}
        onStartRoute={handleStartRoute}
        onCancelRoute={() => {
          finishSimulation();
          finishUserSimulation();
          passengerJourney.resetJourney();
          routePlanner.setRecommendation(null);
          placeSearch.clearSelectedPlace();
          sheetRef.current?.close();
        }}
        onConfirmBoarding={() => {
          passengerJourney.confirmBoarding();
          sheetRef.current?.collapse();
        }}
        onConfirmExit={() => {
          if (activeRoute) setFeedbackRoute(activeRoute);
          clearRouteAndPlace();
        }}
        onFinishRoute={() => {
          clearRouteAndPlace();
        }}
        onRequestClose={handleRequestSheetClose}
        onSheetChange={(index) => setIsSheetOpen(index >= 0)}
      />

      <FinishRouteCard
        key={feedbackRoute ? `${feedbackRoute.bus.id}:${feedbackRoute.route.id}` : "no-route"}
        visible={feedbackRoute !== null}
        isSubmitting={routeFeedback.isPending}
        onRate={(rating, fare) => void handleRateRoute(rating, fare)}
        onDismiss={() => setFeedbackRoute(null)}
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

      <Modal
        visible={stopTarget !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeStopNameModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.modalCard}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.modalTitle}>{isCrowdStop ? "Proponer parada" : "Nombre de la parada"}</Text>
            <Text style={styles.modalDescription}>
              {isCrowdStop
                ? "Guardaremos tu ubicación actual como la posición de la parada."
                : "Escribe un nombre que ayude a reconocer este lugar."}
            </Text>
            <TextInput
              autoFocus={!!stopTarget && !isCrowdStop}
              accessibilityLabel="Nombre de la parada"
              value={stopName}
              onChangeText={setStopName}
              placeholder={isCrowdStop ? "Nombre de la parada" : "Ejemplo: Valdez"}
              placeholderTextColor="#7B8794"
              maxLength={80}
              editable={!isAddingStop}
              returnKeyType="done"
              style={styles.stopNameInput}
              onSubmitEditing={isCrowdStop ? undefined : () => void handleAddStop()}
            />
            {isCrowdStop && (
              <>
                <TextInput
                  accessibilityLabel="Nombre de la ruta"
                  value={crowdRouteName}
                  onChangeText={setCrowdRouteName}
                  placeholder="Nombre de la ruta"
                  placeholderTextColor="#7B8794"
                  maxLength={120}
                  editable={!isAddingStop}
                  style={styles.stopNameInput}
                />
                <DropDown
                  label="Sentido de la ruta"
                  options={CROWD_ROUTE_DIRECTIONS}
                  onSelect={({ id }) => setCrowdDirection(id)}
                  inline
                  disabled={isAddingStop}
                />
                <DropDown
                  label="Tipo de bus"
                  options={CROWD_BUS_TYPES}
                  onSelect={({ id }) => setCrowdBusType(id)}
                  inline
                  disabled={isAddingStop}
                />
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                disabled={isAddingStop}
                onPress={closeStopNameModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSaveButton,
                  !canSaveStop && styles.addStopButtonDisabled,
                ]}
                disabled={!canSaveStop}
                accessibilityState={{ busy: isAddingStop, disabled: !canSaveStop }}
                onPress={() => void handleAddStop()}
              >
                {isAddingStop ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar parada</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
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
  },
}));
