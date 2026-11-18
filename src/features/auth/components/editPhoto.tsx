import { useAuth } from "@/src/features/auth/context/authContext";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, MediaImage, Plus } from "iconoir-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const DEFAULT_PHOTO =
  "https://res.cloudinary.com/snvvb5aq/image/upload/v1784917188/image_1_eosede.png";

type EditPhotoProps = {
  initialPhotoUrl?: string;
  userName?: string;
  email?: string;
  onPhotoChange?: (uri: string) => void;
};

export default function EditPhoto({
  initialPhotoUrl = DEFAULT_PHOTO,
  userName = "Roberto Díaz",
  email = "Roberto@gmail.com",
  onPhotoChange,
}: EditPhotoProps) {
  const { profile } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["34%"], []);
  const [photoUri, setPhotoUri] = useState(initialPhotoUrl);

  const closeSheet = useCallback(() => bottomSheetRef.current?.close(), []);

  const savePhoto = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        onPhotoChange?.(uri);
      }
      closeSheet();
    },
    [closeSheet, onPhotoChange],
  );

  const chooseFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    savePhoto(result);
  }, [savePhoto]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Permite el acceso a la cámara para tomar una foto de perfil.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    savePhoto(result);
  }, [savePhoto]);

  return (
    <>
      <View style={styles.profileSection}>
        <Pressable
          accessibilityHint="Abre las opciones para cambiar la foto"
          accessibilityLabel="Cambiar foto de perfil"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => bottomSheetRef.current?.expand()}
          style={({ pressed }) => [
            styles.photoButton,
            pressed && styles.photoButtonPressed,
          ]}
        >
          <Image
            accessibilityLabel={`Foto de perfil de ${userName}`}
            contentFit="cover"
            source={{ uri: photoUri }}
            style={styles.photo}
          />
          <View style={styles.addBadge}>
            <Plus color="#FFFFFF" height={14} strokeWidth={2.5} width={14} />
          </View>
        </Pressable>

        <Text style={styles.name}>{profile?.fullName || userName}</Text>
        <Text style={styles.email}>{profile?.email || email}</Text>
      </View>

      <BottomSheet
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        enablePanDownToClose
        index={-1}
        ref={bottomSheetRef}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Cambiar foto de perfil</Text>
          <Text style={styles.sheetDescription}>
            Elige cómo quieres actualizar tu foto.
          </Text>

          <Pressable onPress={takePhoto} style={styles.action}>
            <View style={styles.actionIcon}>
              <Camera color="#4D7EFF" height={22} width={22} />
            </View>
            <Text style={styles.actionText}>Tomar una foto</Text>
          </Pressable>

          <Pressable onPress={chooseFromLibrary} style={styles.action}>
            <View style={styles.actionIcon}>
              <MediaImage color="#4D7EFF" height={22} width={22} />
            </View>
            <Text style={styles.actionText}>Elegir de la galería</Text>
          </Pressable>

          <Pressable onPress={closeSheet} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  profileSection: {
    alignItems: "center",
    backgroundColor: theme.surface.neutral,

    paddingTop: 10,
  },
  photoButton: {
    height: 82,
    marginBottom: 8,
    position: "relative",
    width: 82,
  },
  photoButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  photo: {
    backgroundColor: "#FFB21A",
    borderRadius: 41,
    height: 82,
    width: 82,
  },
  addBadge: {
    alignItems: "center",
    backgroundColor: theme.surface.brand,
    borderColor: theme.surface.neutral,
    borderRadius: 12,
    borderWidth: 2,
    bottom: 0,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    width: 24,
  },
  name: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 24,
  },
  email: {
    color: "#b9b9b9",
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    marginTop: 2,
  },
  sheetContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  sheetTitle: {
    color: "#232629",
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
  },
  sheetDescription: {
    color: "#6A727B",
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  action: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 52,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40,
  },
  actionText: {
    color: "#232629",
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  cancelButton: {
    alignItems: "center",
    borderTopColor: "#EFF2F5",
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 14,
  },
  cancelText: {
    color: theme.surface.brand,
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
  },
}));
