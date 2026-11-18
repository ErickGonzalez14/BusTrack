import { getStops } from "@/src/features/transit-map/data/transportCatalog";
import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  getMyCommunityRating, rateCommunityItem, watchCommunityItems, watchMyPendingItems,
  type CommunityKind, type CommunityRoute, type CommunityTrip,
} from "../data/community.service";
import { useCommunityDraft } from "../hooks/useCommunityDraft";
import { CommunityDetailsModal } from "./CommunityDetailsModal";
import { CommunityDraftModal } from "./CommunityDraftModal";
import CommunityRouteCard from "./communityRouteCard";
import TripCard from "./tripCard";

type CommunityFeedProps = {
  enabled: boolean;
  visible: boolean;
  userId?: string;
  children: ReactNode;
};

export function CommunityFeed({ enabled, visible, userId, children }: CommunityFeedProps) {
  const [routes, setRoutes] = useState<CommunityRoute[]>([]);
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [pendingRoutes, setPendingRoutes] = useState<CommunityRoute[]>([]);
  const [pendingTrips, setPendingTrips] = useState<CommunityTrip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableStops, setAvailableStops] = useState<Stop[]>([]);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<{
    kind: CommunityKind;
    item: CommunityRoute | CommunityTrip;
  } | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);

  const draft = useCommunityDraft(saving, setSaving);

  useEffect(() => {
    if (!userId || !enabled) return;
    setRoutes([]);
    setTrips([]);
    setPendingRoutes([]);
    setPendingTrips([]);
    setError(null);
    const fail = (reason: Error) => setError(reason.message);
    const unsubscribes = [
      watchCommunityItems<CommunityRoute>("communityRoutes", setRoutes, fail),
      watchCommunityItems<CommunityTrip>("communityTrips", setTrips, fail),
      watchMyPendingItems<CommunityRoute>(
        "communityRoutes",
        setPendingRoutes,
        fail,
      ),
      watchMyPendingItems<CommunityTrip>(
        "communityTrips",
        setPendingTrips,
        fail,
      ),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [userId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    getStops()
      .then(setAvailableStops)
      .catch((reason: Error) => setError(reason.message));
  }, [enabled]);

  useEffect(() => {
    if (!selected) {
      setMyRating(null);
      return;
    }
    setMyRating(null);
    getMyCommunityRating(selected.kind, selected.item.id)
      .then(setMyRating)
      .catch(() => setMyRating(null));
  }, [selected]);

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

  const displayedItem =
    selected?.kind === "communityRoutes"
      ? (routes.find((item) => item.id === selected.item.id) ?? selected.item)
      : selected?.kind === "communityTrips"
        ? (trips.find((item) => item.id === selected.item.id) ?? selected.item)
        : null;
  const selectedRoute =
    selected?.kind === "communityRoutes"
      ? (displayedItem as CommunityRoute)
      : null;
  const selectedTrip =
    selected?.kind === "communityTrips"
      ? (displayedItem as CommunityTrip)
      : null;

  return (
    <>
      {visible && (
        <>
        {error && <Text style={styles.error}>{error}</Text>}
        {children}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rutas de la comunidad</Text>
          <Pressable onPress={() => draft.openDraft("route")}>
            <Text style={styles.link}>+ Crear ruta</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {routes.map((route) => (
            <CommunityRouteCard
              key={route.id}
              route={route}
              onPress={() =>
                setSelected({ kind: "communityRoutes", item: route })
              }
            />
          ))}
          {!routes.length && (
            <Text style={styles.body}>Aún no hay rutas publicadas.</Text>
          )}
        </ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trips de la comunidad</Text>
          <Pressable onPress={() => draft.openDraft("trip")}>
            <Text style={styles.link}>+ Crear trip</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              destination={trip.destination}
              distanceKm={trip.distanceKm}
              duration={`${Math.round((trip.durationMinutes / 60) * 10) / 10} h`}
              ratingAverage={trip.ratingAverage}
              ratingCount={trip.ratingCount}
              onPress={() =>
                setSelected({ kind: "communityTrips", item: trip })
              }
            />
          ))}
          {!trips.length && (
            <Text style={styles.body}>Aún no hay trips publicados.</Text>
          )}
        </ScrollView>
        {(pendingRoutes.length > 0 || pendingTrips.length > 0) && (
          <View style={styles.empty}>
            <Text style={styles.sectionTitle}>
              Tus propuestas pendientes
            </Text>
            {[...pendingRoutes, ...pendingTrips].map((item) => (
              <Text key={item.id} style={styles.body}>
                • {item.title}
              </Text>
            ))}
          </View>
        )}
        </>
      )}
      <CommunityDraftModal form={draft} availableStops={availableStops} saving={saving} />
      <CommunityDetailsModal
        visible={selected !== null}
        displayedItem={displayedItem}
        selectedRoute={selectedRoute}
        selectedTrip={selectedTrip}
        availableStops={availableStops}
        userId={userId}
        myRating={myRating}
        saving={saving}
        onClose={() => setSelected(null)}
        onRate={rate}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    flexShrink: 1,
  },
  link: {
    fontSize: 14,
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
  },
  row: { paddingBottom: 25, minHeight: 80 },
  body: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    marginBottom: 9,
  },
  error: { color: "#B42318", marginBottom: 12 },
  empty: {
    backgroundColor: theme.surface.background,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
}));
