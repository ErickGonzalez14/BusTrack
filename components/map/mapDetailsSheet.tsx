import PrimaryBottomSheet, {
  PrimaryBottomSheetRef,
} from "@/components/bottomSheet/primaryBottomSheet";
import ActiveRouteBadge from "@/components/map/activeRouteBadge";
import RouteCard from "@/components/ui/Cards/routeCard";
import type { PassengerJourneyPhase } from "@/hooks/usePassengerJourney";
import { GooglePlace, RouteRecommendation } from "@/interfaces/transport.type";
import {
  getFavoriteSite,
  saveFavoriteSite,
} from "@/Services/favoriteSites.service";
import { Bookmark, Star, Xmark } from "iconoir-react-native";
import { RefObject, useEffect, useState } from "react";
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
import { StyleSheet } from "react-native-unistyles";

type MapDetailsSheetProps = {
  sheetRef: RefObject<PrimaryBottomSheetRef | null>;
  place: GooglePlace | null;
  recommendation: RouteRecommendation | null;
  isLoadingPlace: boolean;
  isFindingRoute: boolean;
  isLoadingRoad: boolean;
  canStartRoute: boolean;
  isRouteActive: boolean;
  activeRoute: RouteRecommendation | null;
  activeRouteStatus: "running" | "nearDestination" | "arrived";
  passengerPhase: PassengerJourneyPhase;
  timeNearestBus: string;
  hasLiveBus: boolean;
  error: string | null;
  onFindRoute: () => void;
  onStartRoute: () => void;
  onCancelRoute: () => void;
  onConfirmBoarding: () => void;
  onConfirmExit: () => void;
  onFinishRoute: () => void;
  onRequestClose: () => void;
  onSheetChange: (index: number) => void;
};

const formatDistance = (distance: number) =>
  distance < 1000
    ? `${Math.round(distance)} m`
    : `${(distance / 1000).toFixed(1)} km`;

export default function MapDetailsSheet({
  sheetRef,
  place,
  recommendation,
  isLoadingPlace,
  isFindingRoute,
  isLoadingRoad,
  canStartRoute,
  isRouteActive,
  activeRoute,
  activeRouteStatus,
  passengerPhase,
  timeNearestBus,
  hasLiveBus,
  error,
  onFindRoute,
  onStartRoute,
  onCancelRoute,
  onConfirmBoarding,
  onConfirmExit,
  onFinishRoute,
  onRequestClose,
  onSheetChange,
}: MapDetailsSheetProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [savedFavoriteName, setSavedFavoriteName] = useState("");
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  useEffect(() => {
    let isCurrentPlace = true;

    setIsFavorite(false);
    setSavedFavoriteName("");
    setIsFavoriteModalOpen(false);

    if (!place?.id) return () => undefined;

    void getFavoriteSite(place.id)
      .then((favorite) => {
        if (!isCurrentPlace || !favorite) return;
        setIsFavorite(true);
        setSavedFavoriteName(favorite.name);
      })
      .catch((favoriteError) => {
        console.warn("No se pudo consultar el lugar favorito:", favoriteError);
      });

    return () => {
      isCurrentPlace = false;
    };
  }, [place?.id]);

  const openFavoriteModal = () => {
    if (!place) return;
    setFavoriteName(savedFavoriteName || place.name);
    setIsFavoriteModalOpen(true);
  };

  const closeFavoriteModal = () => {
    if (isSavingFavorite) return;
    setIsFavoriteModalOpen(false);
    setFavoriteName("");
  };

  const handleSaveFavorite = async () => {
    const cleanName = favoriteName.trim();
    if (!place || !cleanName || isSavingFavorite) return;

    setIsSavingFavorite(true);

    try {
      await saveFavoriteSite({
        placeId: place.id,
        name: cleanName,
        originalName: place.name,
        address: place.address,
        coordinate: place.coordinate,
        placeType: place.type,
      });
      setIsFavorite(true);
      setSavedFavoriteName(cleanName);
      setIsFavoriteModalOpen(false);
      setFavoriteName("");
      Alert.alert("Lugar guardado", `${cleanName} se agregó a tus favoritos.`);
    } catch (favoriteError) {
      Alert.alert(
        "No pudimos guardar el lugar",
        favoriteError instanceof Error
          ? favoriteError.message
          : "Inténtalo nuevamente en unos momentos.",
      );
    } finally {
      setIsSavingFavorite(false);
    }
  };

  return (
    <>
      <PrimaryBottomSheet
        ref={sheetRef}
        snapPoints={["15%", "35%"]}
        showBackdrop={false}
        enablePanDownToClose={false}
        onChange={onSheetChange}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {place?.name}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
            {place?.address && !recommendation && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite ? "Editar lugar favorito" : "Guardar lugar"
                }
                hitSlop={8}
                style={styles.closeButton}
                onPress={openFavoriteModal}
              >
                <Bookmark
                  width={15}
                  height={15}
                  color="#FFFFFF"
                  fill={isFavorite || isFavoriteModalOpen ? "#FFFFFF" : "none"}
                  strokeWidth={3}
                />
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar panel de detalles"
              hitSlop={8}
              style={styles.closeButton}
              onPress={onRequestClose}
            >
              <Xmark width={15} height={15} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>
        </View>
        {activeRoute && (
          <ActiveRouteBadge
            route={activeRoute}
            status={activeRouteStatus}
            onFinish={onFinishRoute}
          />
        )}
        {isLoadingPlace && !place ? (
          <ActivityIndicator size="large" />
        ) : recommendation ? (
          <View style={styles.content}>
            {!isRouteActive && (
              <>
                <Text style={styles.eyebrow}>RUTA RECOMENDADA</Text>
                <Text style={styles.title}>{recommendation.route.name}</Text>
                <Text style={styles.description}>
                  Camina {""}{" "}
                  {formatDistance(recommendation.walkingDistanceMeters)} {""}
                  hasta{""}
                  <Text style={styles.constrastText}>
                    {` ${recommendation.boardingStop.name}`}
                  </Text>{" "}
                  {""}. Baja en{""}
                  <Text style={styles.constrastText}>
                    {` ${recommendation.destinationStop.name}`}
                  </Text>{" "}
                  {""}, a {""}
                  {` ${formatDistance(recommendation.destinationDistanceMeters)}`}{" "}
                  {""} de
                  {` ${place?.name ?? "tu destino"}`}.
                </Text>
              </>
            )}
            <RouteCard
              busPlate={recommendation.bus
                ? recommendation.bus.publicTransportPlate || recommendation.bus.licensePlate || "Bus registrado"
                : "Sin bus asignado"}
              busType={recommendation.bus?.routeType || recommendation.route.routeType}
              startStop={recommendation.boardingStop.name}
              endStop={recommendation.destinationStop.name}
              routeTime={recommendation.estimatedRideMinutes === null
                ? "Por confirmar"
                : `${recommendation.estimatedRideMinutes} min`}
              routeFair={recommendation.route.fareAprox}
              calification={recommendation.bus?.ratingAverage ?? recommendation.route.ratingAverage}
              timeNearestBus={timeNearestBus}
              routeDirection={
                recommendation.direction === "outbound" ? "Ida" : "Regreso"
              }
            />
            {isRouteActive ? (
              <JourneyStatus
                phase={passengerPhase}
                hasLiveBus={hasLiveBus}
                boardingStopName={recommendation.boardingStop.name}
                destinationStopName={recommendation.destinationStop.name}
                onConfirmBoarding={onConfirmBoarding}
                onConfirmExit={onConfirmExit}
              />
            ) : (
              <>
                <PrimaryAction
                  text={
                    isLoadingRoad
                      ? "Calculando recorrido por carretera"
                      : "Confirmar e iniciar ruta"
                  }
                  onPress={onStartRoute}
                  isLoading={isLoadingRoad}
                  disabled={isLoadingRoad || !canStartRoute}
                />
                <Pressable style={styles.cancelButton} onPress={onCancelRoute}>
                  <Text style={styles.cancelButtonText}>Cancelar ruta</Text>
                </Pressable>
              </>
            )}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        ) : place ? (
          <View style={styles.content}>
            {place.address && (
              <Text style={styles.description}>{place.address}</Text>
            )}
            <View style={styles.facts}>
              {typeof place.rating === "number" && (
                <View style={styles.fact}>
                  <Star width={20} height={20} color="#F4B400" />
                  <Text style={styles.factText}>
                    {place.rating.toFixed(1)}
                    {place.userRatingCount ? ` (${place.userRatingCount})` : ""}
                  </Text>
                </View>
              )}
              {typeof place.openNow === "boolean" && (
                <Text style={place.openNow ? styles.open : styles.closed}>
                  {place.openNow ? "Abierto ahora" : "Cerrado ahora"}
                </Text>
              )}
            </View>
            <PrimaryAction
              text="Ir a este lugar"
              onPress={onFindRoute}
              isLoading={isFindingRoute}
              disabled={isFindingRoute || isLoadingPlace}
            />
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
      </PrimaryBottomSheet>
      <Modal
        visible={isFavoriteModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeFavoriteModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Guardar lugar favorito</Text>
            <Text style={styles.modalDescription}>
              Ponle un nombre personalizado para encontrarlo fácilmente.
            </Text>
            <TextInput
              autoFocus
              value={favoriteName}
              onChangeText={setFavoriteName}
              placeholder="Ejemplo: Casa de mamá"
              placeholderTextColor="#7B8794"
              maxLength={80}
              editable={!isSavingFavorite}
              returnKeyType="done"
              style={styles.favoriteNameInput}
              onSubmitEditing={() => void handleSaveFavorite()}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                disabled={isSavingFavorite}
                onPress={closeFavoriteModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSaveButton,
                  (!favoriteName.trim() || isSavingFavorite) &&
                    styles.buttonDisabled,
                ]}
                disabled={!favoriteName.trim() || isSavingFavorite}
                onPress={() => void handleSaveFavorite()}
              >
                {isSavingFavorite ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

type JourneyStatusProps = {
  phase: PassengerJourneyPhase;
  hasLiveBus: boolean;
  boardingStopName: string;
  destinationStopName: string;
  onConfirmBoarding: () => void;
  onConfirmExit: () => void;
};

function JourneyStatus({
  phase,
  hasLiveBus,
  boardingStopName,
  destinationStopName,
  onConfirmBoarding,
  onConfirmExit,
}: JourneyStatusProps) {
  if (phase === "boardingPrompt") {
    return (
      <View style={styles.journeyMessage}>
        <Text style={styles.journeyMessageText}>
          El bus está contigo en {boardingStopName}. Confirma cuando hayas
          abordado.
        </Text>
        <PrimaryAction
          text="Ya estoy dentro del bus"
          onPress={onConfirmBoarding}
        />
      </View>
    );
  }

  if (phase === "exitPrompt") {
    return (
      <View style={styles.journeyMessage}>
        <Text style={styles.journeyMessageText}>
          Estás cerca de {destinationStopName}. Confirma cuando hayas bajado.
        </Text>
        <PrimaryAction text="Sí, ya bajé" onPress={onConfirmExit} />
      </View>
    );
  }

  return (
    <Text style={styles.compactStatus}>
      {phase === "onBoard"
        ? `Vas dentro del bus. Te avisaremos al llegar a ${destinationStopName}.`
        : hasLiveBus
          ? `Dirígete a ${boardingStopName}. Te avisaremos cuando el bus esté cerca.`
          : `Dirígete a ${boardingStopName}. Por ahora no hay una ubicación del bus en vivo.`}
    </Text>
  );
}

type PrimaryActionProps = {
  text: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

function PrimaryAction({
  text,
  onPress,
  isLoading = false,
  disabled = false,
}: PrimaryActionProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{text}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",

    gap: 8,
  },
  closeButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    padding: 0,
  },
  content: {
    gap: 12,
    marginTop: 5,
  },
  eyebrow: {
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
    color: theme.text.contrast,
  },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 24,
    color: theme.text.Body,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: theme.text.placeholder,
  },
  facts: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  factText: {
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  open: {
    fontFamily: theme.fonts.heavy,
    color: "#16833B",
  },
  closed: {
    fontFamily: theme.fonts.heavy,
    color: "#C62828",
  },
  button: {
    minHeight: 48,
    borderRadius: theme.size_rounded.sm,
    backgroundColor: theme.components.buttons.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: theme.text.Secondary,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  cancelButton: {
    minHeight: 44,
    borderRadius: theme.size_rounded.sm,
    borderWidth: 1,
    borderColor: theme.text.placeholder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
  },
  error: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#C62828",
  },
  constrastText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.contrast,
  },
  compactStatus: {
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
    lineHeight: 19,
    color: theme.text.contrast,
  },
  journeyMessage: {
    gap: 10,
    padding: 12,
    borderRadius: theme.size_rounded.sm,
    backgroundColor: theme.surface.neutral,
  },
  journeyMessageText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
    lineHeight: 19,
    color: theme.text.Body,
  },
  name: {
    fontFamily: theme.fonts.heavy,
    fontSize: 24,
    color: theme.text.Body,
    flexShrink: 1,
    flex: 1,
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
  favoriteNameInput: {
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
    minWidth: 110,
    minHeight: 44,
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
}));
