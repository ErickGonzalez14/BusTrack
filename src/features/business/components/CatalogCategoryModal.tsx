import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import ButtonSecondary from "@/src/shared/ui/buttons/buttonSecundary";
import ChipButton from "@/src/shared/ui/buttons/chipButton";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet as NativeStyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { Categories } from "../data/businessProfile";

type CatalogCategoryModalProps = {
  options: readonly Categories[];
  draftIds: readonly string[];
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  cancel: () => void;
  setSelected: (id: string, selected: boolean) => void;
  clearDraft: () => void;
  apply: () => void;
};

export default function CatalogCategoryModal({
  options,
  draftIds,
  isLoading,
  error,
  retry,
  cancel,
  setSelected,
  clearDraft,
  apply,
}: CatalogCategoryModalProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={cancel}>
      <SafeAreaProvider style={styles.backdrop}>
        <Pressable
          accessible={false}
          style={NativeStyleSheet.absoluteFill}
          onPress={cancel}
        />
        <SafeAreaView style={styles.centered} pointerEvents="box-none">
          <View style={styles.panel} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.title}>Categorías</Text>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.options}>
              {isLoading && <ActivityIndicator accessibilityLabel="Cargando categorías" />}
              {error && (
                <View style={styles.status}>
                  <Text accessibilityRole="alert" style={styles.body}>
                    No se pudieron cargar las categorías.
                  </Text>
                  <ButtonSecondary title="Reintentar" onPress={() => void retry()} />
                </View>
              )}
              {!isLoading && !error && options.length === 0 && (
                <Text style={styles.body}>No hay categorías disponibles.</Text>
              )}
              {options.map((category) => (
                <ChipButton
                  key={category.id}
                  name={category.name}
                  selected={draftIds.includes(category.id)}
                  onSelectionChange={(_name, selected) => setSelected(category.id, selected)}
                />
              ))}
            </ScrollView>
            {draftIds.length > 0 && (
              <Pressable style={styles.clear} accessibilityRole="button" onPress={clearDraft}>
                <Text style={styles.body}>Quitar selección</Text>
              </Pressable>
            )}
            <View style={styles.actions}>
              <ButtonSecondary title="Cancelar" onPress={cancel} />
              <ButtonPrimary text="Aceptar" onPress={apply} />
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "100%",
    flexShrink: 1,
    padding: 20,
    gap: 12,
    borderRadius: theme.size_rounded.md,
    backgroundColor: theme.surface.background,
  },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
    color: theme.text.Body,
  },
  body: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.text.Body,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  status: {
    gap: 8,
    alignItems: "flex-start",
  },
  clear: {
    minHeight: 44,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
}));
