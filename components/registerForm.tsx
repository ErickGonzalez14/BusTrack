import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ButtonPrimary from "./ui/buttons/buttonPrimary";
import IconTextButton from "./ui/buttons/iconTextButton";
import InputText from "./ui/inputText";
export default function RegisterForm() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.text}>Nombre Completo</Text>
      <InputText placeholder="Nombre Completo" />
      <Text style={styles.text}>Nombre de Usuario</Text>
      <InputText placeholder="Nombre de Usuario" />
      <Text style={styles.text}>Email</Text>
      <InputText placeholder="Email" />
      <Text style={styles.text}>Contraseña</Text>
      <InputText placeholder="Contraseña" />
      <View style={styles.buttonContainer}>
        <ButtonPrimary text="Registrarse" />
        <IconTextButton text="Registrarse con Google" />
      </View>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>Ya Tienes una Cuenta?</Text>
        <Text style={styles.logIn}>Iniciar Sesión</Text>
      </View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.xl,
    flex: 1,
  },
  content: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    justifyContent: "flex-end",
  },
  title: {
    color: theme.text.Body,
    fontSize: 20,
    textAlign: "center",
    fontFamily: theme.fonts.heavy,
    marginBottom: 50,
  },
  text: {
    color: theme.text.Body,
    fontSize: 16,
    textAlign: "left",
    fontFamily: theme.fonts.heavy,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 10,
  },
  questionContainer: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 20,
  },
  question: {
    fontFamily: "Roboto_300Light",
    color: theme.text.Body,
    fontSize: 16,
  },
  logIn: {
    fontFamily: "Roboto_700Bold",
    color: theme.text.contrast,
    fontSize: 16,
  },
}));
