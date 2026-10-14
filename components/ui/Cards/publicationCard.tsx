import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type publicationType = "discount" | "product" | "service";
type PublicationProps = {
  imageUrl: string;
  publicationType: publicationType;
  Date: string;
  Title: string;
  Description: string;
  PriceOrDiscount: string;
  onPress?: () => void;
};

export default function PublicationCard({
  imageUrl,
  publicationType,
  Date,
  Title,
  Description,
  PriceOrDiscount,
  onPress,
}: PublicationProps) {
  const { theme } = useUnistyles();
  const getTypeStyle = (type: publicationType) => {
    switch (type) {
      case "discount":
        return {
          bg: "#7C3AED",
          text: "#FFFFFF",
          label: "Descuento",
        };
      case "product":
        return {
          bg: theme.surface.brand,
          text: "#ffffff",
          label: "Producto",
        };
      case "service":
        return {
          bg: theme.icons.alternative,
          text: "#ffffff",
          label: "Servicio",
        };
    }
  };
  const typeStyle = getTypeStyle(publicationType);
  return (
    <Pressable style={styles.publicationCard} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.pubThumbnail}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.pubMain}>
        <View style={styles.pubHeaderRow}>
          <View
            style={[styles.pubTypeBadge, { backgroundColor: typeStyle.bg }]}
          >
            <Text style={[styles.pubTypeText, { color: typeStyle.text }]}>
              {typeStyle.label}
            </Text>
          </View>
          <Text style={styles.pubDate}>{Date}</Text>
        </View>

        <Text style={styles.pubTitle} numberOfLines={1}>
          {Title}
        </Text>

        <Text style={styles.pubDescription} numberOfLines={1}>
          {Description}
        </Text>

        <View style={styles.pubFooter}>
          <View style={styles.pubValuePill}>
            <Text style={styles.pubValueText}>{PriceOrDiscount}</Text>
          </View>

          <View style={styles.pubStatsRow}>
            <View style={styles.activeDot} />
            <Text style={styles.pubActiveText}>Activo</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  publicationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 13,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  pubThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  pubMain: {
    flex: 1,
    gap: 2,
  },
  pubHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pubTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pubTypeText: {
    fontSize: 10,
    fontFamily: "Roboto_700Bold",
  },
  pubDate: {
    fontSize: 11,
    fontFamily: "Roboto_400Regular",
    color: "#8E8E93",
  },
  pubTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.heavy,
    color: "#1C1C1E",
    marginTop: 2,
  },
  pubDescription: {
    fontSize: 11,
    fontFamily: "Roboto_400Regular",
    color: "#64748B",
  },
  pubFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pubValuePill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pubValueText: {
    fontSize: 11,
    fontFamily: "Roboto_700Bold",
    color: "#1C1C1E",
  },
  pubStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pubStatsText: {
    fontSize: 11,
    fontFamily: "Roboto_400Regular",
    color: "#8E8E93",
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10B981",
    marginLeft: 3,
  },
  pubActiveText: {
    fontSize: 11,
    fontFamily: "Roboto_700Bold",
    color: "#10B981",
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8F9FD",
    alignItems: "center",
    justifyContent: "center",
  },
}));
