import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useEditNickname } from "../hooks/useEditNickname";

export default function EditNicknameModal({ onClose }: { onClose: () => void }) {
  const editor = useEditNickname(onClose);
  const { theme } = useUnistyles();

  function closeModal() {
    if (!editor.isPending) onClose();
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.panel} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.title}>
            Cambiar nombre de usuario
          </Text>
          <TextInput
            accessibilityLabel="Nombre de usuario"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!editor.isPending}
            onChangeText={editor.changeNickname}
            onSubmitEditing={editor.save}
            placeholder="Nombre de usuario"
            placeholderTextColor={theme.text.placeHolderLight}
            returnKeyType="done"
            style={styles.input}
            value={editor.nickname}
          />
          {editor.error && (
            <Text accessibilityRole="alert" style={styles.text}>{editor.error.message}</Text>
          )}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={editor.isPending}
              onPress={closeModal}
              style={styles.cancel}
            >
              <Text style={styles.text}>Cancelar</Text>
            </Pressable>
            <ButtonPrimary
              disabled={!editor.canSave}
              onPress={editor.save}
              text={editor.isPending ? "Guardando…" : "Guardar"}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    borderRadius: theme.size_rounded.md,
    backgroundColor: theme.surface.background,
    padding: 20,
    gap: 12,
  },
  title: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    borderRadius: theme.size_rounded.sm,
    paddingHorizontal: 12,
    backgroundColor: theme.surface.inputs,
    color: theme.text.Body,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  text: {
    color: theme.text.Body,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  cancel: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
}));
