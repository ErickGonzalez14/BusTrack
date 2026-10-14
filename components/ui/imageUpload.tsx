import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface ImageUploadProps {
  /**
   * Current selected image URI (controlled).
   */
  value?: string | null;
  /**
   * Callback fired when an image is picked or removed.
   */
  onChange?: (uri: string | null) => void;
  /**
   * Custom press handler for the upload button (if handled externally).
   */
  onUploadPress?: () => void;
  /**
   * Button label text. Defaults to "Subir".
   */
  buttonText?: string;
  /**
   * Optional custom title. If omitted, uses "Arrastra o Sube una Imagen del Producto".
   */
  title?: string;
  /**
   * Aspect ratio for the image picker crop, e.g. [4, 3] or [1, 1]. Defaults to [4, 3].
   */
  aspect?: [number, number];
  /**
   * Image quality between 0 and 1. Defaults to 0.8.
   */
  quality?: number;
  /**
   * Whether to allow user editing/cropping. Defaults to true.
   */
  allowsEditing?: boolean;
  /**
   * Disable interactions while uploading or saving.
   */
  disabled?: boolean;
  /**
   * Shows a loading spinner if upload is in progress.
   */
  isLoading?: boolean;
  /**
   * Additional style for the container.
   */
  style?: StyleProp<ViewStyle>;
}

export default function ImageUpload({
  value,
  onChange,
  onUploadPress,
  buttonText = "Subir",
  title,
  aspect = [4, 3],
  quality = 0.8,
  allowsEditing = true,
  disabled = false,
  isLoading = false,
  style,
}: ImageUploadProps) {
  const { theme } = useUnistyles();
  const [internalUri, setInternalUri] = useState<string | null>(null);

  // Controlled if `value` is explicitly provided, otherwise uncontrolled
  const currentImageUri = value !== undefined ? value : internalUri;

  const handlePickImage = async () => {
    if (disabled || isLoading) return;

    if (onUploadPress) {
      onUploadPress();
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso necesario",
          "Se requiere acceso a tu galería para seleccionar una imagen del producto.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setInternalUri(pickedUri);
        onChange?.(pickedUri);
      }
    } catch {
      Alert.alert("Error", "No se pudo cargar la imagen seleccionada.");
    }
  };

  const handleRemove = () => {
    setInternalUri(null);
    onChange?.(null);
  };

  return (
    <View style={[styles.container, style]}>
      {currentImageUri ? (
        // Preview State when an image is selected
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: currentImageUri }}
            style={styles.previewImage}
            contentFit="cover"
            transition={300}
            accessibilityLabel="Imagen seleccionada"
          />

          <View style={styles.previewActions}>
            <Pressable
              disabled={disabled || isLoading}
              onPress={handlePickImage}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.changeBtn,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cambiar imagen"
            >
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </Pressable>

            <Pressable
              disabled={disabled || isLoading}
              onPress={handleRemove}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.removeBtn,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Eliminar imagen"
            >
              <Text style={styles.removeBtnText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Empty Upload State (matching reference image)
        <>
          {/* Custom vector illustration for image placeholder */}
          <View style={styles.iconWrapper}>
            <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
              {/* Outer frame */}
              <Rect
                x="4"
                y="4"
                width="56"
                height="56"
                rx="14"
                stroke={theme.surface.brand}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sun element */}
              <Circle
                cx="21"
                cy="21"
                r="4.5"
                stroke={theme.surface.brand}
                strokeWidth="3.5"
              />
              {/* Mountain peaks */}
              <Path
                d="M6 46L21 31L32 42L46 26L58 38"
                stroke={theme.surface.brand}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* Descriptive text with highlighted keywords */}
          {title ? (
            <Text style={styles.customTitle}>{title}</Text>
          ) : (
            <Text style={styles.promptText}>
              <Text style={styles.neutralText}>Sube</Text>
              <Text style={styles.neutralText}> una </Text>
              <Text style={styles.brandText}>Imagen</Text>
              <Text style={styles.neutralText}> del Producto</Text>
            </Text>
          )}

          {/* Action button */}
          <Pressable
            disabled={disabled || isLoading}
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.uploadButton,
              pressed && styles.btnPressed,
              (disabled || isLoading) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${buttonText} imagen del producto`}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.text.Secondary} size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>{buttonText}</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

export { ImageUpload };

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    backgroundColor: theme.surface.background,
    borderWidth: 2,
    borderColor: theme.surface.brand,
    borderStyle: "dashed",
    borderRadius: theme.size_rounded.md,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: theme.fonts.heavy,
  },
  customTitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Primary,
  },
  brandText: {
    color: theme.surface.brand,
    fontFamily: theme.fonts.heavy,
  },
  neutralText: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
  },
  uploadButton: {
    backgroundColor: theme.surface.brand,
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: theme.size_rounded.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.surface.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadButtonText: {
    color: theme.text.Secondary,
    fontSize: 17,
    fontFamily: theme.fonts.heavy,
    textAlign: "center",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Preview state styles
  previewContainer: {
    width: "100%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 190,
    borderRadius: theme.size_rounded.md || 12,
    marginBottom: 16,
    backgroundColor: theme.surface.neutral,
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.size_rounded.md || 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  changeBtn: {
    backgroundColor: theme.surface.brand,
  },
  changeBtnText: {
    color: theme.text.Secondary,
    fontSize: 14,
    fontFamily: theme.fonts.heavy,
  },
  removeBtn: {
    backgroundColor: theme.surface.neutral,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
  },
  removeBtnText: {
    color: theme.text.Primary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
}));
