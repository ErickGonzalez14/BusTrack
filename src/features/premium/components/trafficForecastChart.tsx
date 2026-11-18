import { authenticatedBackendRequest } from "@/src/features/premium/data/premiumSync.service";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Corridor = {
  label: string;
  hours: { hour: number; minutes: number | null }[];
};

const dayLabel = new Intl.DateTimeFormat("es-PA", {
  weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
});

function forecastDates() {
  const panamaNow = Date.now() - 5 * 60 * 60 * 1000;
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(panamaNow + (7 + offset) * 86_400_000);
    return { value: date.toISOString().slice(0, 10), label: dayLabel.format(date) };
  });
}

export default function TrafficForecastChart() {
  const [selected, setSelected] = useState<string | null>(null);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const dates = forecastDates();

  async function selectDay(date: string) {
    if (pending.current || (date === selected && corridors.length)) return;
    pending.current = true;
    setSelected(date);
    setLoading(true);
    setError(null);
    setCorridors([]);
    try {
      const forecast = await authenticatedBackendRequest("/premium/traffic-forecast", { date });
      if (forecast.date !== date || !Array.isArray(forecast.corridors) || !forecast.corridors.length) {
        throw new Error("No recibimos el pronóstico para este día.");
      }
      setCorridors(forecast.corridors as Corridor[]);
    } catch (reason) {
      const message = (reason as Error).message;
      setError(message === "Ruta no encontrada"
        ? "El pronóstico aún no está disponible en el servidor."
        : message);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>Predicción de tráfico vial</Text>
      <Text style={styles.body}>Elige un día. Los tiempos son en carro, en hora de Panamá.</Text>
      <ScrollView horizontal contentContainerStyle={styles.days}>
        {dates.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: value === selected, disabled: loading }}
            disabled={loading}
            onPress={() => void selectDay(value)}
            style={[styles.day, value === selected && styles.selectedDay]}
          >
            <Text style={[styles.body, value === selected && styles.selectedText]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading && <ActivityIndicator accessibilityLabel="Consultando el pronóstico" />}
      {error && <Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
      {corridors.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.body}>Duración estimada con tráfico · min</Text>
          {corridors.map(({ label, hours }) => {
            const scale = Math.max(1, ...hours.map(({ minutes }) => minutes ?? 0));
            return (
              <View key={label} style={styles.series}>
                <Text style={styles.corridor}>{label}</Text>
                <View style={styles.chart}>
                  {hours.map(({ hour, minutes }) => {
                    const time = `${String(hour).padStart(2, "0")}:00`;
                    return (
                      <View key={hour} style={styles.column} accessible
                        accessibilityLabel={`${time}: ${minutes === null ? "sin pronóstico" : `${minutes} minutos`}`}>
                        <Text style={styles.body}>{minutes ?? "—"}</Text>
                        <View style={styles.track}>
                          {minutes !== null && (
                            <View style={[styles.bar, { height: 52 * minutes / scale }]} />
                          )}
                        </View>
                        <Text style={styles.body}>{time}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <Text style={styles.attribution}>Google Maps</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { backgroundColor: theme.surface.background, borderRadius: 18, padding: 16, marginBottom: 20, gap: 10 },
  title: { color: theme.text.Body, fontFamily: theme.fonts.heavy, fontSize: 19 },
  body: { color: theme.text.Body, fontFamily: theme.fonts.regular, fontSize: 13 },
  days: { gap: 8 },
  day: { minHeight: 44, paddingHorizontal: 12, justifyContent: "center", borderRadius: 8, backgroundColor: theme.surface.neutral },
  selectedDay: { backgroundColor: theme.surface.brand },
  selectedText: { color: "#fff", fontFamily: theme.fonts.heavy },
  results: { gap: 10, padding: 12, borderRadius: 10, backgroundColor: theme.surface.neutral },
  series: { gap: 5 },
  corridor: { color: theme.text.Body, fontFamily: theme.fonts.heavy, fontSize: 14 },
  chart: { flexDirection: "row" },
  column: { flex: 1, alignItems: "center", gap: 3 },
  track: { height: 52, width: 22, justifyContent: "flex-end" },
  bar: { backgroundColor: theme.surface.brand, borderRadius: 4 },
  attribution: { alignSelf: "flex-end", fontSize: 12, color: "#1F1F1F", backgroundColor: "#fff", paddingHorizontal: 4 },
}));
