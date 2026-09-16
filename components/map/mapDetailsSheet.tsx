import PrimaryBottomSheet, {
  PrimaryBottomSheetRef,
} from "@/components/bottomSheet/primaryBottomSheet";
import ActiveRouteBadge from "@/components/map/activeRouteBadge";
import RouteCard from "@/components/ui/Cards/routeCard";
import type { PassengerJourneyPhase } from "@/hooks/usePassengerJourney";
import { GooglePlace, RouteRecommendation } from "@/interfaces/transport.type";
import { Bookmark, Star, Xmark } from "iconoir-react-native";
import { RefObject } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
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
  error: string | null;
  onFindRoute: () => void;
  onStartRoute: () => void;
  onCancelRoute: () => void;
  onConfirmBoarding: () => void;
  onConfirmExit: () => void;
  onFinishRoute: () => void;
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
  error,
  onFindRoute,
  onStartRoute,
  onCancelRoute,
  onConfirmBoarding,
  onConfirmExit,
  onFinishRoute,
  onSheetChange,
}: MapDetailsSheetProps) {
  return (
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Guardar lugar"
            hitSlop={8}
            style={styles.closeButton}
          >
            <Bookmark width={15} height={15} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar panel de detalles"
            hitSlop={8}
            style={styles.closeButton}
            onPress={() => sheetRef.current?.close()}
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
            busPlate={recommendation.bus.plate}
            busType={recommendation.bus.busType}
            startStop={recommendation.boardingStop.name}
            endStop={recommendation.destinationStop.name}
            routeTime={`${recommendation.estimatedRideMinutes} min`}
            routeFair={recommendation.route.fareAprox}
            calification={recommendation.bus.ratingAverage}
            timeNearestBus={timeNearestBus}
            routeDirection={
              recommendation.direction === "outbound" ? "Ida" : "Regreso"
            }
          />
          {isRouteActive ? (
            <JourneyStatus
              phase={passengerPhase}
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
  );
}

type JourneyStatusProps = {
  phase: PassengerJourneyPhase;
  boardingStopName: string;
  destinationStopName: string;
  onConfirmBoarding: () => void;
  onConfirmExit: () => void;
};

function JourneyStatus({
  phase,
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
          Sigues cerca de {destinationStopName} y el bus se está alejando.
          Confirma que ya bajaste.
        </Text>
        <PrimaryAction text="Sí, ya bajé" onPress={onConfirmExit} />
      </View>
    );
  }

  return (
    <Text style={styles.compactStatus}>
      {phase === "onBoard"
        ? `Vas dentro del bus. Te avisaremos al llegar a ${destinationStopName}.`
        : `Dirígete a ${boardingStopName}. Te avisaremos cuando llegue el bus.`}
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
}));
