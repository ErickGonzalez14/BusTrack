import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ButtonPrimaryProps = {
  text: string;
  onPress?: () => void;
};
export default function ButtonPrimary({ text, onPress }: ButtonPrimaryProps) {
  return (
    <Pressable onPress={onPress} style={styles.Button}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}
export const styles = StyleSheet.create((theme) => ({
  Button: {
    backgroundColor: theme.surface.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.size_rounded.sm,
  },
  text: {
    fontFamily: "Roboto_700Bold",
    fontSize: 16,
    color: theme.text.Secondary,
    alignSelf: "center",
  },
}));
