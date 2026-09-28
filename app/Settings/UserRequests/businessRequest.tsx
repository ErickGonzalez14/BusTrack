import AlternativeHeader from "@/components/Headers/alternativeHeader";
import PrimaryButton from "@/components/ui/buttons/buttonPrimary";
import ButtonSecundary from "@/components/ui/buttons/buttonSecundary";
import ChipButton from "@/components/ui/buttons/chipButton";
import AlertCard, {
  type AlertCardVariant,
} from "@/components/ui/Cards/alertCard";
import InputText from "@/components/ui/inputText";
import { useMapLocation } from "@/hooks/useMapLocation";
import { useBusinessRequest, useCategories } from "@/hooks/useRequests";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

export default function BusinessRequest() {
  type Adress = {
    latitude: number;
    longitude: number;
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { mutate, isPending, error } = useBusinessRequest();
  const [businessName, setBusinessName] = useState("");
  const [adress, setAdress] = useState<Adress | null>(null);
  const { categories, isLoading, categoryError } = useCategories();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { getFreshUserLocation } = useMapLocation();
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  const handleCategorySelection = (categoryId: string, selected: boolean) => {
    setSelectedCategories((currentCategories) => {
      if (selected) {
        return currentCategories.includes(categoryId)
          ? currentCategories
          : [...currentCategories, categoryId];
      }
      return currentCategories.filter((id) => id !== categoryId);
    });
  };
  const handleSubmit = () => {
    if (!adress) {
      Alert.alert(
        "Ubicación requerida",
        "Selecciona la ubicación de la empresa antes de enviar.",
      );
      return;
    }
    mutate(
      {
        businessName,
        categoryId: selectedCategories,
        adress,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "¡Solicitud enviada!",
            message:
              "Tu solicitud de registro de Empresa ha sido enviada correctamente.",
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
                : "Ocurrió un error al guardar el registro de la Empresa.",
          });
        },
      },
    );
  };

  const handleBusinessLocation = async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);

    try {
      const location = await getFreshUserLocation();

      setAdress({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert(
        "Ubicación obtenida con éxito",
        "La ubicación de tu empresa ha sido registrada correctamente.",
      );
    } catch (error) {
      Alert.alert(
        "Ubicación requerida",
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener la ubicación.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/(tabs)/settings");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <AlternativeHeader
        SettingName="Registro de Empresas"
        onTouch={() => router.back()}
      />
      <KeyboardAwareScrollView>
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
            <InputText
              placeholder="Ejemplo: BusTrack"
              value={businessName}
              onChangeText={setBusinessName}
            />
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
              {categories.map((category) => (
                <ChipButton
                  name={category.name}
                  selected={selectedCategories.includes(category.id)}
                  onSelectionChange={(name, selected) =>
                    handleCategorySelection(category.id, selected)
                  }
                  key={category.id}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 10, marginTop: 20, marginBottom: 20 }}>
            <ButtonSecundary
              title={
                isGettingLocation
                  ? "Obteniendo ubicación..."
                  : "Seleccionar ubicación de la Empresa"
              }
              onPress={handleBusinessLocation}
            />
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton
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
    gap: 5,
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
