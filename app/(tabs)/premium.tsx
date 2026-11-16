import PrimaryHeader from "@/components/Headers/PrimaryHeader/primaryHeader";
import CommunityRouteCard from "@/components/ui/Cards/communityRouteCard";
import TripCard from "@/components/ui/Cards/tripCard";
import { useAuth } from "@/contexts/authContext";
import { usePremiumSubscription } from "@/hooks/usePremiumSubscription";
import { usePremiumCheckout } from "@/hooks/usePremiumCheckout";
import type { Stop } from "@/interfaces/stop.type";
import { getStops } from "@/Services/map.service";
import { syncPremiumPurchase } from "@/Services/premiumSync.service";
import {
  CommunityKind, CommunityRoute, CommunityTrip, createCommunityRoute,
  createCommunityTrip, getMyCommunityRating, rateCommunityItem,
  watchCommunityItems, watchMyPendingItems,
} from "@/Services/community.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type DraftKind = "route" | "trip";
const emptyDraft = {
  title: "", description: "", city: "", direction: "outbound" as "outbound" | "return",
  origin: "", destination: "", stops: "", distanceKm: "", durationMinutes: "",
};

export default function Premium() {
  const { user } = useAuth();
  const { status: subscriptionStatus, hasAccess } = usePremiumSubscription();
  const checkout = usePremiumCheckout(!hasAccess);
  const sdkExpiration = checkout.premium?.expirationDate
    ? Date.parse(checkout.premium.expirationDate) : undefined;
  const purchasePending = Boolean(checkout.premium &&
    (sdkExpiration === undefined || sdkExpiration > Date.now()));
  const [routes, setRoutes] = useState<CommunityRoute[]>([]);
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [pendingRoutes, setPendingRoutes] = useState<CommunityRoute[]>([]);
  const [pendingTrips, setPendingTrips] = useState<CommunityTrip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draftKind, setDraftKind] = useState<DraftKind | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [availableStops, setAvailableStops] = useState<Stop[]>([]);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<{ kind: CommunityKind; item: CommunityRoute | CommunityTrip } | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.uid && hasAccess) {
      void syncPremiumPurchase(user.uid).catch(() => undefined);
    }
  }, [user?.uid, hasAccess]);

  useEffect(() => {
    if (!user?.uid || !hasAccess) return;
    setRoutes([]);
    setTrips([]);
    setPendingRoutes([]);
    setPendingTrips([]);
    setError(null);
    const fail = (reason: Error) => setError(reason.message);
    const unsubscribes = [
      watchCommunityItems<CommunityRoute>("communityRoutes", setRoutes, fail),
      watchCommunityItems<CommunityTrip>("communityTrips", setTrips, fail),
      watchMyPendingItems<CommunityRoute>("communityRoutes", setPendingRoutes, fail),
      watchMyPendingItems<CommunityTrip>("communityTrips", setPendingTrips, fail),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [user?.uid, hasAccess]);

  useEffect(() => {
    if (!hasAccess) return;
    getStops().then(setAvailableStops).catch((reason: Error) => setError(reason.message));
  }, [hasAccess]);

  useEffect(() => {
    if (!selected) { setMyRating(null); return; }
    setMyRating(null);
    getMyCommunityRating(selected.kind, selected.item.id)
      .then(setMyRating).catch(() => setMyRating(null));
  }, [selected]);

  function openDraft(kind: DraftKind) {
    setDraft(emptyDraft);
    setSelectedStops([]);
    setDraftKind(kind);
  }

  function toggleStop(id: string) {
    if (!selectedStops.includes(id) && selectedStops.length >= 20) return;
    setSelectedStops((current) => current.includes(id)
      ? current.filter((stopId) => stopId !== id)
      : [...current, id]);
  }

  async function saveDraft() {
    if (!draftKind || saving) return;
    setSaving(true);
    try {
      if (draftKind === "route") {
        await createCommunityRoute({ title: draft.title, description: draft.description,
          city: draft.city, direction: draft.direction, stopIds: selectedStops });
      } else {
        await createCommunityTrip({ title: draft.title, description: draft.description,
          origin: draft.origin, destination: draft.destination, stops: draft.stops.split(","),
          distanceKm: Number(draft.distanceKm), durationMinutes: Number(draft.durationMinutes) });
      }
      setDraftKind(null);
      Alert.alert("Enviado", "Tu propuesta aparecerá cuando termine la validación.");
    } catch (reason) {
      Alert.alert("No se pudo crear", (reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function rate(value: number) {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await rateCommunityItem(selected.kind, selected.item.id, value);
      setMyRating(value);
    } catch (reason) {
      Alert.alert("No se pudo valorar", (reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const displayedItem = selected?.kind === "communityRoutes"
    ? routes.find((item) => item.id === selected.item.id) ?? selected.item
    : selected?.kind === "communityTrips"
      ? trips.find((item) => item.id === selected.item.id) ?? selected.item
      : null;
  const selectedRoute = selected?.kind === "communityRoutes" ? displayedItem as CommunityRoute : null;
  const selectedTrip = selected?.kind === "communityTrips" ? displayedItem as CommunityTrip : null;

  return (
    <View style={styles.screen}>
      <PrimaryHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Comunidad Premium</Text>
        <Text style={styles.intro}>Comparte recorridos y planes de viaje. Las rutas de esta sección son sugerencias de la comunidad.</Text>
        {subscriptionStatus === "loading" || (!hasAccess && checkout.loading)
          ? <ActivityIndicator /> : !hasAccess && purchasePending ? (
          <View style={styles.empty}>
            <Text style={styles.sectionTitle}>Compra confirmada</Text>
            <Text style={styles.body}>
              {checkout.syncing
                ? "Estamos validando tu acceso Premium con RevenueCat."
                : checkout.syncError ?? "La validación del servidor está pendiente."}
            </Text>
            {!checkout.syncing && (
              <Pressable style={styles.button} onPress={checkout.retrySync}>
                <Text style={styles.buttonText}>Reintentar validación</Text>
              </Pressable>
            )}
          </View>
        ) : !hasAccess ? (
          <View style={styles.empty}>
            <Text style={styles.body}>Activa Premium para explorar, crear y valorar.</Text>
            <Pressable style={styles.button} onPress={() => router.push("/Settings/Subscriptions/dashBoard")}>
              <Text style={styles.buttonText}>Ver Premium</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rutas de la comunidad</Text>
              <Pressable onPress={() => openDraft("route")}><Text style={styles.link}>+ Crear ruta</Text></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {routes.map((route) => <CommunityRouteCard key={route.id} route={route} onPress={() => setSelected({ kind: "communityRoutes", item: route })} />)}
              {!routes.length && <Text style={styles.body}>Aún no hay rutas publicadas.</Text>}
            </ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trips de la comunidad</Text>
              <Pressable onPress={() => openDraft("trip")}><Text style={styles.link}>+ Crear trip</Text></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {trips.map((trip) => <TripCard key={trip.id} destination={trip.destination} distanceKm={trip.distanceKm} duration={`${Math.round(trip.durationMinutes / 60 * 10) / 10} h`} stops={trip.stops.length ? String(trip.stops.length) : "No hay"} ratingAverage={trip.ratingAverage} ratingCount={trip.ratingCount} onPress={() => setSelected({ kind: "communityTrips", item: trip })} />)}
              {!trips.length && <Text style={styles.body}>Aún no hay trips publicados.</Text>}
            </ScrollView>
            {(pendingRoutes.length > 0 || pendingTrips.length > 0) && (
              <View style={styles.empty}>
                <Text style={styles.sectionTitle}>Tus propuestas pendientes</Text>
                {[...pendingRoutes, ...pendingTrips].map((item) => <Text key={item.id} style={styles.body}>• {item.title}</Text>)}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={draftKind !== null} animationType="slide" onRequestClose={() => setDraftKind(null)}>
        <SafeAreaView style={styles.modalScreen}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.heading}>{draftKind === "route" ? "Crear ruta" : "Crear trip"}</Text>
              <Pressable onPress={() => setDraftKind(null)}><Text style={styles.link}>Cerrar</Text></Pressable>
            </View>
            <Text style={styles.body}>Revisa los datos antes de publicarlos.</Text>
            <TextInput style={styles.input} placeholder="Título" value={draft.title} onChangeText={(title) => setDraft((old) => ({ ...old, title }))} maxLength={80} />
            <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción opcional" value={draft.description} onChangeText={(description) => setDraft((old) => ({ ...old, description }))} maxLength={500} multiline />
            {draftKind === "route" ? (
              <>
                <TextInput style={styles.input} placeholder="Ciudad" value={draft.city} onChangeText={(city) => setDraft((old) => ({ ...old, city }))} maxLength={80} />
                <Text style={styles.label}>Sentido</Text>
                <View style={styles.choiceRow}>
                  {(["outbound", "return"] as const).map((direction) => <Pressable key={direction} style={[styles.choice, draft.direction === direction && styles.selectedChoice]} onPress={() => setDraft((old) => ({ ...old, direction }))}><Text>{direction === "outbound" ? "Ida" : "Regreso"}</Text></Pressable>)}
                </View>
                <Text style={styles.label}>Paradas en orden ({selectedStops.length}/20)</Text>
                <Text style={styles.body}>Toca al menos dos paradas. El número indica el orden del recorrido.</Text>
                {availableStops.map((stop) => {
                  const index = selectedStops.indexOf(stop.id);
                  return <Pressable key={stop.id} style={[styles.stop, index >= 0 && styles.selectedChoice]} onPress={() => toggleStop(stop.id)}><Text style={styles.body}>{index >= 0 ? `${index + 1}. ` : ""}{stop.name} · {stop.city}</Text></Pressable>;
                })}
                {!availableStops.length && <Text style={styles.body}>No hay paradas disponibles.</Text>}
              </>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Origen general" value={draft.origin} onChangeText={(origin) => setDraft((old) => ({ ...old, origin }))} maxLength={80} />
                <TextInput style={styles.input} placeholder="Destino" value={draft.destination} onChangeText={(destination) => setDraft((old) => ({ ...old, destination }))} maxLength={80} />
                <TextInput style={styles.input} placeholder="Escalas, separadas por comas (opcional)" value={draft.stops} onChangeText={(stops) => setDraft((old) => ({ ...old, stops }))} />
                <TextInput style={styles.input} placeholder="Distancia estimada en km" value={draft.distanceKm} onChangeText={(distanceKm) => setDraft((old) => ({ ...old, distanceKm }))} keyboardType="decimal-pad" />
                <TextInput style={styles.input} placeholder="Duración estimada en minutos" value={draft.durationMinutes} onChangeText={(durationMinutes) => setDraft((old) => ({ ...old, durationMinutes }))} keyboardType="number-pad" />
              </>
            )}
            <Pressable style={[styles.button, saving && styles.disabled]} disabled={saving} onPress={() => void saveDraft()}><Text style={styles.buttonText}>{saving ? "Enviando..." : "Publicar propuesta"}</Text></Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={styles.detailCard}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{displayedItem?.title}</Text><Pressable onPress={() => setSelected(null)}><Text style={styles.link}>Cerrar</Text></Pressable></View>
            <Text style={styles.body}>{displayedItem?.description}</Text>
            {selectedRoute && <Text style={styles.body}>{selectedRoute.city} · {selectedRoute.stopIds.length} paradas · {selectedRoute.direction === "outbound" ? "Ida" : "Regreso"}</Text>}
            {selectedRoute && <Text style={styles.body}>{selectedRoute.stopIds.map((id) => availableStops.find((stop) => stop.id === id)?.name ?? id).join(" → ")}</Text>}
            {selectedTrip && <Text style={styles.body}>{selectedTrip.origin} → {selectedTrip.destination}{selectedTrip.stops.length ? ` · Escalas: ${selectedTrip.stops.join(", ")}` : ""}</Text>}
            <Text style={styles.label}>★ {displayedItem?.ratingCount ? displayedItem.ratingAverage.toFixed(1) : "Sin valoraciones"} ({displayedItem?.ratingCount ?? 0})</Text>
            {displayedItem?.authorId === user?.uid ? <Text style={styles.body}>No puedes valorar tu propia publicación.</Text> : <>
              <Text style={styles.body}>{myRating ? `Tu valoración: ${myRating}` : "Valora de 1 a 5"}</Text>
              <View style={styles.choiceRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} disabled={saving} onPress={() => void rate(value)}><Text style={[styles.star, myRating !== null && value <= myRating && styles.activeStar]}>★</Text></Pressable>)}</View>
            </>}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.surface.neutral },
  container: { padding: 20, paddingBottom: 50 },
  heading: { fontSize: 23, fontFamily: theme.fonts.heavy, color: theme.text.Body },
  intro: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.text.Body, marginTop: 8, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontFamily: theme.fonts.heavy, color: theme.text.Body, flexShrink: 1 },
  link: { fontSize: 14, fontFamily: theme.fonts.heavy, color: theme.surface.brand },
  row: { paddingBottom: 25, minHeight: 80 },
  body: { fontSize: 14, fontFamily: theme.fonts.regular, color: theme.text.Body, marginBottom: 9 },
  error: { color: "#B42318", marginBottom: 12 },
  empty: { backgroundColor: theme.surface.background, borderRadius: 18, padding: 18, marginBottom: 20 },
  button: { backgroundColor: theme.surface.brand, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 18 },
  buttonText: { color: "#FFFFFF", fontFamily: theme.fonts.heavy, fontSize: 15 },
  disabled: { opacity: 0.5 },
  modalScreen: { flex: 1, backgroundColor: theme.surface.neutral },
  modalContent: { padding: 20, paddingBottom: 40 },
  input: { backgroundColor: theme.surface.background, color: theme.text.Body, borderRadius: 12, padding: 14, marginTop: 12, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  label: { fontSize: 15, fontFamily: theme.fonts.heavy, color: theme.text.Body, marginTop: 18, marginBottom: 10 },
  choiceRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  choice: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.surface.background },
  selectedChoice: { backgroundColor: "#DCE6FF" },
  stop: { padding: 12, borderRadius: 10, backgroundColor: theme.surface.background, marginBottom: 7 },
  overlay: { flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 20 },
  detailCard: { backgroundColor: theme.surface.background, borderRadius: 22, padding: 22 },
  star: { fontSize: 32, color: "#BDC3CF" },
  activeStar: { color: "#E8A22A" },
}));
