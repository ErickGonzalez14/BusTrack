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
          Description="Tu negocio aparece como resultado patrocinado para usuarios cercanos que buscan lugares. Incluye nombre y ubicación."
          onPress={() =>
            router.push("/Settings/UserRequests/businessLightRequest")
          }
        />
        <PricingCard
          Name="BusTrack Business Pro"
          Price="$35.00/mes"
          Description="Aparece con tu logo en el mapa y en una ventana emergente cuando un usuario se acerca. Incluye tu panel para publicar productos y promociones."
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
