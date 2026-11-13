import { Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import SubscriptionPlanCard from "./subscriptionPlanCard";

export default function UserPlans() {
  return (
    <View style={styles.section}>
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
        price="$4.99/mes"
        action="Elegir Premium"
        onSelect={() =>
          Alert.alert(
            "BusTrack Premium",
            "La suscripción aún no está disponible.",
          )
        }
      />
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
