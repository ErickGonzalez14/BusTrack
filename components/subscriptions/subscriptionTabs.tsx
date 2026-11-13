import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import SubscriptionButton from "./subscriptionButton";

export type SubscriptionAudience = "users" | "business";

const tabs = [
  { id: "users", label: "Usuarios" },
  { id: "business", label: "Negocios" },
] as const;

type Props = {
  selected: SubscriptionAudience;
  onChange: (audience: SubscriptionAudience) => void;
};

export default function SubscriptionTabs({ selected, onChange }: Props) {
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {tabs.map(({ id, label }) => (
        <View key={id} style={styles.tab}>
          <SubscriptionButton
            label={label}
            filled={selected === id}
            selected={selected === id}
            onPress={() => onChange(id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginBottom: 52 },
  tab: { flex: 1 },
});
