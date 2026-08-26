import { useAuth } from "@/contexts/authContext";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { useSignUp } from "@/hooks/useSignUp";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import AlertCard, { type AlertCardVariant } from "./ui/Cards/alertCard";
import ButtonPrimary from "./ui/buttons/buttonPrimary";
import IconTextButton from "./ui/buttons/iconTextButton";
import InputText from "./ui/inputText";

export default function RegisterForm() {
  const { mutate, isPending } = useSignUp();
  const { mutate: googleSignIn, isPending: isGooglePending } =
    useGoogleSignIn();
  const { beginAuthFlow, finishAuthFlow, refreshUserProfile } = useAuth();
  const [alert, setAlert] = useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");

  const HandleRegister = () => {
    beginAuthFlow();
    mutate(
      { email, password, nickname, fullName },
      {
        onSuccess: async () => {
          await refreshUserProfile();
          setAlert({
            variant: "success",
            title: "¡Registro exitoso!",
            message: "Tu cuenta ha sido creada correctamente.",
          });
        },
        onError: (registerError) => {
          finishAuthFlow();
          console.error("No se pudo completar el registro:", registerError);
          setAlert({
            variant: "error",
            title: "No pudimos registrarte",
            message:
              registerError instanceof Error
                ? registerError.message
                : "Ocurrió un error al guardar el perfil del usuario.",
          });
        },
      },
    );
  };

  const handleGoogleSignIn = () => {
    beginAuthFlow();
    googleSignIn(undefined, {
      onSuccess: async (result) => {
        if (result.status === "cancelled") {
          finishAuthFlow();
          return;
        }

        await refreshUserProfile();

        if (!result.hasProfile) {
          finishAuthFlow();
          return;
        }

        setAlert({
          variant: "success",
          title: "¡Inicio de sesión exitoso!",
          message: "Tu cuenta de Google ya estaba registrada en BusTrack.",
        });
      },
      onError: (googleError) => {
        finishAuthFlow();
        console.error("No se pudo autenticar con Google:", googleError);
        setAlert({
          variant: "error",
          title: "No pudimos conectarte con Google",
          message:
            googleError instanceof Error
              ? googleError.message
              : "Ocurrió un error durante la autenticación con Google.",
        });
      },
    });
  };

  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      finishAuthFlow();
      router.replace("/(tabs)/home");
    }
  };
  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Text style={styles.text}>Nombre Completo</Text>
        <InputText
          placeholder="Nombre Completo"
          value={fullName}
          onChangeText={setFullName}
        />
        <Text style={styles.text}>Nombre de Usuario</Text>
        <InputText
          placeholder="Nombre de Usuario"
          value={nickname}
          onChangeText={setNickname}
        />
        <Text style={styles.text}>Email</Text>
        <InputText placeholder="Email" value={email} onChangeText={setEmail} />
        <Text style={styles.text}>Contraseña</Text>
        <InputText
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.buttonContainer}>
          <ButtonPrimary
            text={isPending ? "Creando..." : "Registrarse"}
            onPress={HandleRegister}
          />
          <IconTextButton
            onPress={isGooglePending ? undefined : handleGoogleSignIn}
            text={
              isGooglePending
                ? "Conectando con Google..."
                : "Registrarse con Google"
            }
          />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.question}>Ya Tienes una Cuenta?</Text>
          <Text style={styles.logIn} onPress={() => router.push("/logIn")}>
            Iniciar Sesión
          </Text>
        </View>
      </KeyboardAwareScrollView>
      <View>
        <AlertCard
          buttonText={
            alert?.variant === "success" ? "Continuar" : "Intentar de nuevo"
          }
          message={alert?.message ?? ""}
          onClose={closeAlert}
          title={alert?.title ?? ""}
          variant={alert?.variant ?? "success"}
          visible={alert !== null}
        />
      </View>
    </>
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
    paddingTop: 30,
    paddingBottom: 25,
    justifyContent: "flex-end",
    flexGrow: 1,
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
