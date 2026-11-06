import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import { useUpdateBusinessLogo } from "@/hooks/useRequests";
import {
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { Camera, MediaImage, Plus } from "iconoir-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
type EditLogoProps = {
  initialLogoUrl?: string;
};

export default function EditLogo({ initialLogoUrl }: EditLogoProps) {
  const DEFAULT_LOGO =
    "https://th.bing.com/th/id/OIP.18T7x1XPQ3660EIj5jLlgAHaHa";
  const [logoUri, setLogoUri] = useState(initialLogoUrl || DEFAULT_LOGO);
  useEffect(() => {
    setLogoUri(initialLogoUrl || DEFAULT_LOGO);
  }, [initialLogoUrl]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["30%"], []);

  const { mutateAsync: updateBusinessLogo, isPending } =
    useUpdateBusinessLogo();

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const saveLogo = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) {
        closeSheet();
        return;
      }

      const localImageUri = result.assets[0].uri;

      try {
        const response = await updateBusinessLogo(localImageUri);

        setLogoUri(response.logoUrl);
        closeSheet();

        Alert.alert("Éxito", response.message);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el logo",
        );
      }
    },
    [closeSheet, updateBusinessLogo],
  );
  const renderFooter = useCallback(
    (props: { animatedFooterPosition: any }) => (
      <BottomSheetFooter {...props} bottomInset={10}>
        <View style={styles.buttonContainer}>
          <ButtonPrimary
            text="Cancelar"
            onPress={closeSheet}
            disabled={isPending}
          />
        </View>
      </BottomSheetFooter>
    ),
    [closeSheet, isPending],
  );
  const chooseFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    await saveLogo(result);
  }, [saveLogo]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Permite el acceso a la cámara para tomar una foto.",
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

    await saveLogo(result);
  }, [saveLogo]);

  return (
    <>
      <Pressable disabled={isPending} onPress={openSheet}>
        <Image source={{ uri: logoUri }} style={styles.imageContainer} />

        <View style={styles.addBadge}>
          <Plus color="#FFFFFF" height={14} strokeWidth={2.5} width={24} />
        </View>
      </Pressable>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        footerComponent={renderFooter}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <Text style={styles.title}>Cambiar logo</Text>
          <View style={styles.optionsContainer}>
            <Pressable
              disabled={isPending}
              onPress={takePhoto}
              style={styles.optionContainer}
            >
              <Camera color="#4D7EFF" height={22} width={22} strokeWidth={2} />
              <Text style={styles.optionText}>Tomar una foto</Text>
            </Pressable>

            <Pressable
              disabled={isPending}
              onPress={chooseFromLibrary}
              style={styles.optionContainer}
            >
              <MediaImage
                color="#4D7EFF"
                height={22}
                width={22}
                strokeWidth={2}
              />
              <Text style={styles.optionText}>Elegir de la galería</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

export const styles = StyleSheet.create((theme) => ({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.size_rounded.full,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.heavy,
    color: theme.text.contrast,
    textAlign: "center",
  },
  addBadge: {
    alignItems: "center",
    backgroundColor: theme.surface.brand,
    borderColor: theme.surface.neutral,
    borderRadius: theme.size_rounded.full,
    borderWidth: 2,
    bottom: 5,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    width: 30,
  },
  optionsContainer: {
    marginTop: 15,
    gap: 15,
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 10,
    marginHorizontal: 20,
  },
  sheetContainer: {
    flex: 1,
    paddingTop: 20,
  },
}));
