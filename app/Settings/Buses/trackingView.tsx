import { useAuth } from "@/contexts/authContext";
import { useBusTracking } from "@/hooks/useBusTracking";
import { useActiveBus } from "@/hooks/useRequests";
import {
    BackdropBlur,
    Canvas,
    Fill,
    Image as SkiaImage,
    useImage,
} from "@shopify/react-native-skia";
import {
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

const background = require("@/assets/images/BackGround.jpg");
const logo = require("@/assets/images/logoWB.png");

export default function TrackingView() {
  const { user } = useAuth();
  const { approvedBuses, isBusLoading } = useActiveBus();
  const { isTracking, isBusy, start, stop } = useBusTracking(user?.uid);
  const [showBusPicker, setShowBusPicker] = useState(false);
  const { width, height } = useWindowDimensions();
  const [backgroundSize, setBackgroundSize] = useState({ width, height });
  const diameter = Math.min(backgroundSize.width * 0.66, 280);
  const skiaBackground = useImage(background);
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const hasNativeGlass =
    isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  useEffect(() => {
    if (!isTracking || reducedMotion) {
      scale.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.065,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => {
      pulse.stop();
      scale.setValue(1);
    };
  }, [isTracking, reducedMotion, scale]);

  const startSelectedBus = async (busId: string) => {
    setShowBusPicker(false);
    try {
      await start(busId);
    } catch (error) {
      Alert.alert(
        "No se pudo iniciar el seguimiento",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  };

  const toggleTracking = async () => {
    if (isBusy) return;
    if (isTracking) {
      try {
        await stop();
      } catch (error) {
        Alert.alert(
          "No se pudo detener el seguimiento",
          error instanceof Error ? error.message : "Inténtalo de nuevo.",
        );
      }
      return;
    }
    if (isBusLoading) {
      Alert.alert(
        "Cargando buses",
        "Espera un momento para iniciar el seguimiento.",
      );
    } else if (approvedBuses.length === 0) {
      Alert.alert(
        "Sin bus aprobado",
        "Necesitas un bus aprobado para compartir su ubicación.",
      );
    } else if (approvedBuses.length === 1) {
      await startSelectedBus(approvedBuses[0].id);
    } else {
      setShowBusPicker(true);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ImageBackground
        source={background}
        resizeMode="stretch"
        style={styles.background}
        onLayout={({ nativeEvent: { layout } }) => {
          setBackgroundSize((current) =>
            current.width === layout.width && current.height === layout.height
              ? current
              : { width: layout.width, height: layout.height },
          );
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isTracking
              ? "Detener seguimiento del bus"
              : "Iniciar seguimiento del bus"
          }
          accessibilityHint="Toca para iniciar o detener el envío de ubicación"
          accessibilityState={{ checked: isTracking, disabled: isBusy }}
          disabled={isBusy}
          onPress={() => void toggleTracking()}
          style={styles.touchArea}
        >
          <Animated.View
            style={[
              styles.circle,
              { width: diameter, height: diameter, borderRadius: diameter / 2 },
              { transform: [{ scale }] },
            ]}
          >
            {hasNativeGlass ? (
              <GlassView
                glassEffectStyle="clear"
                tintColor="#6BA9DF"
                style={[styles.glassFill, { borderRadius: diameter / 2 }]}
              />
            ) : (
              <Canvas pointerEvents="none" style={styles.skiaGlass}>
                <SkiaImage
                  image={skiaBackground}
                  fit="fill"
                  x={-(backgroundSize.width - diameter) / 2}
                  y={-(backgroundSize.height - diameter) / 2 - 12}
                  width={backgroundSize.width}
                  height={backgroundSize.height}
                />
                <BackdropBlur
                  blur={50}
                  clip={{ x: 0, y: 0, width: diameter, height: diameter }}
                >
                  <Fill color="rgba(139, 203, 238, 0.16)" />
                </BackdropBlur>
              </Canvas>
            )}
            <Image source={logo} resizeMode="contain" style={styles.logo} />
          </Animated.View>
        </Pressable>
      </ImageBackground>
      <Modal
        transparent
        visible={showBusPicker}
        animationType="fade"
        onRequestClose={() => setShowBusPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.busPicker}>
            <Text style={styles.pickerTitle}>Selecciona tu bus</Text>
            {approvedBuses.map((bus) => (
              <Pressable
                key={bus.id}
                accessibilityRole="button"
                onPress={() => void startSelectedBus(bus.id)}
                style={styles.busOption}
              >
                <Text style={styles.busPlate}>{bus.licensePlate}</Text>
                <Text style={styles.busSecondary}>
                  {bus.publicTransportPlate}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowBusPicker(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  touchArea: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: 12 }],
  },
  circle: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  skiaGlass: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width: 114,
    height: 74,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(8, 22, 54, 0.58)",
  },
  busPicker: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  pickerTitle: {
    color: "#132B60",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  busOption: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#EDF4FC",
  },
  busPlate: {
    color: "#132B60",
    fontSize: 16,
    fontWeight: "700",
  },
  busSecondary: {
    color: "#47628D",
    fontSize: 14,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
  },
  cancelText: {
    color: "#345A9A",
    fontSize: 15,
  },
});
