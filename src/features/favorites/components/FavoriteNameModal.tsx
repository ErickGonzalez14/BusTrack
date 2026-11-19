import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type FavoriteNameModalProps = {
  isFavoriteModalOpen: boolean;
  closeFavoriteModal: () => void;
  favoriteName: string;
  setFavoriteName: (name: string) => void;
  isSavingFavorite: boolean;
  handleSaveFavorite: () => Promise<void>;
  isEditing?: boolean;
  isDeletingFavorite?: boolean;
  handleDeleteFavorite?: () => Promise<void>;
  onViewOnMap?: () => void;
  error?: string | null;
};

export function FavoriteNameModal({
  isFavoriteModalOpen, closeFavoriteModal, favoriteName, setFavoriteName,
  isSavingFavorite, handleSaveFavorite, isEditing = false,
  isDeletingFavorite = false, handleDeleteFavorite, onViewOnMap, error,
}: FavoriteNameModalProps) {
  const isBusy = isSavingFavorite || isDeletingFavorite;
  const canSave = Boolean(favoriteName.trim()) && !isBusy;

  function confirmDelete() {
    if (!handleDeleteFavorite || isBusy) return;

    Alert.alert("Eliminar favorito", "¿Quieres quitar este lugar de tus favoritos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => void handleDeleteFavorite() },
    ]);
  }

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
        <View style={styles.modalCard} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.modalTitle}>
            {isEditing ? "Editar lugar favorito" : "Guardar lugar favorito"}
          </Text>
          <Text style={styles.modalDescription}>
            {isEditing
              ? "Nombre del lugar"
              : "Ponle un nombre personalizado para encontrarlo fácilmente."}
          </Text>
          <TextInput
            accessibilityLabel="Nombre del lugar"
            autoFocus={!handleDeleteFavorite}
            value={favoriteName}
            onChangeText={setFavoriteName}
            placeholder="Ejemplo: Casa de mamá"
            placeholderTextColor="#7B8794"
            maxLength={80}
            editable={!isBusy}
            returnKeyType="done"
            style={styles.favoriteNameInput}
            onSubmitEditing={() => canSave && void handleSaveFavorite()}
          />
          {error && <Text accessibilityRole="alert" style={styles.modalDescription}>{error}</Text>}
          <View style={styles.modalActions}>
            <Pressable
              accessibilityRole="button"
              style={styles.modalCancelButton}
              disabled={isBusy}
              onPress={closeFavoriteModal}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Guardar"
              style={[
                styles.modalSaveButton,
                !canSave && styles.buttonDisabled,
              ]}
              disabled={!canSave}
              onPress={() => void handleSaveFavorite()}
            >
              {isSavingFavorite ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Guardar</Text>
              )}
            </Pressable>
          </View>
          {(onViewOnMap || handleDeleteFavorite) && (
            <View style={styles.additionalActions}>
              {onViewOnMap && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.modalCancelButton}
                  disabled={isBusy}
                  onPress={onViewOnMap}
                >
                  <Text style={styles.modalCancelText}>Ver en el mapa</Text>
                </Pressable>
              )}
              {handleDeleteFavorite && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar favorito"
                  style={styles.modalCancelButton}
                  disabled={isBusy}
                  onPress={confirmDelete}
                >
                  {isDeletingFavorite ? (
                    <ActivityIndicator size="small" color="#D63C3C" />
                  ) : (
                    <Text style={[styles.modalCancelText, styles.deleteText]}>Eliminar favorito</Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
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
  additionalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.text.placeHolderLight,
    paddingTop: 4,
  },
  deleteText: {
    color: "#D63C3C",
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
