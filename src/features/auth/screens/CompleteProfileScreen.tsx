import AlertCard, {
  type AlertCardVariant,
} from "@/src/shared/ui/Cards/alertCard";
import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import InputText from "@/src/shared/ui/inputText";
import { useAuth } from "@/src/features/auth/context/authContext";
import { useCompleteProfile } from "@/src/features/auth/hooks/useCompleteProfile";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ImageBackground, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function CompleteProfile() {
  const { user, beginAuthFlow, finishAuthFlow } = useAuth();
  const { mutate, isPending } = useCompleteProfile();
  const [fullName, setFullName] = useState(user?.displayName ?? "");
  const [nickname, setNickname] = useState(
    user?.email?.split("@")[0] ?? "",
  );
  const [alert, setAlert] = useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  const handleCompleteProfile = () => {
    beginAuthFlow();
    mutate(
      { fullName, nickname },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "¡Perfil completado!",
            message: "Tu cuenta de Google ya está lista para usar BusTrack.",
          });
        },
        onError: (profileError) => {
          finishAuthFlow();
          console.error("No se pudo completar el perfil:", profileError);
          setAlert({
            variant: "error",
            title: "No pudimos guardar tu perfil",
            message:
              profileError instanceof Error
                ? profileError.message
                : "Ocurrió un error al guardar tus datos.",
          });
        },
      },
    );
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
    <ImageBackground
      resizeMode="cover"
      source={require("@/assets/images/BackGround.jpg")}
      style={styles.background}
    >
      <Image
        source={require("@/assets/images/2xlogo.png")}
        style={styles.logo}
      />

      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        style={styles.card}
      >
        <Text style={styles.title}>Completa tu perfil</Text>
        <Text style={styles.description}>
          Confirma estos datos para terminar de crear tu cuenta con Google.
        </Text>

        <Text style={styles.label}>Nombre Completo</Text>
        <InputText
          onChangeText={setFullName}
          placeholder="Nombre Completo"
          value={fullName}
        />

        <Text style={styles.label}>Nombre de Usuario</Text>
        <InputText
          onChangeText={setNickname}
          placeholder="Nombre de Usuario"
          value={nickname}
        />

        <ButtonPrimary
          onPress={isPending ? undefined : handleCompleteProfile}
          text={isPending ? "Guardando..." : "Continuar"}
        />
      </KeyboardAwareScrollView>

      <AlertCard
        buttonText={
          alert?.variant === "success" ? "Ir al inicio" : "Intentar de nuevo"
        }
        message={alert?.message ?? ""}
        onClose={closeAlert}
        title={alert?.title ?? ""}
        variant={alert?.variant ?? "success"}
        visible={alert !== null}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  background: {
    flex: 1,
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: "center",
    marginTop: 80,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: theme.surface.background,
    borderTopLeftRadius: theme.size_rounded.xl,
    borderTopRightRadius: theme.size_rounded.xl,
  },
  content: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 30,
  },
  title: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 24,
    textAlign: "center",
  },
  description: {
    color: theme.text.placeholder,
    fontFamily: "Roboto_400Regular",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    marginBottom: 10,
  },
}));
