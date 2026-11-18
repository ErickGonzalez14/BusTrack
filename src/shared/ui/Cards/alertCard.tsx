import { Check, Xmark } from "iconoir-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type AlertCardVariant = "success" | "error";

type AlertCardProps = {
  visible: boolean;
  variant: AlertCardVariant;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

const variantColors = {
  success: {
    background: "#a4ccf8",
    foreground: "#1B2CC1",
  },
  error: {
    background: "#FFD4D4",
    foreground: "#B42318",
  },
} as const;

export default function AlertCard({
  visible,
  variant,
  title,
  message,
  buttonText = "Listo",
  onClose,
}: AlertCardProps) {
  const colors = variantColors[variant];
  const Icon = variant === "success" ? Check : Xmark;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={styles.card}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Icon
              color={colors.foreground}
              height={48}
              strokeWidth={3.5}
              width={48}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },
  card: {
    minHeight: 360,
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 24,
    alignItems: "center",
    backgroundColor: theme.surface.background,
    borderTopLeftRadius: theme.size_rounded.xl,
    borderTopRightRadius: theme.size_rounded.xl,
  },
  iconContainer: {
    width: 92,
    height: 92,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.size_rounded.full,
    transform: [{ rotate: "8deg" }],
  },
  title: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 25,
    textAlign: "center",
  },
  message: {
    maxWidth: 300,
    marginTop: 8,
    color: theme.text.placeholder,
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    minHeight: 48,
    marginTop: "auto",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface.secondary,
    borderRadius: theme.size_rounded.sm,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: theme.text.Secondary,
    fontFamily: "Roboto_700Bold",
    fontSize: 16,
  },
}));
