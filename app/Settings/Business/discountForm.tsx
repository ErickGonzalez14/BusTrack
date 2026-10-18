import AlternativeHeader from "@/components/Headers/alternativeHeader";
import PrimaryButton from "@/components/ui/buttons/buttonPrimary";
import ChipButton from "@/components/ui/buttons/chipButton";
import AlertCard, {
  type AlertCardVariant,
} from "@/components/ui/Cards/alertCard";
import ColorPickerCard from "@/components/ui/Cards/colorPickerCard";
import ImageUpload from "@/components/ui/imageUpload";
import TextInput from "@/components/ui/inputText";
import DatePickerLabel from "@/components/ui/Labels/datePickerLabel";
import {
  useBusinessCategories,
  useDiscountRequest,
  useUploadImage,
} from "@/hooks/useRequests";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
//end of imports
export default function DiscountForm() {
  //state for unistyles
  const { theme } = useUnistyles();
  //states for maping categories
  const { businessCategories, isLoading, categoryError } =
    useBusinessCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  //state for selected color
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);
  const { mutateAsync: uploadImageAsync, isPending: isUploading } =
    useUploadImage();
  //state for upload image
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  //state for alert
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);
  //state for form inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lastPrice, setLastPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  //abstraction of Discount Hook
  const { mutate, isPending, error } = useDiscountRequest();
  //handle of form submission
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

    const parsedLastPrice = Number(lastPrice);
    const parsedCurrentPrice = Number(currentPrice);

    if (
      !lastPrice.trim() ||
      Number.isNaN(parsedLastPrice) ||
      parsedLastPrice < 0
    ) {
      Alert.alert("Precio inválido", "Ingresa un precio válido.");
      return;
    }
    if (
      !currentPrice.trim() ||
      Number.isNaN(parsedCurrentPrice) ||
      parsedCurrentPrice < 0
    ) {
      Alert.alert("Precio inválido", "Ingresa un precio válido.");
      return;
    }
    if (parsedCurrentPrice >= parsedLastPrice) {
      Alert.alert(
        "Precio inválido",
        "El precio actual debe ser menor que el precio anterior.",
      );
      return;
    }
    const normalizedStartDate = new Date(startDate);
    const normalizedEndDate = new Date(endDate);
    const now = new Date();

    if (normalizedStartDate <= now) {
      Alert.alert(
        "Fecha de Inicio Inválida",
        "La fecha y hora de inicio deben ser posterior a la fecha actual.",
      );
      return;
    }
    if (normalizedEndDate <= normalizedStartDate) {
      Alert.alert(
        "Fecha final inválida",
        "La fecha y hora de finalización deben ser posteriores a la fecha y hora de inicio.",
      );
      return;
    }
    if (normalizedEndDate <= normalizedStartDate) {
      Alert.alert(
        "Fechas inválidas",
        "La fecha final debe ser posterior a la fecha inicial.",
      );
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
        name,
        description,
        lastPrice: parsedLastPrice,
        currentPrice: parsedCurrentPrice,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        cardColor: selectedColor?.hex,
        imageUrl: cloudinaryUrl,
        categoryId: selectedCategories,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "¡Descuento Creado Exit!",
            message:
              "Tu solicitud de publicación de Descuento ha sido enviada correctamente.",
          });
        },
        onError: (error) => {
          setAlert({
            variant: "error",
            title: "Error al crear el descuento",
            message:
              error instanceof Error
                ? error.message
                : "Ocurrió un error al crear el descuento, intentalo mas tarde.",
          });
        },
      },
    );
  };

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
  //handle image change
  const handleImageChange = (uri: string | null) => {
    setProductImage(uri);
    setImageUrl(null);
  };
  //handle alert close
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/Settings/Business/dashBoard");
    }
  };
  return (
    <View style={styles.screen}>
      <AlternativeHeader
        SettingName="Publicar Descuento"
        onTouch={() => router.back()}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <View style={styles.formContainer}>
          {/* Price Name */}
          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput
            placeholder="Nombre del Producto"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          {/* Price Description */}
          <Text style={styles.label}>Descripción de la oferta</Text>
          <TextInput
            placeholder="Descripción de la oferta"
            multiline={true}
            numberOfLines={4}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
          {/* After and Before Prices */}
          <Text style={[{ marginTop: 5 }, styles.label]}>
            Precios del Descuento
          </Text>
          <View style={styles.PricesContainer}>
            {/* Last Price */}
            <View style={styles.PriceInputContainer}>
              <TextInput
                placeholder="Antes"
                keyboardType="decimal-pad"
                value={lastPrice}
                onChangeText={(text) => setLastPrice(text)}
              />
            </View>
            {/* Current Price */}
            <View style={styles.PriceInputContainer}>
              <TextInput
                placeholder="Ahora"
                keyboardType="decimal-pad"
                value={currentPrice}
                onChangeText={(text) => setCurrentPrice(text)}
              />
            </View>
          </View>
          {/*Discount Categories*/}
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
          {/* Card color*/}
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
          {/* Dates */}
          <Text style={[{ marginTop: 20 }, styles.label]}>
            Tiempo de la Oferta
          </Text>
          <View style={styles.DatesContainer}>
            {/* Start Date */}
            <View style={styles.dateWrapper}>
              <DatePickerLabel
                type="datetime"
                value={startDate}
                onChange={(selected) => setStartDate(selected)}
                locale="es"
              />
            </View>
            {/* End Date */}
            <View style={styles.dateWrapper}>
              <DatePickerLabel
                type="datetime"
                value={endDate}
                onChange={(selected) => setEndDate(selected)}
                locale="es"
              />
            </View>
          </View>
          {/* Image */}
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
    marginLeft: 10,
    marginBottom: 5,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
    marginBottom: 20,
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
  DatesContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginHorizontal: 5,
    gap: 20,
  },
  screen: {
    flex: 1,
  },
  subLabel: {
    fontSize: 16,
    color: theme.text.Body,
    fontFamily: theme.fonts.regular,
    marginLeft: 5,
    marginBottom: 5,
  },
  PricesContainer: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 10,
    justifyContent: "space-between",
    marginHorizontal: 5,
    gap: 20,
  },
  PriceInputContainer: {
    flex: 1,
    minWidth: 0,
  },
  buttonContainer: {
    marginBottom: 30,
    marginHorizontal: 15,
  },
  dateWrapper: {
    flex: 1,
    minWidth: 0,
  },
}));
