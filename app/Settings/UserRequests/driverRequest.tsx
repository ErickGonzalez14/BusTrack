import AlternativeHeader from "@/components/Headers/alternativeHeader";
import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import DropDown from "@/components/ui/dropDown";
import InputText from "@/components/ui/inputText";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function DriverRequest() {
  return (
    <View style={styles.container}>
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
        {/* Matricula del Bus */}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Matricula del Bus</Text>
          <InputText placeholder="Ejemplo: 123456" />
        </View>
        {/*Ruta del Bus*/}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Ruta del Bus</Text>
          <InputText placeholder="Ej. Concepción-David" />
        </View>
        {/* Tipo de Bus */}
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Tipo de Bus</Text>
          <DropDown
            label="Coaster"
            options={["Internacional", "Bus de Ruta", "Coaster"]}
            onSelect={(option) => console.log(option)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <ButtonPrimary text="Enviar Solicitud" onPress={() => {}} />
        </View>
      </View>
    </View>
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
}));
