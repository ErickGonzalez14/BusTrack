import { router } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ButtonPrimary from "./ui/buttons/buttonPrimary";
import IconTextButton from "./ui/buttons/iconTextButton";
import InputText from "./ui/inputText";

export default function LogInForm() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a BusTrack</Text>
      <Text style={styles.text}>Email</Text>
      <InputText placeholder="Email" />
      <Text style={styles.text}>Contraseña</Text>
      <InputText placeholder="Contraseña" />
      <View style={styles.buttonContainer}>
        <ButtonPrimary text="Iniciar Sesión" />
        <IconTextButton text="Iniciar Sesión con Google" />
      </View>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>Aun no Tienes una Cuenta?</Text>
        <Text style={styles.Register} onPress={() => router.push("/register")}>
          Registrarse
        </Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.xl,
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
    marginBottom: 20,
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
  Register: {
    fontFamily: "Roboto_700Bold",
    color: theme.text.contrast,
    fontSize: 16,
  },
}));
