import { useAuth } from "@/src/features/auth/context/authContext";
import { CommunityFeed } from "@/src/features/community/components/CommunityFeed";
import PrimaryHeader from "@/src/features/dashboard/components/primaryHeader/primaryHeader";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import TrafficForecastChart from "../components/trafficForecastChart";
import { syncPremiumPurchase } from "../data/premiumSync.service";
import { usePremiumCheckout } from "../hooks/usePremiumCheckout";
import { usePremiumSubscription } from "../hooks/usePremiumSubscription";

export default function PremiumScreen() {
  const { user } = useAuth();
  const { status: subscriptionStatus, hasAccess } = usePremiumSubscription();
  const checkout = usePremiumCheckout(!hasAccess);
  const sdkExpiration = checkout.premium?.expirationDate
    ? Date.parse(checkout.premium.expirationDate)
    : undefined;
  const purchasePending = Boolean(
    checkout.premium &&
    (sdkExpiration === undefined || sdkExpiration > Date.now()),
  );

  useEffect(() => {
    if (user?.uid && hasAccess) {
      void syncPremiumPurchase(user.uid).catch(() => undefined);
    }
  }, [user?.uid, hasAccess]);

  return (
    <View style={styles.screen}>
      <PrimaryHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Comunidad Premium</Text>
        <Text style={styles.intro}>
          Comparte recorridos y planes de viaje. Las rutas de esta sección son
          sugerencias de la comunidad.
        </Text>
        {subscriptionStatus === "loading" ||
        (!hasAccess && checkout.loading) ? (
          <ActivityIndicator />
        ) : !hasAccess && purchasePending ? (
          <View style={styles.empty}>
            <Text style={styles.sectionTitle}>Compra confirmada</Text>
            <Text style={styles.body}>
              {checkout.syncing
                ? "Estamos validando tu acceso Premium con RevenueCat."
                : (checkout.syncError ??
                  "La validación del servidor está pendiente.")}
            </Text>
            {!checkout.syncing && (
              <Pressable style={styles.button} onPress={checkout.retrySync}>
                <Text style={styles.buttonText}>Reintentar validación</Text>
              </Pressable>
            )}
          </View>
        ) : !hasAccess ? (
          <View style={styles.empty}>
            <Text style={styles.body}>
              Activa Premium para explorar, crear y valorar.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push("/Settings/Subscriptions/dashBoard")}
            >
              <Text style={styles.buttonText}>Ver Premium</Text>
            </Pressable>
          </View>
        ) : null}
        <CommunityFeed
          enabled={hasAccess}
          visible={subscriptionStatus !== "loading" && hasAccess}
          userId={user?.uid}
        >
          <TrafficForecastChart key={user?.uid} />
        </CommunityFeed>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.surface.neutral },
  container: { padding: 20, paddingBottom: 50 },
  heading: {
    fontSize: 23,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  intro: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    flexShrink: 1,
  },
  body: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    marginBottom: 9,
  },
  empty: {
    backgroundColor: theme.surface.background,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.surface.brand,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 18,
  },
  buttonText: { color: "#FFFFFF", fontFamily: theme.fonts.heavy, fontSize: 15 },
}));
