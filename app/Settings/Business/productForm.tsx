import AlternativeHeader from "@/components/Headers/alternativeHeader";
import { default as PrimaryButton } from "@/components/ui/buttons/buttonPrimary";
import ChipButton from "@/components/ui/buttons/chipButton";
import AlertCard, {
  type AlertCardVariant,
} from "@/components/ui/Cards/alertCard";
import ColorPickerCard from "@/components/ui/Cards/colorPickerCard";
import ImageUpload from "@/components/ui/imageUpload";
import TextInput from "@/components/ui/inputText";
import {
  useBusinessCategories,
  useProductRequest,
  useUploadImage,
} from "@/hooks/useRequests";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";

//Fin de Importaciones
export default function ProductForm() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { mutateAsync: uploadImageAsync, isPending: isUploading } =
    useUploadImage();
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const { mutate, isPending, error } = useProductRequest();
  //states for product form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { businessCategories, isLoading, categoryError } =
    useBusinessCategories();
  //state for alert
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);
  //state for selected color
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!selectedColor) {
      Alert.alert(
        "Color requerido",
        "Selecciona un color de fondo antes de enviar.",
      );
      return;
    }
    if (!productImage) {
      Alert.alert(
        "Imagen requerida",
        "Selecciona una imagen del producto antes de enviar.",
      );
      return;
    }
    const normalizedPrice = price.trim();
    const parsedPrice = Number(price);

    if (!normalizedPrice || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      Alert.alert("Precio inválido", "Ingresa un precio válido.");
      return;
    }

    const priceForRequest = String(parsedPrice);
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
        name,
        description,
        price: priceForRequest,
        categoryId: selectedCategories,
        imageUrl: cloudinaryUrl,
        cardColor: selectedColor?.hex,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "¡Producto publicado!",
            message: "Tu producto ha sido publicado correctamente.",
          });
        },
        onError: (requestError) => {
          console.error("No se pudo completar el registro:", requestError);
          setAlert({
            variant: "error",
            title: "No pudimos publicar tu producto",
            message:
              requestError instanceof Error
                ? requestError.message
                : "Ocurrió un error al publicar el producto, intentalo mas Tarde.",
          });
        },
      },
    );
  };
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
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/Settings/Business/dashBoard");
    }
  };
  const handleImageChange = (uri: string | null) => {
    setProductImage(uri);
    setImageUrl(null);
  };
  return (
    <View style={styles.screen}>
      <AlternativeHeader
        SettingName="Publicar Producto"
        onTouch={() => router.back()}
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <View style={styles.formContainer}>
          {/* Nombre del Producto */}
          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput
            placeholder="Nombre del Producto"
            value={name}
            onChangeText={setName}
          />
          {/* Descripción del Producto */}
          <Text style={styles.label}>Descripción del Producto</Text>
          <TextInput
            placeholder="Descripción del Producto"
            value={description}
            onChangeText={setDescription}
          />
          {/* Precio del Producto */}
          <Text style={styles.label}>Precio del Producto</Text>
          <TextInput
            placeholder="Precio del Producto"
            value={price}
            onChangeText={setPrice}
          />
          {/* Categoría del Producto */}
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
          {/* Color de Fondo */}
          <Text style={styles.label}>Color de Fondo</Text>
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
          {/* Imagen del Producto */}
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
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            text={isPending ? "Enviando..." : "Enviar Solicitud"}
            onPress={handleSubmit}
          />
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
  formContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
  },
  buttonContainer: {
    marginBottom: 30,
    marginHorizontal: 15,
  },
  uploadImageContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
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
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
    marginBottom: 20,
  },
}));
