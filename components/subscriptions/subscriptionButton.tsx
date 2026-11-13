import { useState } from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  label: string;
  onPress: () => void;
  filled: boolean;
  selected?: boolean;
};

export default function SubscriptionButton({
  label,
  onPress,
  filled,
  selected,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole={selected === undefined ? "button" : "tab"}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        filled && styles.filled,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, filled && styles.filledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: theme.surface.primary,
  },
  filled: { backgroundColor: theme.surface.primary },
  focused: { borderColor: theme.text.Body },
  pressed: { opacity: 0.8 },
  label: {
    fontFamily: "Roboto_700Bold",
    fontSize: 18,
    color: theme.text.Body,
    textAlign: "center",
  },
  filledLabel: { color: theme.text.Secondary },
}));
