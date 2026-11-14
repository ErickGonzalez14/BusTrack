import { usePremiumCheckout } from "@/hooks/usePremiumCheckout";
import { usePremiumSubscription } from "@/hooks/usePremiumSubscription";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import SubscriptionButton from "./subscriptionButton";
import SubscriptionManagementCard from "./subscriptionManagementCard";
import SubscriptionPlanCard from "./subscriptionPlanCard";
export default function UserPlans() {
  const { status, subscription, hasAccess, accessEndsAt } =
    usePremiumSubscription();
  const checkout = usePremiumCheckout(!hasAccess);
  const premium = checkout.premium;
  const expiration = premium?.expirationDate
    ? Date.parse(premium.expirationDate)
    : undefined;
  const sdkConfirmed = Boolean(
    premium && (expiration === undefined || expiration > Date.now()),
  );

  if (hasAccess || sdkConfirmed) {
    const inGracePeriod = hasAccess
      ? subscription?.status === "grace_period"
      : Boolean(premium?.billingIssueDetectedAt);
    const willRenew = hasAccess ? subscription?.willRenew : premium?.willRenew;
    const date = hasAccess ? accessEndsAt : expiration;

    return (
      <View style={styles.section}>
        <SubscriptionManagementCard
          planName="BusTrack Premium"
          payDate={date ? new Date(date).toLocaleDateString() : "Desconocida"}
        />
        {!hasAccess && (
          <Text style={styles.body} accessibilityLiveRegion="polite">
            Compra confirmada. La sincronización de tu suscripción está
            pendiente.
          </Text>
        )}
      </View>
    );
  }

  if (status !== "ready") {
    return (
      <Text
        style={[styles.section, styles.body]}
        accessibilityLiveRegion="polite"
      >
        {status === "loading"
          ? "Consultando tu suscripción…"
          : "No pudimos consultar tu suscripción. Vuelve a abrir Suscripciones para reintentar."}
      </Text>
    );
  }

  return <PremiumOffer expired={Boolean(subscription)} checkout={checkout} />;
}

function PremiumOffer({
  expired,
  checkout,
}: {
  expired: boolean;
  checkout: ReturnType<typeof usePremiumCheckout>;
}) {
  return (
    <View style={styles.section}>
      {expired && (
        <Text style={styles.body}>Tu suscripción Premium ha vencido.</Text>
      )}
      {checkout.isTestStore && (
        <Text style={styles.body}>
          Modo de prueba. La compra no genera un cobro.
        </Text>
      )}
      <SubscriptionPlanCard
        label="PARA TUS VIAJES"
        name="BusTrack Premium"
        description="Una mejor forma de moverte, todos los días."
        benefits={[
          "Acceso a rutas de la comunidad",
          "Planificación de viajes y paradas",
          "Favoritos y rutinas para tus trayectos",
          "Promociones exclusivas para usuarios",
        ]}
        price={
          checkout.monthly
            ? `${checkout.monthly.product.priceString}/mes`
            : "Precio no disponible"
        }
        action={checkout.busy ? "Procesando…" : "Elegir Premium"}
        onSelect={checkout.purchase}
        disabled={!checkout.monthly || checkout.busy}
      />
      {checkout.available ? (
        <View style={styles.summary}>
          {!checkout.monthly && (
            <Text style={styles.body} accessibilityLiveRegion="polite">
              {!checkout.configured
                ? "Las compras de Premium aún no están configuradas en esta compilación."
                : checkout.loading
                  ? "Consultando el precio…"
                  : "No se pudo cargar el plan mensual."}
            </Text>
          )}
          {checkout.configured && !checkout.monthly && !checkout.loading && (
            <SubscriptionButton
              label="Reintentar"
              filled={false}
              onPress={checkout.reload}
              disabled={checkout.busy}
            />
          )}
          {checkout.configured && !checkout.isTestStore && (
            <SubscriptionButton
              label="Restaurar compras"
              filled={false}
              onPress={checkout.restore}
              disabled={checkout.busy}
            />
          )}
        </View>
      ) : (
        <Text style={styles.body}>
          Puedes contratar Premium desde la app móvil.
        </Text>
      )}
      <View style={styles.summary}>
        <Text accessibilityRole="header" style={styles.title}>
          Todo para tu próximo destino
        </Text>
        <Text style={styles.body}>
          Tus rutas, tus paradas y tus lugares favoritos, en una sola
          experiencia.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: 26, marginBottom: 26 },
  summary: { gap: 6 },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
    color: theme.text.Body,
  },
  body: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    color: theme.text.Body,
  },
}));
