import { useState } from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ChipButtonProps = {
  name: string;
  selected?: boolean;
  onSelectionChange?: (name: string, selected: boolean) => void;
};

export default function ChipButton({
  name,
  selected,
  onSelectionChange,
}: ChipButtonProps) {
  const [internalSelected, setInternalSelected] = useState(false);
  const isSelected = selected ?? internalSelected;

  const handlePress = () => {
    const nextSelected = !isSelected;

    if (selected === undefined) {
      setInternalSelected(nextSelected);
    }

    onSelectionChange?.(name, nextSelected);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selectedContainer,
        pressed && styles.pressedContainer,
      ]}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>{name}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.size_rounded.full,
    borderWidth: 1.5,
    borderColor: theme.surface.brand,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedContainer: {
    backgroundColor: theme.surface.brand,
  },
  pressedContainer: {
    opacity: 0.8,
  },
  text: {
    textAlign: "center",
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  selectedText: {
    color: theme.text.Secondary,
  },
}));
