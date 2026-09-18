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
import {
  addPendingStop,
  getBuses,
  getRoutes,
  getStops,
} from "@/Services/map.service";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useNavigation } from "expo-router";
import { Plus, Position } from "iconoir-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
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
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [isStopNameModalOpen, setIsStopNameModalOpen] = useState(false);
  const [stopName, setStopName] = useState("");
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

  const handleAddStop = useCallback(async () => {
    const cleanStopName = stopName.trim();
    if (!activeRoute || isAddingStop || !cleanStopName) return;

    setIsAddingStop(true);

    try {
      const coordinate = await getFreshUserLocation();
      const [address] = await Location.reverseGeocodeAsync(coordinate);
      const city =
        address?.city?.trim() ||
        address?.district?.trim() ||
        address?.subregion?.trim() ||
        address?.region?.trim() ||
        "Por confirmar";

      await addPendingStop({
        coordinate,
        routeId: activeRoute.route.id,
        city,
        name: cleanStopName,
      });

      setIsStopNameModalOpen(false);
      setStopName("");
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
      setIsAddingStop(false);
    }
  }, [activeRoute, getFreshUserLocation, isAddingStop, stopName]);

  const openStopNameModal = useCallback(() => {
    if (!activeRoute || isAddingStop) return;
    setStopName("");
    setIsStopNameModalOpen(true);
  }, [activeRoute, isAddingStop]);

  const closeStopNameModal = useCallback(() => {
    if (isAddingStop) return;
    setIsStopNameModalOpen(false);
    setStopName("");
  }, [isAddingStop]);

  const clearRouteAndPlace = useCallback(() => {
    setIsStopNameModalOpen(false);
    setStopName("");
    finishSimulation();
    passengerJourney.resetJourney();
    routePlanner.setRecommendation(null);
    placeSearch.clearSelectedPlace();
    sheetRef.current?.close();
  }, [finishSimulation, passengerJourney, placeSearch, routePlanner]);

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
      {activeRoute && (
        <Pressable
          style={[
            styles.addStopButton,
            isAddingStop && styles.addStopButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Agregar parada en mi ubicación"
          accessibilityState={{ busy: isAddingStop, disabled: isAddingStop }}
          hitSlop={8}
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
      )}
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
          placeSearch.clearSelectedPlace();
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
          placeSearch.clearSelectedPlace();
          sheetRef.current?.close();
        }}
        onFinishRoute={() => {
          clearRouteAndPlace();
        }}
        onRequestClose={handleRequestSheetClose}
        onSheetChange={(index) => setIsSheetOpen(index >= 0)}
      />
      <Modal
        visible={isStopNameModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeStopNameModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nombre de la parada</Text>
            <Text style={styles.modalDescription}>
              Escribe un nombre que ayude a reconocer este lugar.
            </Text>
            <TextInput
              autoFocus
              value={stopName}
              onChangeText={setStopName}
              placeholder="Ejemplo: Valdez"
              placeholderTextColor="#7B8794"
              maxLength={80}
              editable={!isAddingStop}
              returnKeyType="done"
              style={styles.stopNameInput}
              onSubmitEditing={() => void handleAddStop()}
            />
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
                  (!stopName.trim() || isAddingStop) &&
                    styles.addStopButtonDisabled,
                ]}
                disabled={!stopName.trim() || isAddingStop}
                onPress={() => void handleAddStop()}
              >
                {isAddingStop ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar parada</Text>
                )}
              </Pressable>
            </View>
          </View>
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
  addStopButton: {
    position: "absolute",
    top: 168,
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
    gap: 12,
    padding: 20,
    borderRadius: theme.size_rounded.lg,
    backgroundColor: theme.surface.background,
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
