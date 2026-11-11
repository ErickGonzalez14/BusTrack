import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import InputText from "@/components/ui/inputText";
import { Image } from "expo-image";
import { Heart } from "iconoir-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Svg, {
    Circle,
    Line,
    Polygon,
} from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const STAR_POINTS =
  "18,3 22.2,12.3 32.5,13.5 24.8,20.5 27,31 18,25.7 9,31 11.2,20.5 3.5,13.5 13.8,12.3";

function RatingStar({
  value,
  rating,
  onPress,
}: {
  value: number;
  rating: number;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const fillWidth = useRef(new Animated.Value(0)).current;
  const previousWidth = useRef(0);

  useEffect(() => {
    const targetWidth = rating >= value ? 35 : rating === value - 0.5 ? 17.5 : 0;
    const delay = targetWidth > previousWidth.current && !reducedMotion ? (value - 1) * 65 : 0;
    previousWidth.current = targetWidth;
    const animation = Animated.timing(fillWidth, {
      toValue: targetWidth,
      duration: reducedMotion ? 0 : 280,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [fillWidth, rating, reducedMotion, value]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
      accessibilityHint={
        value > 1 ? "Toca de nuevo para seleccionar media estrella" : undefined
      }
      accessibilityState={{ selected: rating >= value - 0.5 }}
      onPress={onPress}
      style={styles.starButton}
    >
      <View style={styles.starGraphic}>
        <Animated.View style={[styles.animatedStarFill, { width: fillWidth }]}>
          <Svg width={35} height={35} viewBox="0 0 36 36">
            <Polygon points={STAR_POINTS} fill="#FFD635" />
          </Svg>
        </Animated.View>
        <Svg width={35} height={35} viewBox="0 0 36 36" style={styles.starOutline}>
          <Polygon
            points={STAR_POINTS}
            fill="none"
            stroke="#E6BA18"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
}
type FinishRouteCardProps = {
  visible: boolean;
  onRate: (rating: number, fare: number) => void;
  onDismiss: () => void;
  isSubmitting?: boolean;
  onFavoriteChange?: (favorite: boolean) => void;
  initialFare?: string;
  initialFavorite?: boolean;
};

export default function FinishRouteCard({
  visible,
  onRate,
  onDismiss,
  isSubmitting = false,
  onFavoriteChange,
  initialFare = "",
  initialFavorite = false,
}: FinishRouteCardProps) {
  const { theme } = useUnistyles();
  const [rating, setRating] = useState(0);
  const [fare, setFare] = useState(initialFare);
  const [favorite, setFavorite] = useState(initialFavorite);
  const enteredFare = Number(fare.trim().replace(",", "."));
  const fareError =
    fare.trim().length > 0 &&
    (!Number.isFinite(enteredFare) || enteredFare <= 0);
  const canSubmit =
    rating >= 1 &&
    fare.trim().length > 0 &&
    Number.isFinite(enteredFare) &&
    enteredFare > 0 &&
    !isSubmitting;

  const handleRate = () => {
    const normalizedFare = fare.trim().replace(",", ".");
    const parsedFare = Number(normalizedFare);
    if (!normalizedFare || !Number.isFinite(parsedFare) || parsedFare <= 0) {
      return;
    }
    if (rating === 0 || isSubmitting) return;
    onRate(rating, parsedFare);
  };

  const handleFavorite = () => {
    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    onFavoriteChange?.(nextFavorite);
  };

  const handleStarPress = (value: number) => {
    setRating((current) =>
      current === value && value > 1 ? value - 0.5 : value,
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isSubmitting) onDismiss();
      }}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Pressable
              accessibilityLabel={
                favorite ? "Quitar de favoritos" : "Guardar en favoritos"
              }
              accessibilityRole="button"
              accessibilityState={{ selected: favorite }}
              onPress={handleFavorite}
              style={styles.favoriteButton}
            >
              <Heart
                width={20}
                height={20}
                color={theme.icons.brand}
                fill={favorite ? theme.icons.brand : "none"}
              />
            </Pressable>

            <Text style={styles.heading}>
              Haz Completado <Text style={styles.headingStrong}>Tu Viaje</Text>
            </Text>
            <View style={styles.illustration}>
              <Image
                source={require("@/assets/images/FinishRouteImage.png")}
                style={styles.illustrationImage}
                contentFit="contain"
              />
            </View>

            <View
              style={styles.ratingRow}
              accessibilityLabel={`Calificación: ${rating} de 5 estrellas`}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <RatingStar
                  key={value}
                  value={value}
                  rating={rating}
                  onPress={() => handleStarPress(value)}
                />
              ))}
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Tarifa</Text>
              <View style={styles.fareField}>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  style={styles.searchIcon}
                  accessibilityElementsHidden
                >
                  <Circle
                    cx="8"
                    cy="8"
                    r="5.5"
                    fill="none"
                    stroke={theme.text.placeHolderLight}
                    strokeWidth="2"
                  />
                  <Line
                    x1="12"
                    y1="12"
                    x2="18"
                    y2="18"
                    stroke={theme.text.placeHolderLight}
                    strokeWidth="2"
                  />
                </Svg>
                <InputText
                  accessibilityLabel="Tarifa del viaje"
                  keyboardType="decimal-pad"
                  onChangeText={setFare}
                  placeholder="0.80"
                  style={styles.fareInput}
                  value={fare}
                />
              </View>
              {fareError && (
                <Text style={styles.errorText}>Ingresa una tarifa válida.</Text>
              )}
              <View style={styles.primaryButton}>
                <ButtonPrimary
                  text={isSubmitting ? "Guardando..." : "Calificar"}
                  onPress={handleRate}
                  disabled={!canSubmit}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onDismiss}
                disabled={isSubmitting}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissText}>No, Gracias</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 20, 35, 0.55)",
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    backgroundColor: theme.surface.background,
    borderRadius: 16,
    overflow: "hidden",
    paddingTop: 43,
  },
  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E7ECFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  heading: {
    fontFamily: theme.fonts.regular,
    fontSize: 21,
    color: theme.text.Primary,
    textAlign: "center",
  },
  headingStrong: {
    fontFamily: theme.fonts.heavy,
  },
  illustration: {
    height: 260,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: theme.surface.background,
  },
  starButton: {
    width: 39,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  starGraphic: {
    width: 35,
    height: 35,
  },
  animatedStarFill: {
    height: 35,
    overflow: "hidden",
  },
  starOutline: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  form: {
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 24,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.text.Body,
    marginBottom: 7,
  },
  fareField: {
    position: "relative",
    marginBottom: 24,
  },
  searchIcon: {
    position: "absolute",
    left: 20,
    top: 12,
    zIndex: 1,
  },
  fareInput: {
    marginBottom: 0,
    paddingLeft: 50,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    borderRadius: 15,
    boxShadow: "none",
  },
  errorText: {
    color: "#B42318",
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    marginTop: -18,
    marginBottom: 10,
  },
  primaryButton: {
    marginBottom: 8,
  },
  dismissButton: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: theme.surface.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
  },
  illustrationImage: {
    width: 280,
    height: 240,
  },
}));
