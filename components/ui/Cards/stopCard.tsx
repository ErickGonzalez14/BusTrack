import { BusStop, Walking } from "iconoir-react-native";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type StopCardProps = {
  stopName: string;
  region: string;
  distance: string;
};

export default function StopCard({
  stopName,
  region,
  distance,
}: StopCardProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <BusStop width={24} height={24} color={theme.surface.brand} />
      <View>
        <Text style={styles.mainText}>{stopName}</Text>
        <Text style={styles.secondaryText}>{region}</Text>
      </View>
      <View>
        <Walking width={24} height={24} color={theme.icons.alternativeBrand} />
        <Text style={styles.secondaryText}>{distance}</Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.size_rounded.md,
    borderWidth: 1,
    borderColor: theme.surface.brand,
  },
  mainText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.contrast,
  },
  secondaryText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.text.placeholder,
  },
}));
