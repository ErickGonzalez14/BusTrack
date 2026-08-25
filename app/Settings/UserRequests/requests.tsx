import AlternativeHeader from "@/components/Headers/alternativeHeader";
import InfoCard from "@/components/ui/Cards/infoCard";
import { router } from "expo-router";
import { Bus, City } from "iconoir-react-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
export default function Request() {
  return (
    <View>
      <AlternativeHeader
        SettingName="Solicitudes"
        onTouch={() => router.back()}
      />
      <Text style={styles.text}>
        Selecciona el tipo de cuenta que deseas solicitar. Tu solicitud será
        revisada por el equipo de BusTrack.
      </Text>
      <View style={styles.cardContainer}>
        <InfoCard
          title="Conductor de Bus"
          description="Registra tu bus, placa y ruta. Activa GPS para que los pasajeros te sigan en tiempo real."
          icon={Bus}
          onPress={() => router.push("/Settings/UserRequests/driverRequest")}
        />
        <InfoCard
          title="Empresas"
          description="Publica promociones y productos con precio dentro de la plataforma BusTrack."
          icon={City}
          onPress={() => router.push("/Settings/UserRequests/businessRequest")}
        />
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    // estilos aquí
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  text: {
    fontSize: 16,
    color: theme.text.Body,
    marginLeft: 20,
    marginRight: 16,
    marginTop: 40,
    fontFamily: theme.fonts.regular,

    textAlign: "auto",
    lineHeight: 20,
  },
}));
