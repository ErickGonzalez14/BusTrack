import { Image, type ImageSource } from "expo-image";
import { TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
type SearchBarProps = {
  placeHolder: string;
  onSearch?: (text: string) => void;
  value?: string;
  icon: ImageSource;
};

export default function SearchBar({
  placeHolder,
  onSearch,
  value,
  icon,
}: SearchBarProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <TextInput
        placeholder={placeHolder}
        onChangeText={onSearch}
        value={value}
        placeholderTextColor={theme.text.placeholder}
        style={styles.input}
      />
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.inputs,
    borderRadius: theme.size_rounded.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: theme.text.placeholder,
  },
  icon: {
    width: 23,
    height: 23,
  },
  input: {
    backgroundColor: theme.surface.inputs,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
  },
}));
