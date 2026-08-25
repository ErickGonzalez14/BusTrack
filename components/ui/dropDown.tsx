import { ArrowSeparateVertical, Check } from "iconoir-react-native";
import { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type DropDownProps = {
  label: string;
  options?: string[];
  onSelect?: (option: string) => void;
};

const MENU_HORIZONTAL_MARGIN = 16;

export default function DropDown({
  label,
  options = ["Internacional", "Bus de Ruta", "Coaster"],
  onSelect,
}: DropDownProps) {
  const { theme } = useUnistyles();
  const triggerRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(label);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: MENU_HORIZONTAL_MARGIN,
    width: 0,
  });

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get("window").width;
      const menuWidth = Math.min(
        width,
        windowWidth - MENU_HORIZONTAL_MARGIN * 2,
      );

      setMenuPosition({
        top: y + height + 25,
        left: Math.min(
          Math.max(MENU_HORIZONTAL_MARGIN, x),
          windowWidth - menuWidth - MENU_HORIZONTAL_MARGIN,
        ),
        width: menuWidth,
      });
      setIsOpen(true);
    });
  };

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect?.(option);
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${label}`}
          accessibilityState={{ expanded: isOpen }}
          onPress={openMenu}
          style={({ pressed }) => [
            styles.container,
            pressed && styles.containerPressed,
          ]}
        >
          <Text style={styles.text}>{selectedOption}</Text>
          <ArrowSeparateVertical
            width={24}
            height={24}
            color={theme.surface.brand}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
        transparent
        visible={isOpen}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View
            accessibilityRole="menu"
            style={[
              styles.menu,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              },
            ]}
          >
            {options.map((option, index) => (
              <Pressable
                accessibilityRole="menuitem"
                key={option}
                onPress={() => selectOption(option)}
                style={({ pressed }) => [
                  styles.option,
                  index < options.length - 1 && styles.optionSeparator,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
                {selectedOption === option && (
                  <Check
                    width={22}
                    height={22}
                    color={theme.surface.brand}
                    strokeWidth={2.5}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface.inputs,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: theme.size_rounded.md,
    marginBottom: 20,
    boxShadow: "4px 4px 5px 1px rgba(80, 95, 111, 0.14)",
  },
  containerPressed: {
    opacity: 0.8,
  },
  text: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: theme.surface.inputs,
    borderRadius: theme.size_rounded.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.text.placeHolderLight,
    shadowColor: "#00000089",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 80,
    elevation: 12,
  },
  option: {
    minHeight: 59,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  optionSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.text.placeHolderLight,
  },
  optionPressed: {
    backgroundColor: theme.surface.neutral,
  },
  optionText: {
    color: theme.text.Body,
    fontFamily: "Roboto_700Bold",
    fontSize: 18,
  },
}));
