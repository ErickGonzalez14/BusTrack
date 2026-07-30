import { Pressable, Text } from "react-native";
import { StyleSheet, type UnistylesThemes } from "react-native-unistyles";
import "../../unistyles";

interface ButtonProps {
  title: string;
  onPress?: () => void;
}

export default function Test({ title, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

type AppTheme = UnistylesThemes[keyof UnistylesThemes];

const styles = StyleSheet.create((theme: AppTheme | undefined) => {
  const currentTheme = theme!;

  return {
    button: {
      backgroundColor: currentTheme.components.buttons.secondary,
      paddingVertical: 80,
      paddingHorizontal: 20,
      borderRadius: currentTheme.size_rounded.lg,

      justifyContent: "center",
      alignItems: "center",
    },

    text: {
      color: currentTheme.text.Secondary,
      fontSize: 16,
    },
  };
});
