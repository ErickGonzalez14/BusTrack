import type { CommunityRoute } from "@/Services/community.service";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function CommunityRouteCard({
  route, onPress,
}: { route: CommunityRoute; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.tag}>RUTA COMUNITARIA</Text>
      <Text style={styles.title} numberOfLines={2}>{route.title}</Text>
      <Text style={styles.detail}>{route.city} · {route.direction === "outbound" ? "Ida" : "Regreso"}</Text>
      <Text style={styles.detail}>{route.stopIds.length} paradas</Text>
      <View style={styles.footer}>
        <Text style={styles.stars}>★ {route.ratingCount ? route.ratingAverage.toFixed(1) : "Nueva"}</Text>
        <Text style={styles.count}>{route.ratingCount} valoraciones</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: { width: 260, minHeight: 178, padding: 20, borderRadius: 22, backgroundColor: theme.surface.background, marginRight: 12 },
  tag: { fontSize: 11, fontFamily: theme.fonts.heavy, color: theme.surface.brand, marginBottom: 10 },
  title: { fontSize: 19, fontFamily: theme.fonts.heavy, color: theme.text.Body, marginBottom: 12 },
  detail: { fontSize: 13, fontFamily: theme.fonts.regular, color: theme.text.Body, marginBottom: 4 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 12 },
  stars: { fontSize: 14, fontFamily: theme.fonts.heavy, color: "#DA961A" },
  count: { fontSize: 12, fontFamily: theme.fonts.regular, color: theme.text.Body },
}));
