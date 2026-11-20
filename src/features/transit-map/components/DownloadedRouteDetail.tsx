import ButtonSecondary from "@/src/shared/ui/buttons/buttonSecundary";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { nearestDownloadedStop, type DownloadedRoute } from "../domain/downloadedRoute";
import type { Coordinate } from "../domain/transport.type";
import { useMapLocation } from "../hooks/useMapLocation";

const WIDTH = 320;
const HEIGHT = 168;
const PADDING = 14;

function RouteDiagram({
  stops,
  nearestIndex,
}: {
  stops: DownloadedRoute["directions"][number]["stops"];
  nearestIndex?: number;
}) {
  const { theme } = useUnistyles();
  const latitudeScale = Math.cos(stops[0].coordinate.latitude * Math.PI / 180);
  const projected = stops.map(({ coordinate }) => ({
    x: coordinate.longitude * latitudeScale,
    y: -coordinate.latitude,
  }));
  const minX = Math.min(...projected.map(({ x }) => x));
  const minY = Math.min(...projected.map(({ y }) => y));
  const spanX = Math.max(...projected.map(({ x }) => x)) - minX;
  const spanY = Math.max(...projected.map(({ y }) => y)) - minY;
  const scale = Math.min(
    (WIDTH - PADDING * 2) / Math.max(spanX, 0.000001),
    (HEIGHT - PADDING * 2) / Math.max(spanY, 0.000001),
  );
  const points = projected.map(({ x, y }) => ({
    x: (WIDTH - spanX * scale) / 2 + (x - minX) * scale,
    y: (HEIGHT - spanY * scale) / 2 + (y - minY) * scale,
  }));

  return (
    <View style={styles.diagram}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={theme.text.contrast}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {points.map(({ x, y }, index) => (
          <Circle
            key={`${stops[index].id}-${index}`}
            cx={x}
            cy={y}
            r={index === nearestIndex ? 6 : 3}
            fill={index === nearestIndex ? theme.text.contrast : theme.surface.background}
            stroke={theme.text.contrast}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </View>
  );
}

export default function DownloadedRouteDetail({ route }: { route: DownloadedRoute }) {
  const [selected, setSelected] = useState(0);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { getFreshUserLocation } = useMapLocation({ loadOnMount: false });
  const { stops } = route.directions[selected];
  const nearest = location ? nearestDownloadedStop(stops, location) : undefined;

  async function locateNearest() {
    if (isLocating) return;
    setLocation(null);
    setLocationError(null);
    setIsLocating(true);
    try {
      setLocation(await getFreshUserLocation(15_000));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "No se pudo obtener tu ubicación.");
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <View style={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>{route.name}</Text>
      <View style={styles.directions}>
        {route.duration !== undefined && <Text style={styles.body}>Duración aprox. {route.duration} min</Text>}
        {route.fare !== undefined && <Text style={styles.body}>Tarifa aprox. ${route.fare.toFixed(2)}</Text>}
      </View>
      <View style={styles.directions}>
        {route.directions.map(({ direction }, index) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected === index }}
            key={direction}
            onPress={() => setSelected(index)}
            style={[styles.direction, selected === index && styles.selected]}
          >
            <Text style={selected === index ? styles.selectedText : styles.body}>
              {direction === "outbound" ? "Ida" : "Regreso"}
            </Text>
          </Pressable>
        ))}
      </View>
      <RouteDiagram stops={stops} nearestIndex={nearest?.index} />
      <Text style={styles.body}>Trazado esquemático entre paradas</Text>
      <ButtonSecondary
        title={isLocating ? "Buscando señal GPS…" : "Buscar parada más cercana"}
        onPress={() => void locateNearest()}
      />
      {locationError && <Text accessibilityRole="alert" style={styles.body}>{locationError}</Text>}
      {nearest && (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          Más cercana en línea recta · {nearest.stop.name} · {Math.round(nearest.meters)} m
        </Text>
      )}
      <Text accessibilityRole="header" style={styles.subtitle}>Paradas</Text>
      {stops.map((stop, index) => (
        <View key={`${stop.id}-${index}`} style={[styles.stop, index === nearest?.index && styles.nearest]}>
          <Text style={styles.body}>{index + 1}. {stop.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { gap: 12 },
  title: { fontFamily: theme.fonts.heavy, color: theme.text.Body, fontSize: 24 },
  subtitle: { fontFamily: theme.fonts.heavy, color: theme.text.Body, fontSize: 18 },
  body: { fontFamily: theme.fonts.regular, color: theme.text.Body, fontSize: 15 },
  directions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  direction: {
    minHeight: 44, justifyContent: "center", paddingHorizontal: 16,
    borderRadius: theme.size_rounded.full, backgroundColor: theme.surface.background,
  },
  selected: { backgroundColor: theme.surface.primary },
  selectedText: { fontFamily: theme.fonts.heavy, color: theme.text.Secondary, fontSize: 15 },
  diagram: { borderRadius: theme.size_rounded.md, backgroundColor: theme.surface.background },
  stop: { padding: 12, borderRadius: theme.size_rounded.sm, backgroundColor: theme.surface.background },
  nearest: { borderWidth: 1, borderColor: theme.text.contrast },
}));
