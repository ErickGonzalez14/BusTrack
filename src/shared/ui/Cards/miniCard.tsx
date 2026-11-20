import { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type MiniCardProps = {
  title: string;
  subtitle: string;
  iconColor: string;
  icon: ComponentType<any>;
  onPress?: () => void;
  iconContainerColor?: string;
  pillText: string;
  disabled?: boolean;
};

export default function MiniCard({
  title,
  subtitle,
  pillText,
  icon: Icon,
  onPress,
  iconColor = "#000",
  iconContainerColor = "#000",
  disabled = false,
}: MiniCardProps) {
  return (
    <Pressable
      style={[styles.squareBentoCard, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.squareTopRow}>
        <View
          style={[styles.circleBadge, { backgroundColor: iconContainerColor }]}
        >
          <Icon width={22} height={22} color={iconColor} strokeWidth={2} />
        </View>
        <View style={styles.miniPill}>
          <Text style={styles.miniPillText}>{pillText}</Text>
        </View>
      </View>
      <View style={styles.squareContent}>
        <Text style={styles.squareTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.squareSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  squareBentoCard: {
    flex: 1,
    backgroundColor: theme.surface.background,
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    minHeight: 130,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },

  circleBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPill: {
    backgroundColor: theme.surface.neutral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  miniPillText: {
    fontSize: 10,
    fontFamily: "Roboto_700Bold",
    color: theme.text.muted,
  },
  squareTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  squareTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    flexShrink: 1,
  },
  squareSubtitle: {
    fontSize: 11,
    fontFamily: "Roboto_400Regular",
    color: theme.text.muted,
  },
  squareContent: {
    marginTop: 14,
    gap: 2,
  },
  disabledCard: {
    opacity: 0.45,
  },
}));
