import { TextInput } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type InputTextProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
};
export default function InputText({
  placeholder = "Aqui va el placeHolder",
  value,
  onChangeText,
}: InputTextProps) {
  const { theme } = useUnistyles();

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      placeholderTextColor={theme.text.placeHolderLight}
      onChangeText={onChangeText}
      style={styles.input}
    />
  );
}
/*Recordar Configurar para cambiar 
 los props del TextInput como por ejemplo secureTextEntry, keyboardType, etc.*/
const styles = StyleSheet.create((theme) => ({
  input: {
    backgroundColor: theme.surface.inputs,
    color: theme.text.Body,
    boxShadow: "4px 4px 5px 1px rgba(80, 95, 111, 0.14)",
    borderRadius: theme.size_rounded.md,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 0.5,
    borderColor: theme.text.placeHolderLight,
  },
}));
