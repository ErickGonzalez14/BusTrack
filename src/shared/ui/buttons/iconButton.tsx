import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
type IconButtonProps = {
  onPress?: () => void;
  icon: ComponentType<any>;
  width?: number;
  height?: number;
};

export default function IconButton({
  onPress,
  icon: Icon,
  width,
  height,
}: IconButtonProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Icon
        width={width}
        height={height}
        color={theme.text.Secondary}
        style={{ margin: 5 }}
      />
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: "#ffffff2b",
    borderRadius: theme.size_rounded.full,
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
}));
