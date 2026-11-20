import ButtonSecondary from "@/src/shared/ui/buttons/buttonSecundary";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import DownloadedRouteDetail from "../components/DownloadedRouteDetail";
import type { DownloadedRoute } from "../domain/downloadedRoute";
import { useDownloadedRoutes } from "../hooks/useDownloadedRoutes";

export default function DownloadedRoutesScreen() {
  const { routeId } = useLocalSearchParams<{ routeId?: string }>();
  const [selectedId, setSelectedId] = useState(typeof routeId === "string" ? routeId : null);
  const { bottom } = useSafeAreaInsets();
  const { routes, canOpen, isCheckingAccess, isLoading, storageError, remove } = useDownloadedRoutes();
  const selected = routes.find(({ id }) => id === selectedId);

  function confirmDelete(route: DownloadedRoute) {
    Alert.alert("Eliminar descarga", route.name, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => remove.mutate(route.id, {
          onSuccess: () => setSelectedId((id) => id === route.id ? null : id),
          onError: () => Alert.alert("No se pudo eliminar la descarga", "Inténtalo de nuevo."),
        }),
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <AlternativeHeader
        SettingName="Rutas descargadas"
        onTouch={() => selected ? setSelectedId(null) : router.back()}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}>
        {isCheckingAccess || isLoading ? (
          <ActivityIndicator accessibilityLabel="Cargando rutas descargadas" />
        ) : storageError ? (
          <Text accessibilityRole="alert" style={styles.body}>No se pudieron leer las descargas del dispositivo.</Text>
        ) : !canOpen ? (
          <Text style={styles.body}>
            Necesitas Premium activo para abrir rutas descargadas. Conéctate a internet para verificar tu suscripción.
          </Text>
        ) : selected ? (
          <DownloadedRouteDetail key={`${selected.id}:${selected.downloadedAt}`} route={selected} />
        ) : routes.length === 0 ? (
          <Text style={styles.body}>Busca un destino en Mapa y toca «Descargar ruta» en la ruta recomendada.</Text>
        ) : (
          routes.map((route) => (
            <View key={route.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${route.name}`}
                style={styles.open}
                onPress={() => setSelectedId(route.id)}
              >
                <Text style={styles.title}>{route.name}</Text>
                <Text style={styles.body}>
                  {route.directions.map(({ direction }) => direction === "outbound" ? "Ida" : "Regreso").join(" · ")}
                </Text>
              </Pressable>
              <ButtonSecondary title="Eliminar descarga" onPress={() => confirmDelete(route)} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.surface.neutral },
  content: { padding: 20, gap: 12 },
  card: {
    gap: 8, padding: 12, backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
  },
  open: { minHeight: 44, justifyContent: "center", gap: 4 },
  title: { color: theme.text.Body, fontFamily: theme.fonts.heavy, fontSize: 18 },
  body: { color: theme.text.Body, fontFamily: theme.fonts.regular, fontSize: 15 },
}));
