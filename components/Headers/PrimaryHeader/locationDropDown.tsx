import { MapPin } from "iconoir-react-native";
import { Pressable, Text } from "react-native";

import { StyleSheet } from "react-native-unistyles";

type LocationName = {
  siteName: string;
  onPress: () => void;
};

export default function LocationDropDown({ siteName, onPress }: LocationName) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <MapPin width={20} height={20} color="#ffff" strokeWidth={2} />
      <Text style={styles.Text}>{siteName}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  Text: {
    color: theme.text.Secondary,
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
  },

  container: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
}));
