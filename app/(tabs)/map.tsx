import { PrimaryBottomSheetRef } from "@/components/bottomSheet/primaryBottomSheet";
import MapDetailsSheet from "@/components/map/mapDetailsSheet";
import MapSearchOverlay from "@/components/map/mapSearchOverlay";
import TransitMap from "@/components/map/transitMap";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import { useMapLocation } from "@/hooks/useMapLocation";
import { usePassengerJourney } from "@/hooks/usePassengerJourney";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { useRoutePlanner } from "@/hooks/useRoutePlanner";
import {
  Coordinate,
  GooglePlace,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import { getBuses, getRoutes, getStops } from "@/Services/map.service";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { Position } from "iconoir-react-native";
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

const formatBusArrival = (seconds: number | null) => {
  if (seconds === null) return "Calculando";
  if (seconds <= 0) return "En la parada";
  if (seconds < 60) return "Menos de 1 min";
  return `${Math.ceil(seconds / 60)} min`;
};

export default function Map() {
  const sheetRef = useRef<PrimaryBottomSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const stopsQuery = useQuery({ queryKey: ["stops"], queryFn: getStops });
  const routesQuery = useQuery({ queryKey: ["routes"], queryFn: getRoutes });
  const busesQuery = useQuery({ queryKey: ["buses"], queryFn: getBuses });
  const { userLocation, setUserLocation, getFreshUserLocation } =
    useMapLocation();
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
  const passengerJourney = usePassengerJourney({
    route: activeRoute,
    userLocation,
    busCoordinate,
    busStatus: journeyStatus,
    hasBusPassedBoardingStop: hasPassedBoardingStop,
    busRunNumber,
  });
  const handledMissedBusSequence = useRef(0);

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
      const coordinate = userLocation ?? (await getFreshUserLocation());

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
  }, [getFreshUserLocation, userLocation]);

  const handleStartRoute = () => {
    if (!routePlanner.recommendation || roadRoute.coordinates.length < 2)
      return;

    const coordinates = startSimulation(
      routePlanner.recommendation,
      roadRoute.coordinates,
    );
    sheetRef.current?.collapse();
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 190, right: 45, bottom: 130, left: 45 },
      animated: true,
    });
  };

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
      <TransitMap
        mapRef={mapRef}
        stops={stopsQuery.data ?? []}
        selectedPlace={placeSearch.selectedPlace}
        displayedRoute={visibleRoute}
        routeCoordinates={roadRoute.coordinates}
        routeProgress={activeRoute ? routeProgress : 0}
        busCoordinate={busCoordinate}
        defaultLocation={DEFAULT_LOCATION}
        onPoiClick={handlePoiClick}
        onMapPress={placeSearch.hideSuggestions}
        onUserLocationChange={setUserLocation}
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
      <MapSearchOverlay
        value={placeSearch.searchText}
        suggestions={placeSearch.suggestions}
        isSearching={placeSearch.isSearching}
        hasSearched={placeSearch.hasSearched}
        searchError={placeSearch.searchError}
        showSuggestions={placeSearch.showSuggestions}
        onChangeText={placeSearch.onSearchTextChange}
        onFocus={placeSearch.onSearchFocus}
        onSubmit={placeSearch.submitSearch}
        onSelect={placeSearch.selectSuggestion}
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
        activeRouteStatus={
          journeyStatus === "idle" ? "running" : journeyStatus
        }
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
          passengerJourney.resetJourney();
          routePlanner.setRecommendation(null);
          sheetRef.current?.close();
        }}
        onConfirmBoarding={() => {
          passengerJourney.confirmBoarding();
          sheetRef.current?.collapse();
        }}
        onConfirmExit={() => {
          passengerJourney.confirmExit();
          finishSimulation();
          routePlanner.setRecommendation(null);
          sheetRef.current?.close();
        }}
        onFinishRoute={() => {
          finishSimulation();
          passengerJourney.resetJourney();
          routePlanner.setRecommendation(null);
          sheetRef.current?.close();
        }}
        onSheetChange={(index) => setIsSheetOpen(index >= 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  locationButton: {
    position: "absolute",
    top: 116,
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
