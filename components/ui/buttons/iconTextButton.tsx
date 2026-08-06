import GoogleIcon from "@/assets/icons/googleIcon";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type IconTextButtonProps = {
  text: string;
  onPress?: () => void;
};

export default function IconTextButton({ text, onPress }: IconTextButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.Button}>
      <GoogleIcon />
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  Button: {
    backgroundColor: theme.surface.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.size_rounded.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    borderWidth: 1,
    borderColor: theme.text.placeholder,
  },
  text: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
    alignSelf: "center",
  },
}));
