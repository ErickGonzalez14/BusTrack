import { useAuth } from "@/src/features/auth/context/authContext";
import { useLogIn } from "@/src/features/auth/hooks/useLogIn";
import { useGoogleSignIn } from "@/src/features/auth/hooks/useGoogleSignIn";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import IconTextButton from "@/src/shared/ui/buttons/iconTextButton";
import AlertCard from "@/src/shared/ui/Cards/alertCard";
import InputText from "@/src/shared/ui/inputText";

export default function LogInForm() {
  const { mutate, isPending } = useLogIn();
  const { mutate: googleSignIn, isPending: isGooglePending } =
    useGoogleSignIn();
  const { beginAuthFlow, finishAuthFlow, refreshUserProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const HandleLogIn = () => {
    beginAuthFlow();
    mutate(
      { email, password },
      {
        onSuccess: async () => {
          await refreshUserProfile();
          setAlert({
            variant: "success",
            title: "¡Inicio de Sesión exitoso!",
            message: "Has iniciado sesión correctamente.",
          });
        },
        onError: (loginError) => {
          finishAuthFlow();
          console.error(
            "No se pudo completar el inicio de sesión:",
            loginError,
          );
          setAlert({
            variant: "error",
            title: "No pudimos iniciar sesión",
            message:
              loginError instanceof Error
                ? loginError.message
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
          title: "¡Inicio de Sesión exitoso!",
          message: "Has iniciado sesión correctamente con Google.",
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
        contentContainerStyle={styles.cotent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Text style={styles.title}>Bienvenido a BusTrack</Text>
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
            text={isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            onPress={HandleLogIn}
          />
          <IconTextButton
            onPress={isGooglePending ? undefined : handleGoogleSignIn}
            text={
              isGooglePending
                ? "Conectando con Google..."
                : "Iniciar Sesión con Google"
            }
          />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.question}>Aun no Tienes una Cuenta?</Text>
          <Text
            style={styles.Register}
            onPress={() => router.push("/register")}
          >
            Registrarse
          </Text>
        </View>
      </KeyboardAwareScrollView>
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
    </>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.xl,
    flex: 1,
  },
  cotent: {
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
