import { RouteRecommendation } from "@/interfaces/transport.type";
import { Bus } from "iconoir-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ActiveRouteBadgeProps = {
  route: RouteRecommendation;
  status: "running" | "nearDestination" | "arrived";
  onFinish: () => void;
};

export default function ActiveRouteBadge({
  route,
  status,
  onFinish,
}: ActiveRouteBadgeProps) {
  const direction = route.direction === "outbound" ? "Ida" : "Regreso";
  const message =
    status === "arrived"
      ? `Llegaste a ${route.destinationStop.name}`
      : status === "nearDestination"
        ? `Estás a punto de llegar a ${route.destinationStop.name}`
        : `${route.bus?.simulated ? "Simulación" : "Viaje en curso"} · ${route.route.name} · ${direction}`;

  return (
    <View style={styles.container}>
      <View style={styles.message}>
        <Bus width={20} height={20} color="#FFFFFF" />
        <Text style={styles.text}>{message}</Text>
      </View>
      <Pressable style={styles.finishButton} onPress={onFinish}>
        <Text style={styles.finishText}>Finalizar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 12,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
  },
  text: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
  },
  message: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  finishButton: {
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  finishText: {
    color: theme.surface.primary,
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
  },
}));
