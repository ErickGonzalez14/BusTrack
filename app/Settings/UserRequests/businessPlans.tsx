import AlternativeHeader from "@/components/Headers/alternativeHeader";
import PricingCard from "@/components/ui/Cards/pricingCard";
import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
export default function BusinessPlans() {
  return (
    <View>
      <AlternativeHeader
        SettingName="Elige un Plan de Negocio"
        onTouch={() => router.back()}
      />
      <View style={styles.container}>
        <PricingCard
          Name="BusTrack Business Light"
          Price="$10.00/mes"
          Description="Haz que tu negocio aparezca en los resultados de búsqueda para que usuarios cercanos puedan descubrir tus productos y servicios."
          onPress={() =>
            router.push("/Settings/UserRequests/businessLightRequest")
          }
        />
        <PricingCard
          Name="BusTrack Business Pro"
          Price="$35.00/mes"
          Description="Publica anuncios emergentes geolocalizados que se muestran al iniciar el seguimiento de una ruta, alcanzando a usuarios cercanos a tu negocio."
          onPress={() =>
            router.push("/Settings/UserRequests/businessProRequest")
          }
        />
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
}));
