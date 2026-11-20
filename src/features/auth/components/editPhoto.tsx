import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Plus } from "iconoir-react-native";
import { useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { PROFILE_AVATARS, type ProfileAvatarPath } from "../domain/profileAvatar";
import { useEditProfileAvatar } from "../hooks/useEditProfileAvatar";
import { getProfileAvatarSource } from "./profileAvatarSource";

export default function EditPhoto() {
  const { profile, mutate, isPending, isError, reset } = useEditProfileAvatar();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const photoPath = profile?.photo?.url;

  function openSheet() {
    reset();
    bottomSheetRef.current?.present();
  }

  function chooseAvatar(path: ProfileAvatarPath) {
    if (isPending) return;
    mutate(path, { onSuccess: () => bottomSheetRef.current?.dismiss() });
  }

  return (
    <>
      <View style={styles.profileSection}>
        <Pressable
          accessibilityHint="Abre la lista de avatares"
          accessibilityLabel="Cambiar avatar de perfil"
          accessibilityRole="button"
          disabled={!profile}
          hitSlop={12}
          onPress={openSheet}
          style={({ pressed }) => [
            styles.photoButton,
            pressed && styles.photoButtonPressed,
          ]}
        >
          <Image
            contentFit="cover"
            source={getProfileAvatarSource(photoPath)}
            style={styles.photo}
          />
          <View style={styles.addBadge}>
            <Plus color="#FFFFFF" height={14} strokeWidth={2.5} width={14} />
          </View>
        </Pressable>

        <Text style={styles.name}>{profile?.fullName || "Usuario"}</Text>
        {profile?.email ? <Text style={styles.email}>{profile.email}</Text> : null}
      </View>

      <BottomSheetModal
        backgroundStyle={styles.sheetBackground}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior={isPending ? "none" : "close"}
          />
        )}
        enablePanDownToClose={!isPending}
        ref={bottomSheetRef}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text accessibilityRole="header" style={styles.sheetTitle}>Elige tu avatar</Text>
          <View style={styles.avatarGrid}>
            {PROFILE_AVATARS.map(({ path, label }) => {
              const selected = path === photoPath;
              return (
                <Pressable
                  key={path}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected, disabled: isPending }}
                  disabled={isPending}
                  onPress={() => chooseAvatar(path)}
                  style={[styles.avatarOption, selected && styles.selectedAvatar]}
                >
                  <Image source={getProfileAvatarSource(path)} style={styles.avatarImage} />
                  <Text style={styles.avatarLabel}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          {isPending && <ActivityIndicator accessibilityLabel="Guardando avatar" />}
          {isError && (
            <Text accessibilityRole="alert" style={styles.avatarLabel}>
              No se pudo guardar el avatar. Inténtalo de nuevo.
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={isPending}
            onPress={() => bottomSheetRef.current?.dismiss()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
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
  sheetBackground: {
    backgroundColor: theme.surface.background,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  sheetTitle: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  avatarOption: {
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: theme.size_rounded.md,
    gap: 4,
    padding: 4,
  },
  selectedAvatar: {
    borderColor: theme.surface.brand,
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFB21A",
  },
  avatarLabel: {
    color: theme.text.Body,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
  cancelButton: {
    alignItems: "center",
    borderTopColor: "#EFF2F5",
    borderTopWidth: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  cancelText: {
    color: theme.surface.brand,
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
  },
}));
