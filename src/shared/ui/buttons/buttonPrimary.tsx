import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ButtonPrimaryProps = {
  text: string;
  onPress?: () => void;
  disabled?: boolean;
};
export default function ButtonPrimary({
  text,
  onPress,
  disabled,
}: ButtonPrimaryProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.Button, disabled && styles.disabledButton]}
    >
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
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    fontFamily: "Roboto_700Bold",
    fontSize: 16,
    color: theme.text.Secondary,
    alignSelf: "center",
  },
}));
