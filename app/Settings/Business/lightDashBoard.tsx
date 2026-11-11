import AlternativeHeader from "@/components/Headers/alternativeHeader";
import EditLogo from "@/components/editLogo";
import BusinessInfoCard from "@/components/ui/Cards/businessInfoCard";
import HeroCard from "@/components/ui/Cards/heroCard";
import MiniCard from "@/components/ui/Cards/miniCard";
import { useBusinessInfo, useBusinessLogo } from "@/hooks/useRequests";
import { router } from "expo-router";
import { Barcode, HeadsetHelp } from "iconoir-react-native";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function LightDashboard() {
  const { theme } = useUnistyles();
  const { data: businessInfo } = useBusinessInfo();
  const { data: logoUrl } = useBusinessLogo();

  return (
    <View style={styles.container}>
      <AlternativeHeader
        SettingName={businessInfo?.businessName ?? "Mi Negocio"}
        onTouch={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Profile Bento Card (Apple ID / Merchant Spotlight) */}
        <View style={styles.logoContainer}>
          <EditLogo initialLogoUrl={logoUrl ?? undefined} />
        </View>

        {/* 2. Bento Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <Text style={styles.sectionSubtitle}>
            Crea promociones y productos en tiempo real
          </Text>
        </View>

        {/* Crear Descuento */}
        <HeroCard disabled={true} />

        {/* 2-Column Bento Grid: Producto y Servicio (Estilo Widgets de la imagen) */}
        <View style={styles.bentoRow}>
          {/* Bento Card: Publicar Producto */}
          <MiniCard
            title={"Publicar Productos"}
            subtitle="Artículos en vitrina"
            pillText="Catálogo"
            icon={Barcode}
            iconColor={theme.surface.background}
            iconContainerColor={theme.surface.brand}
            onPress={() => router.push("/Settings/Business/productForm")}
            disabled={true}
          />

          {/* Bento Card: Servicio Profesional */}
          <MiniCard
            title={"Publicar Servicio Profesional"}
            subtitle="Asistencia y soporte"
            pillText="Atención"
            icon={HeadsetHelp}
            iconColor={theme.surface.background}
            iconContainerColor={theme.icons.alternative}
            onPress={() => router.push("/Settings/Business/serviceForm")}
            disabled={true}
          />
        </View>
        {businessInfo && <BusinessInfoCard business={businessInfo} />}
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  sectionHeader: {
    marginTop: 4,
    gap: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: theme.fonts.heavy,
    color: "#1C1C1E",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
    color: "#8E8E93",
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
  },
  publicationsList: {
    gap: 12,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
}));
