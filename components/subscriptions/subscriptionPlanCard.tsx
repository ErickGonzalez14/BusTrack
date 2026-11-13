import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import SubscriptionButton from "./subscriptionButton";

type Props = {
  label: string;
  name: string;
  description: string;
  benefits: string[];
  action: string;
  onSelect: () => void;
  outlinedAction?: boolean;
  highlighted?: boolean;
  price: string;
};

export default function SubscriptionPlanCard({
  label,
  name,
  description,
  benefits,
  action,
  onSelect,
  outlinedAction = false,
  highlighted = false,
  price,
}: Props) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted]}>
      <View style={styles.badge}>
        <Text accessible={false} style={styles.star}>
          ★
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.name}>
        {name}
      </Text>
      <Text style={styles.body}>{description}</Text>
      <Text style={styles.price}>{price}</Text>
      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Text accessible={false} style={styles.check}>
              ✓
            </Text>
            <Text style={[styles.body, styles.benefitText]}>{benefit}</Text>
          </View>
        ))}
      </View>
      <SubscriptionButton
        label={action}
        filled={!outlinedAction}
        onPress={onSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.surface.background,
    borderRadius: 12,
    borderColor: "transparent",
    borderWidth: 2,
    padding: 17,
    gap: 14,
  },
  highlighted: { borderColor: theme.surface.primary },
  badge: { flexDirection: "row", alignItems: "center", gap: 9 },
  star: { fontSize: 23, lineHeight: 24, color: theme.text.contrast },
  label: {
    flexShrink: 1,
    color: theme.text.contrast,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  name: {
    fontFamily: "Roboto_700Bold",
    fontSize: 20,
    color: theme.text.Body,
  },
  body: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    lineHeight: 20,
    color: theme.text.Body,
  },
  price: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.contrast,
  },
  benefits: {
    borderTopWidth: 1,
    borderTopColor: theme.surface.neutral,
    paddingTop: 14,
    gap: 10,
  },
  benefit: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  benefitText: { flex: 1 },
  check: { color: theme.text.contrast, fontSize: 18, lineHeight: 20 },
}));
