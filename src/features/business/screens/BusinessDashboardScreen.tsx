import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import EditLogo from "@/src/features/business/components/editLogo";
import HeroCard from "@/src/features/dashboard/components/heroCard";
import MiniCard from "@/src/shared/ui/Cards/miniCard";
import PublicationCard from "@/src/features/business/components/publicationCard";
import { useBusinessInfo, useBusinessLogo } from "@/src/features/business/hooks/useBusinessProfile";
import { useBusinessPublications } from "@/src/features/business/hooks/useBusinessPublications";
import { router } from "expo-router";
import { Barcode, HeadsetHelp } from "iconoir-react-native";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function BusinessDashboard() {
  const { theme } = useUnistyles();
  const { data: BusinessProfile } = useBusinessInfo();
  //state for publications
  const { businessPublications } =
    useBusinessPublications({ onlyMine: true });

  const { data: logoUrl } = useBusinessLogo();
  return (
    <View style={styles.container}>
      <AlternativeHeader
        SettingName={BusinessProfile?.businessName ?? "Mi Negocio"}
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
        <HeroCard />

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
          />
        </View>
        {/* 3. Últimas Publicaciones (Apple Bento Feed) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Últimas Publicaciones</Text>
            <Text style={styles.sectionSubtitle}>
              Feed visible para los usuarios en ruta
            </Text>
          </View>
        </View>

        <View style={styles.publicationsList}>
          {businessPublications?.map((publication) => (
            <PublicationCard
              imageUrl={publication.imageUrl}
              Title={publication.name}
              Description={publication.description}
              PriceOrDiscount={
                publication.type === "discount"
                  ? `$${publication.currentPrice ?? 0}`
                  : `$${publication.price ?? 0}`
              }
              Date={
                publication.createdAt
                  ? publication.createdAt.toDate().toLocaleDateString("es-CO")
                  : "Fecha no disponible"
              }
              publicationType={publication.type}
              key={publication.id}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
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
    color: theme.text.Body,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
    color: theme.text.muted,
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
