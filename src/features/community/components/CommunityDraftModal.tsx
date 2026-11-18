import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import PlacePickerInput from "@/src/features/transit-map/components/placePickerInput";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import InputText from "@/src/shared/ui/inputText";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { useCommunityDraft } from "../hooks/useCommunityDraft";

type CommunityDraftModalProps = {
  form: ReturnType<typeof useCommunityDraft>;
  availableStops: Stop[];
  saving: boolean;
};

export function CommunityDraftModal({ form, availableStops, saving }: CommunityDraftModalProps) {
  const {
    draftKind, draftSession, draft, setDraft, closeDraft, originPlace, setOriginPlace,
    destinationPlace, setDestinationPlace, tripEstimate, estimating, estimateError,
    selectedStops, toggleStop, saveDraft,
  } = form;

  return (
    <Modal
      visible={draftKind !== null}
      animationType="slide"
      onRequestClose={closeDraft}
    >
      <AlternativeHeader
        SettingName={draftKind === "trip" ? "Crear Trip" : "Crear Ruta"}
        onTouch={closeDraft}
      />
      <SafeAreaView style={styles.modalScreen}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.sectionHeader}></View>
          <Text style={styles.body}>
            Revisa los datos antes de publicarlos.
          </Text>
          <Text style={styles.label}>Título</Text>
          <InputText
            placeholder="ej. Ruta de la costa"
            value={draft.title}
            onChangeText={(title) => setDraft((old) => ({ ...old, title }))}
          />
          <Text style={styles.label}>Descripción Opcional</Text>
          <InputText
            placeholder="ej. Visitar Vistas Hermosas"
            value={draft.description}
            onChangeText={(description) =>
              setDraft((old) => ({ ...old, description }))
            }
          />

          {draftKind === "route" ? (
            <>
              <Text style={styles.label}>Distrito</Text>
              <InputText
                placeholder="ej. Bugaba"
                value={draft.city}
                onChangeText={(city) => setDraft((old) => ({ ...old, city }))}
              />

              <Text style={styles.label}>Sentido</Text>
              <View style={styles.choiceRow}>
                {(["outbound", "return"] as const).map((direction) => (
                  <Pressable
                    key={direction}
                    style={[
                      styles.choice,
                      draft.direction === direction && styles.selectedChoice,
                    ]}
                    onPress={() => setDraft((old) => ({ ...old, direction }))}
                  >
                    <Text>
                      {direction === "outbound" ? "Ida" : "Regreso"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>
                Paradas en orden ({selectedStops.length}/20)
              </Text>
              <Text style={styles.body}>
                Toca al menos dos paradas. El número indica el orden del
                recorrido.
              </Text>
              {availableStops.map((stop) => {
                const index = selectedStops.indexOf(stop.id);
                return (
                  <Pressable
                    key={stop.id}
                    style={[styles.stop, index >= 0 && styles.selectedChoice]}
                    onPress={() => toggleStop(stop.id)}
                  >
                    <Text style={styles.body}>
                      {index >= 0 ? `${index + 1}. ` : ""}
                      {stop.name} · {stop.city}
                    </Text>
                  </Pressable>
                );
              })}
              {!availableStops.length && (
                <Text style={styles.body}>No hay paradas disponibles.</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>Origen General</Text>
              <PlacePickerInput
                key={`origin-${draftSession}`}
                placeholder="Busca el origen"
                value={originPlace}
                onChange={setOriginPlace}
              />
              <Text style={styles.label}>Destino</Text>
              <PlacePickerInput
                key={`destination-${draftSession}`}
                placeholder="Busca el destino"
                value={destinationPlace}
                onChange={setDestinationPlace}
              />
              {estimating && <ActivityIndicator style={styles.estimate} />}
              {estimateError && <Text style={styles.error}>{estimateError}</Text>}
              {tripEstimate && (
                <Text style={styles.body}>
                  Distancia estimada: {tripEstimate.distanceKm} km · Duración estimada: {tripEstimate.durationMinutes} min en carro
                </Text>
              )}
            </>
          )}
          <Pressable
            style={[styles.button, (saving || (draftKind === "trip" && (!tripEstimate || estimating))) && styles.disabled]}
            disabled={saving || (draftKind === "trip" && (!tripEstimate || estimating))}
            onPress={() => void saveDraft()}
          >
            <Text style={styles.buttonText}>
              {saving ? "Enviando..." : "Publicar propuesta"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  body: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    marginBottom: 9,
  },
  error: { color: "#B42318", marginBottom: 12 },
  button: {
    backgroundColor: theme.surface.brand,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 18,
  },
  buttonText: { color: "#FFFFFF", fontFamily: theme.fonts.heavy, fontSize: 15 },
  disabled: { opacity: 0.5 },
  estimate: { marginTop: 18 },
  modalScreen: { flex: 1, backgroundColor: theme.surface.neutral },
  modalContent: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 15,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    marginTop: 18,
    marginBottom: 10,
  },
  choiceRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  choice: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.surface.background,
  },
  selectedChoice: { backgroundColor: "#DCE6FF" },
  stop: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.surface.background,
    marginBottom: 7,
  },
}));
