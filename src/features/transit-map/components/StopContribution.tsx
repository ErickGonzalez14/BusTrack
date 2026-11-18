import DropDown from "@/src/shared/ui/dropDown";
import { Plus } from "iconoir-react-native";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { CROWD_BUS_TYPES, CROWD_ROUTE_DIRECTIONS } from "../data/stopContributions";
import type { useStopContribution } from "../hooks/useStopContribution";

export function StopContribution({
  isAddingStop, isCrowdStop, isOpen, canSaveStop, stopName, setStopName,
  crowdRouteName, setCrowdRouteName, setCrowdDirection, setCrowdBusType,
  handleAddStop, openStopNameModal, closeStopNameModal,
}: Omit<ReturnType<typeof useStopContribution>, "clearRouteStop">) {
  return (
    <>
      <Pressable
        style={[
          styles.addStopButton,
          isAddingStop && styles.addStopButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Agregar parada en mi ubicación"
        accessibilityState={{ busy: isAddingStop, disabled: isAddingStop }}
        hitSlop={4}
        disabled={isAddingStop}
        onPress={openStopNameModal}
      >
        {isAddingStop ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Plus width={20} height={20} color="#FFFFFF" strokeWidth={2.5} />
        )}
        <Text style={styles.addStopButtonText}>
          {isAddingStop ? "Guardando" : "Agregar parada"}
        </Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeStopNameModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.modalCard}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.modalTitle}>{isCrowdStop ? "Proponer parada" : "Nombre de la parada"}</Text>
            <Text style={styles.modalDescription}>
              {isCrowdStop
                ? "Guardaremos tu ubicación actual como la posición de la parada."
                : "Escribe un nombre que ayude a reconocer este lugar."}
            </Text>
            <TextInput
              autoFocus={isOpen && !isCrowdStop}
              accessibilityLabel="Nombre de la parada"
              value={stopName}
              onChangeText={setStopName}
              placeholder={isCrowdStop ? "Nombre de la parada" : "Ejemplo: Valdez"}
              placeholderTextColor="#7B8794"
              maxLength={80}
              editable={!isAddingStop}
              returnKeyType="done"
              style={styles.stopNameInput}
              onSubmitEditing={isCrowdStop ? undefined : () => void handleAddStop()}
            />
            {isCrowdStop && (
              <>
                <TextInput
                  accessibilityLabel="Nombre de la ruta"
                  value={crowdRouteName}
                  onChangeText={setCrowdRouteName}
                  placeholder="Nombre de la ruta"
                  placeholderTextColor="#7B8794"
                  maxLength={120}
                  editable={!isAddingStop}
                  style={styles.stopNameInput}
                />
                <DropDown
                  label="Sentido de la ruta"
                  options={CROWD_ROUTE_DIRECTIONS}
                  onSelect={({ id }) => setCrowdDirection(id)}
                  inline
                  disabled={isAddingStop}
                />
                <DropDown
                  label="Tipo de bus"
                  options={CROWD_BUS_TYPES}
                  onSelect={({ id }) => setCrowdBusType(id)}
                  inline
                  disabled={isAddingStop}
                />
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                disabled={isAddingStop}
                onPress={closeStopNameModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSaveButton,
                  !canSaveStop && styles.addStopButtonDisabled,
                ]}
                disabled={!canSaveStop}
                accessibilityState={{ busy: isAddingStop, disabled: !canSaveStop }}
                onPress={() => void handleAddStop()}
              >
                {isAddingStop ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar parada</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  addStopButton: {
    position: "absolute",
    top: 192,
    right: 16,
    zIndex: 5,
    elevation: 5,
    minHeight: 44,
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addStopButtonDisabled: {
    opacity: 0.7,
  },
  addStopButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
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
    flexGrow: 0,
    flexShrink: 1,
    borderRadius: theme.size_rounded.lg,
    backgroundColor: theme.surface.background,
  },
  modalContent: {
    gap: 12,
    padding: 20,
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
  stopNameInput: {
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
    minHeight: 44,
    minWidth: 145,
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
