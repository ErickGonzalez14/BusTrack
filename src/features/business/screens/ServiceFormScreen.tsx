import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import PrimaryButton from "@/src/shared/ui/buttons/buttonPrimary";
import ChipButton from "@/src/shared/ui/buttons/chipButton";
import AlertCard, {
  type AlertCardVariant,
} from "@/src/shared/ui/Cards/alertCard";
import ColorPickerCard from "@/src/shared/ui/Cards/colorPickerCard";
import { ImageUpload } from "@/src/shared/ui/imageUpload";
import InputText from "@/src/shared/ui/inputText";
import { useBusinessCategories } from "@/src/features/business/hooks/useBusinessProfile";
import {
  useServicePublication,
  useUploadImage,
} from "@/src/features/business/hooks/useBusinessPublications";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
//end of imports

export default function ServiceForm() {
  // states for selected categories
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    [],
  );
  const { businessCategories } =
    useBusinessCategories();

  //states for image upload
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { mutateAsync: uploadImageAsync, isPending: isUploading } =
    useUploadImage();

  //states for selected Color
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);

  //states for alert
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  // states for form inputs
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [servicePhone, setServicePhone] = useState("");
  const { mutate, isPending } = useServicePublication();

  //handle category selection
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

  //handle imageUpload
  const handleImageChange = (uri: string | null) => {
    setProductImage(uri);
    setImageUrl(null);
  };

  // handle alert close
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/Settings/Business/dashBoard");
    }
  };

  //handle for submit
  const handleSubmit = async () => {
    if (!selectedColor) {
      Alert.alert(
        "Color requerido",
        "Selecciona un color de fondo antes de enviar.",
      );
      return;
    }
    if (!productImage) {
      Alert.alert("Imagen requerida", "Selecciona una imagen antes de enviar.");
      return;
    }
    let cloudinaryUrl = imageUrl;
    try {
      cloudinaryUrl = await uploadImageAsync(productImage);
      setImageUrl(cloudinaryUrl);
    } catch (error) {
      Alert.alert(
        "Error al subir la imagen",
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
      return;
    }
    mutate(
      {
        name: serviceName,
        description: serviceDescription,
        price: servicePrice,
        phoneNumber: servicePhone,
        categoryId: selectedCategories,
        cardColor: selectedColor.hex,
        imageUrl: cloudinaryUrl,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "Solicitud enviada",
            message:
              "Tu solicitud de servicio ha sido enviada con éxito. Se revisará y se publicará una vez aprobada.",
          });
        },
        onError: (error) => {
          setAlert({
            variant: "error",
            title: "Error al enviar la solicitud",
            message:
              error instanceof Error
                ? error.message
                : "Ocurrió un error al enviar la solicitud. Por favor, inténtalo de nuevo.",
          });
        },
      },
    );
  };
  return (
    <View style={styles.screen}>
      <AlternativeHeader
        SettingName="Solicitud de Servicio"
        onTouch={() => router.back()}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        {/* Formulario de solicitud de servicio */}
        <View style={styles.formContainer}>
          {/* Nombre del Servicio */}
          <Text style={styles.label}>Nombre del Producto</Text>
          <InputText
            placeholder="Nombre del Servicio"
            onChangeText={(text) => setServiceName(text)}
          />
          {/* Descripción del Servicio */}
          <Text style={styles.label}>Descripción del Servicio</Text>
          <InputText
            placeholder="Descripción del Servicio"
            onChangeText={(text) => setServiceDescription(text)}
          />
          {/* Numero de Telefono */}
          <Text style={styles.label}>Número de Teléfono</Text>
          <InputText
            placeholder="Número de Teléfono"
            keyboardType="phone-pad"
            onChangeText={(text) => setServicePhone(text)}
          />
          {/* Precio del Servicio */}
          <Text style={styles.label}>Precio del Servicio</Text>
          <InputText
            placeholder="Precio del Servicio"
            keyboardType="numeric"
            onChangeText={(text) => setServicePrice(text)}
          />
          {/* Categoria del servicio */}
          <Text style={styles.label}>Categoría del Producto</Text>
          <View style={styles.chipContainer}>
            {businessCategories?.map((category) => (
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
          {/* Color del Servicio */}
          <Text style={styles.label}>Color de fondo</Text>
          <Pressable
            style={[
              styles.button,
              selectedColor && { backgroundColor: selectedColor.hex },
            ]}
            onPress={() => setIsColorPickerVisible(true)}
          >
            <Text style={styles.textButton}>
              {selectedColor ? selectedColor.name : "Seleccionar Color"}
            </Text>
          </Pressable>
          <ColorPickerCard
            visible={isColorPickerVisible}
            onClose={() => setIsColorPickerVisible(false)}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setIsColorPickerVisible(false);
            }}
          />
          {/* Imagen del Servicio */}
          <View style={styles.uploadImageContainer}>
            <ImageUpload
              value={productImage}
              onChange={handleImageChange}
              isLoading={isUploading}
              disabled={isUploading || isPending}
              aspect={[4, 3]}
              quality={0.8}
            />
          </View>
          {/* Botón de envío */}
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
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    marginLeft: 10,
    marginBottom: 5,
  },
  formContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 30,
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: theme.surface.brand,
    paddingVertical: 12,
    borderRadius: theme.size_rounded.md,
    alignItems: "center",
  },
  textButton: {
    color: theme.text.Secondary,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  uploadImageContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
  },
}));
