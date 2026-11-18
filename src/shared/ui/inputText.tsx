import { StyleProp, TextInput, TextStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type keyBoardType =
  | "default"
  | "number-pad"
  | "decimal-pad"
  | "numeric"
  | "email-address"
  | "phone-pad"
  | "visible-password";
type InputTextProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  passwordText?: boolean;
  keyboardType?: keyBoardType;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};
export default function InputText({
  placeholder = "Aqui va el placeHolder",
  value,
  onChangeText,
  passwordText = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  style,
  accessibilityLabel,
}: InputTextProps) {
  const { theme } = useUnistyles();

  return (
    <TextInput
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      value={value}
      placeholderTextColor={theme.text.placeHolderLight}
      onChangeText={onChangeText}
      style={[styles.input, style]}
      secureTextEntry={passwordText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
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
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    flexShrink: 1,
  },
}));
