import { BusinessListing } from "@/src/features/business/data/businessDirectory";
import { Building } from "iconoir-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type BusinessLightCardProps = {
  business: BusinessListing;
  onPress: () => void;
};

/**
 * Card para empresas con plan Light que aparecen intercaladas
 * entre los resultados de búsqueda del MapSearchOverlay.
 */
export default function BusinessLightCard({
  business,
  onPress,
}: BusinessLightCardProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver negocio patrocinado ${business.businessName}`}
    >
      {/* Badge de patrocinado */}
      <View style={styles.sponsoredBadge}>
        <Text style={styles.sponsoredText}>PATROCINADO</Text>
      </View>

      <View style={styles.row}>
        {/* Logo o icono fallback */}
        <View style={styles.logoWrapper}>
          {business.logoUrl ? (
            <Image
              source={{ uri: business.logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.logoFallback}>
              <Building width={20} height={20} color={theme.surface.brand} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {business.businessName}
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {business.phoneNumber || "Sin teléfono"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {business.adressDescription || "Sin dirección"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface.neutral,
    backgroundColor: `${theme.surface.brand}08`,
    gap: 4,
  },
  sponsoredBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${theme.surface.brand}22`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  sponsoredText: {
    fontSize: 10,
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: "hidden",
  },
  logo: {
    width: 36,
    height: 36,
  },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${theme.surface.brand}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Body,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.text.placeholder,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
}));
