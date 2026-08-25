import AlternativeHeader from "@/components/Headers/alternativeHeader";
import PrimaryButton from "@/components/ui/buttons/buttonPrimary";
import ChipButton from "@/components/ui/buttons/chipButton";
import InputText from "@/components/ui/inputText";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function BusinessRequest() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategorySelection = (category: string, selected: boolean) => {
    setSelectedCategories((currentCategories) =>
      selected
        ? [...currentCategories, category]
        : currentCategories.filter(
            (currentCategory) => currentCategory !== category,
          ),
    );
  };

  return (
    <View style={styles.mainContainer}>
      <AlternativeHeader
        SettingName="Registro de Empresas"
        onTouch={() => router.back()}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.text}>
          Como empresa podrás publicar promociones de tus productos con precio
          dentro de la plataforma BusTrack.
        </Text>
      </View>
      {/* formulario */}
      <View style={styles.formContainer}>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Nombre de la Empresa</Text>
          <InputText placeholder="Ejemplo: BusTrack" />
        </View>
        <View style={{ gap: 10 }}>
          <View style={{ gap: 0 }}>
            <Text style={[styles.label, { lineHeight: 25 }]}>
              Categorías de los productos de la Empresa
            </Text>
            <Text style={styles.indications}>
              Escoge que tipo de productos vendes en tu empresa para poder
              clasificarla
            </Text>
          </View>

          <View style={styles.chipContainer}>
            <ChipButton
              name="Alimentos"
              selected={selectedCategories.includes("Alimentos")}
              onSelectionChange={handleCategorySelection}
            />
            <ChipButton
              name="Ropa"
              selected={selectedCategories.includes("Ropa")}
              onSelectionChange={handleCategorySelection}
            />
            <ChipButton
              name="Tecnología"
              selected={selectedCategories.includes("Tecnología")}
              onSelectionChange={handleCategorySelection}
            />
          </View>
        </View>
        <View style={{ gap: 10, marginTop: 20 }}>
          <Text style={styles.label}>Ubicación del Establecimiento</Text>
          <InputText placeholder="Ejemplo: Av. Principal 123" />
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton text="Enviar Solicitud" />
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  mainContainer: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: "#1b2cc11e",
    borderWidth: 2,
    borderColor: "#1b2cc11e",
    borderRadius: theme.size_rounded.md,
    padding: 20,
    marginHorizontal: 25,
    marginTop: 20,
    paddingHorizontal: 20,
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
    marginHorizontal: 25,
    marginTop: 20,
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  indications: {
    fontSize: 16,
    color: theme.text.placeholder,
    fontFamily: "Roboto_400Regular",
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 25,
  },
}));
