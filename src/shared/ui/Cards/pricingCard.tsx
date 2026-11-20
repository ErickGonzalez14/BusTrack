import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type PricingCardProps = {
  Name: string;
  Price: string;
  Description: string;
  onPress?: () => void;
};

export default function PrincingCard({
  Name,
  Price,
  Description,
  onPress,
}: PricingCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/*Name and description*/}
      <View>
        <Text style={styles.titles}>{Name}</Text>
        <Text style={styles.description}>{Description}</Text>
      </View>
      {/*Price*/}
      <View>
        <Text style={styles.titles}>{Price}</Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: 24,
    padding: 16,
    minHeight: 130,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  titles: {
    fontSize: 16,
    font: theme.fonts.heavy,
    color: theme.text.Body,
  },
  description: {
    fontSize: 14,
    font: theme.fonts.regular,
    color: theme.text.muted,
  },
}));
