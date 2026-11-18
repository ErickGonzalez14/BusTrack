import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { useFavoritePlaceEditor } from "../hooks/useFavoritePlaceEditor";

type FavoriteNameModalProps = Pick<ReturnType<typeof useFavoritePlaceEditor>,
  "isFavoriteModalOpen" | "closeFavoriteModal" | "favoriteName" | "setFavoriteName" |
  "isSavingFavorite" | "handleSaveFavorite"
>;

export function FavoriteNameModal({
  isFavoriteModalOpen, closeFavoriteModal, favoriteName, setFavoriteName,
  isSavingFavorite, handleSaveFavorite,
}: FavoriteNameModalProps) {
  return (
    <Modal
      visible={isFavoriteModalOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeFavoriteModal}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Guardar lugar favorito</Text>
          <Text style={styles.modalDescription}>
            Ponle un nombre personalizado para encontrarlo fácilmente.
          </Text>
          <TextInput
            autoFocus
            value={favoriteName}
            onChangeText={setFavoriteName}
            placeholder="Ejemplo: Casa de mamá"
            placeholderTextColor="#7B8794"
            maxLength={80}
            editable={!isSavingFavorite}
            returnKeyType="done"
            style={styles.favoriteNameInput}
            onSubmitEditing={() => void handleSaveFavorite()}
          />
          <View style={styles.modalActions}>
            <Pressable
              style={styles.modalCancelButton}
              disabled={isSavingFavorite}
              onPress={closeFavoriteModal}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalSaveButton,
                (!favoriteName.trim() || isSavingFavorite) &&
                  styles.buttonDisabled,
              ]}
              disabled={!favoriteName.trim() || isSavingFavorite}
              onPress={() => void handleSaveFavorite()}
            >
              {isSavingFavorite ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  buttonDisabled: {
    opacity: 0.65,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(8, 20, 35, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
    padding: 20,
    borderRadius: theme.size_rounded.lg,
    backgroundColor: theme.surface.background,
  },
  modalTitle: {
    fontFamily: theme.fonts.heavy,
    fontSize: 22,
    color: theme.text.Body,
  },
  modalDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.placeholder,
  },
  favoriteNameInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    borderRadius: theme.size_rounded.sm,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.text.Body,
    backgroundColor: theme.surface.inputs,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  modalCancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Body,
  },
  modalSaveButton: {
    minWidth: 110,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.size_rounded.sm,
    paddingHorizontal: 16,
    backgroundColor: theme.components.buttons.primary,
  },
  modalSaveText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: "#FFFFFF",
  },
}));
