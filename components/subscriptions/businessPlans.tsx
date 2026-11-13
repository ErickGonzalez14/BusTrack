import { useActiveBusiness } from "@/hooks/useRequests";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import ImprovePlanCard from "./improvePlanCard";
import SubscriptionManagementCard from "./subscriptionManagementCard";
import SubscriptionPlanCard from "./subscriptionPlanCard";
const businessRoutes = {
  light: "/Settings/UserRequests/businessLightRequest",
  pro: "/Settings/UserRequests/businessProRequest",
} as const;
const BUSINESS_PRO_PLAN = "BusTrack Business Pro";
const BUSINESS_LIGHT_PLAN = "BusTrack Business Light";

export default function BusinessPlans() {
  const { theme } = useUnistyles();
  const { isBusinessApproved, businessPlan } = useActiveBusiness();

  const isProPlan = isBusinessApproved && businessPlan === BUSINESS_PRO_PLAN;
  const isLightPlan =
    isBusinessApproved && businessPlan === BUSINESS_LIGHT_PLAN;

  function selectPlan(plan: keyof typeof businessRoutes) {
    if (isBusinessApproved) {
      Alert.alert(
        "Ya tienes un plan de negocio",
        "Puedes ver tu plan en Mi Negocio, dentro de Ajustes.",
      );
      return;
    }

    router.push(businessRoutes[plan]);
  }

  return (
    <View style={styles.plans}>
      {isLightPlan && (
        <View style={{ gap: 18 }}>
          <SubscriptionManagementCard
            planName="Plan Business Light Activo"
            payDate="2023-10-01"
          />
          <ImprovePlanCard />
        </View>
      )}
      {!isLightPlan && !isProPlan && (
        <View>
          <SubscriptionPlanCard
            label="PARA EMPEZAR"
            name="BusTrackBusinessLight"
            description="Lo esencial para dar a conocer tu negocio."
            benefits={[
              "Perfil de tu negocio en BusTrack",
              "Publicación de productos y servicios",
              "Gestión de promociones",
            ]}
            price="$10.99/mes"
            action="Elegir Light"
            outlinedAction
            onSelect={() => selectPlan("light")}
          />
          <SubscriptionPlanCard
            label="PARA CRECER"
            name="BusTrackBusinessPro"
            description="Más herramientas para llegar más lejos."
            benefits={[
              "Todo lo incluido en BusinessLight",
              "Mayor visibilidad para tu negocio",
              "Estadísticas de tus publicaciones",
              "Atención prioritaria",
            ]}
            price="$35.99/mes"
            action="Elegir Pro"
            highlighted
            onSelect={() => selectPlan("pro")}
          />
        </View>
      )}

      {isProPlan && (
        <SubscriptionManagementCard
          planName="Plan Business Pro Activo"
          payDate="2023-10-01"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plans: { gap: 18, marginBottom: 24 },
});
