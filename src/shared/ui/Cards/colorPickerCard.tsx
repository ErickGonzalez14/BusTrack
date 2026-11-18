import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ColorPickerProp = {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: ColorOption) => void;
};
type ColorOption = {
  name: string;
  hex: string;
};

export default function ColorPickerCard({
  visible,
  onClose,
  onColorSelect,
}: ColorPickerProp) {
  const { theme } = useUnistyles();

  const colorOptions: ColorOption[] = [
    { name: "Sky Blue", hex: theme.colorPicker.skyBlue },
    { name: "Blue", hex: theme.colorPicker.blue },
    { name: "Purple", hex: theme.colorPicker.purple },
    { name: "Pink", hex: theme.colorPicker.pink },
    { name: "Magenta", hex: theme.colorPicker.magenta },
    { name: "Red", hex: theme.colorPicker.red },
    { name: "Orange", hex: theme.colorPicker.orange },
    { name: "Yellow", hex: theme.colorPicker.yellow },
    { name: "Green", hex: theme.colorPicker.green },
    { name: "Teal", hex: theme.colorPicker.teal },
    { name: "Aqua", hex: theme.colorPicker.aqua },
    { name: "Cyan", hex: theme.colorPicker.cyan },
  ];
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backDrop}>
        <View style={styles.card}>
          <Text style={styles.text}>Escoje un Color</Text>
          <View style={styles.colorsContainer}>
            {colorOptions.map((color) => (
              <Pressable
                key={color.name}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color.hex,
                  },
                ]}
                onPress={() => onColorSelect(color)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const styles = StyleSheet.create((theme) => ({
  backDrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: theme.size_rounded.full,
  },
  card: {
    minHeight: 320,
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 24,
    alignItems: "center",
    backgroundColor: theme.surface.background,
    borderTopLeftRadius: theme.size_rounded.xl,
    borderTopRightRadius: theme.size_rounded.xl,
  },
  text: {
    fontSize: 24,
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
  },
}));
