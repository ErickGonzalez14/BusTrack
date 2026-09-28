import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export default function ButtonSecundary({ title, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.buttonContainer} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  buttonContainer: {
    backgroundColor: theme.components.buttons.secondary,
    borderRadius: theme.size_rounded.full,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  buttonText: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
}));
