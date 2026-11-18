import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import BusinessPlans from "@/src/features/billing/components/businessPlans";
import SubscriptionTabs, {
    type SubscriptionAudience,
} from "@/src/features/billing/components/subscriptionTabs";
import UserPlans from "@/src/features/billing/components/userPlans";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function SubscriptionsDashboard() {
  const [audience, setAudience] = useState<SubscriptionAudience>("users");
  const isBusiness = audience === "business";

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      <AlternativeHeader
        SettingName="Suscripciones"
        onTouch={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>
            {isBusiness ? "Haz crecer tu negocio" : "Más en cada viaje"}
          </Text>
          <Text style={styles.body}>
            {isBusiness
              ? "Elige el plan que acompaña a tu negocio."
              : "Descubre todo lo que BusTrack tiene para ti."}
          </Text>
        </View>
        <SubscriptionTabs selected={audience} onChange={setAudience} />
        {isBusiness ? <BusinessPlans /> : <UserPlans />}
        <Text style={styles.body}>
          Los precios y beneficios se confirmarán antes de contratar.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 32,
  },
  heading: {
    gap: 10,
    marginBottom: 52,
  },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 30,
    color: theme.text.Body,
  },
  body: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.text.Body,
    lineHeight: 20,
  },
}));
