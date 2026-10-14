import { Flash, NavArrowRight, Spark } from "iconoir-react-native";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
export default function HeroCard() {
  return (
    <Pressable style={styles.heroBentoCard}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroTitleGroup}>
          <View style={styles.heroCategoryPill}>
            <Spark width={12} height={12} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.heroCategoryText}>Promoción Destacada</Text>
          </View>
          <Text style={styles.heroCardTitle}>Crear Descuento</Text>
        </View>
        <View style={styles.heroIconCircle}>
          <Flash width={22} height={22} color="#ffffff" strokeWidth={2} />
        </View>
      </View>
      <Text style={styles.heroDescription}>
        Lanza ofertas 2x1 y rebajas instantáneas para los usuarios en paradas y
        unidades de bus cercanas.
      </Text>

      <View style={styles.heroFooter}>
        <View style={styles.tagCapsule}>
          <Text style={styles.tagCapsuleText}>Tráfico en Paradas</Text>
        </View>
        <View style={styles.appleActionPill}>
          <Text style={styles.appleActionText}>Crear Oferta</Text>
          <NavArrowRight
            width={16}
            height={16}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        </View>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  heroBentoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitleGroup: {
    gap: 4,
    flex: 1,
  },
  heroCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  heroCategoryText: {
    fontSize: 11,
    fontFamily: "Roboto_700Bold",
    color: "#ffffff",
  },
  heroCardTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: "#1C1C1E",
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  heroDescription: {
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
    color: "#64748B",
    lineHeight: 18,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  tagCapsule: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagCapsuleText: {
    fontSize: 11,
    fontFamily: "Roboto_700Bold",
    color: "#475569",
  },
  appleActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1C1C1E",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  appleActionText: {
    fontSize: 12,
    fontFamily: "Roboto_700Bold",
    color: "#FFFFFF",
  },
}));
