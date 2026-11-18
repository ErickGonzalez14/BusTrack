import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import AlertCard, {
  type AlertCardVariant,
} from "@/src/shared/ui/Cards/alertCard";
import DropDown from "@/src/shared/ui/dropDown";
import InputText from "@/src/shared/ui/inputText";
import { useDriverApplication } from "@/src/features/tracking/hooks/useDriverApplication";
import { useRoutes } from "@/src/features/transit-map/hooks/useRoutes";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function DriverRequest() {
  const { mutate, isPending } = useDriverApplication();
  const { data: routes = [], isLoading: isLoadingRoutes } = useRoutes();
  const [licensePlate, setLicensePlate] = React.useState("");
  const [publicTransportPlate, setPublicTransportPlate] = React.useState("");
  const [routeType, setRouteType] = React.useState("");
  const [routeId, setRouteId] = React.useState("");
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  const RouteTypeOptions = [
    { id: "Distrital", label: "Distrital" },
    { id: "InterDistrital", label: "InterDistrital" },
  ];

  const handleSubmit = () => {
    mutate(
      {
        licensePlate,
        publicTransportPlate,
        routeType,
        routeId,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "¡Solicitud enviada!",
            message:
              "Tu solicitud de registro de bus ha sido enviada correctamente.",
          });
        },
        onError: (requestError) => {
          console.error("No se pudo completar el registro:", requestError);
          setAlert({
            variant: "error",
            title: "No pudimos registrarte",
            message:
              requestError instanceof Error
                ? requestError.message
                : "Ocurrió un error al guardar el perfil del usuario.",
          });
        },
      },
    );
  };
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/(tabs)/settings");
    }
  };
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      style={styles.container}
    >
      <AlternativeHeader
        SettingName="Registro de Bus"
        onTouch={() => router.back()}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.text}>
          Como conductor podrás registrar tu bus en la plataforma y activar el
          GPS para que los pasajeros puedan seguirte en tiempo real.
        </Text>
      </View>
      {/* formulario */}
      <View style={styles.formContainer}>
        {/* Matricula de circulacion */}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Placa de Circulación</Text>
          <InputText
            placeholder="Ejemplo: 123456"
            value={licensePlate}
            onChangeText={setLicensePlate}
          />
        </View>
        {/* Matricula de transporte Publico */}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Placa de Transporte Público</Text>
          <InputText
            placeholder="Ejemplo: 123456"
            value={publicTransportPlate}
            onChangeText={setPublicTransportPlate}
          />
        </View>
        {/*Ruta del Bus*/}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Ruta del Bus</Text>
          <DropDown
            label={
              isLoadingRoutes ? "Cargando rutas..." : "Selecciona una ruta"
            }
            options={routes.map((route) => ({
              id: route.id,
              label: route.name,
            }))}
            onSelect={(option) => setRouteId(option.id)}
          />
        </View>
        {/* Tipo de Ruta */}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Tipo de Ruta</Text>
          <DropDown
            label="Selecciona un tipo de ruta"
            options={RouteTypeOptions}
            onSelect={(option) => setRouteType(option.label)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <ButtonPrimary
            text={isPending ? "Enviando..." : "Enviar Solicitud"}
            onPress={handleSubmit}
          />
        </View>
      </View>
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
    </KeyboardAwareScrollView>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: "#1b2cc11e",
    borderWidth: 2,
    borderColor: "#1b2cc11e",
    borderRadius: theme.size_rounded.md,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: theme.text.contrast,
    fontFamily: "Roboto_400Regular",
  },
  label: {
    fontSize: 20,
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
  },
  formContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    flex: 1,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  content: {
    width: "100%",

    paddingBottom: 25,
    justifyContent: "flex-end",
    flexGrow: 1,
  },
}));
