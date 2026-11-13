import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
type Props = {
  planName: string;
  payDate: string;
};
export default function SubscriptionManagementCard({
  planName,
  payDate,
}: Props) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.text, { color: theme.text.contrast }]}>
          Plan Actual
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Activo</Text>
        </View>
      </View>
      <Text style={styles.planName}>Plan: {planName}</Text>
      <View style={styles.payDateContainer}>
        <Text style={styles.text}>Proxima Fecha de Pago</Text>
        <Text style={styles.planName}>{payDate}</Text>
        <Text style={styles.text}>Facturado Mensualmente - Automático</Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    padding: 15,
    gap: 10,
  },
  payDateContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.surface.neutral,
    paddingTop: 14,
    gap: 10,
  },
  text: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: theme.surface.brand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.size_rounded.full,
  },
  badgeText: {
    color: theme.text.Secondary,
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
  },
  planName: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    color: theme.text.Body,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));
