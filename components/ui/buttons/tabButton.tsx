import { Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

type TabButtonProps = {
  onPress?: () => void;
  title: string;
};

export default function TabButton({ onPress, title }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.primary,
    borderRadius: theme.size_rounded.sm,
  },
  text: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Secondary,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
}));
