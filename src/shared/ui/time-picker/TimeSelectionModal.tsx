import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { HOURS_12, padZero } from "./time";
import type { useTimeSelection } from "./useTimeSelection";

const MINUTES_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

type TimeSelectionModalProps = {
  selection: ReturnType<typeof useTimeSelection>;
  is24Hour: boolean;
};

export function TimeSelectionModal({ selection, is24Hour }: TimeSelectionModalProps) {
  const {
    modalVisible, selectedHour, selectedMinute, selectedPeriod, activeTab, setSelectedHour,
    setSelectedMinute, setSelectedPeriod, setActiveTab, closeModal, handleConfirm,
  } = selection;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.backdropPressable} onPress={closeModal} />

        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Seleccionar hora</Text>

          {/* Display digital interactivo */}
          <View style={styles.timeDisplayRow}>
            <View style={styles.digitsContainer}>
              <Pressable
                onPress={() => setActiveTab("hours")}
                style={[
                  styles.digitButton,
                  activeTab === "hours" && styles.digitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.digitText,
                    activeTab === "hours" && styles.digitTextActive,
                  ]}
                >
                  {padZero(selectedHour)}
                </Text>
              </Pressable>

              <Text style={styles.colonText}>:</Text>

              <Pressable
                onPress={() => setActiveTab("minutes")}
                style={[
                  styles.digitButton,
                  activeTab === "minutes" && styles.digitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.digitText,
                    activeTab === "minutes" && styles.digitTextActive,
                  ]}
                >
                  {padZero(selectedMinute)}
                </Text>
              </Pressable>
            </View>

            {/* Selector AM / PM */}
            {!is24Hour && (
              <View style={styles.periodSwitch}>
                <Pressable
                  onPress={() => setSelectedPeriod("AM")}
                  style={[
                    styles.periodButton,
                    selectedPeriod === "AM" && styles.periodButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === "AM" && styles.periodTextActive,
                    ]}
                  >
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedPeriod("PM")}
                  style={[
                    styles.periodButton,
                    selectedPeriod === "PM" && styles.periodButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === "PM" && styles.periodTextActive,
                    ]}
                  >
                    PM
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Selector de pestañas: Horas | Minutos */}
          <View style={styles.segmentedTabs}>
            <Pressable
              onPress={() => setActiveTab("hours")}
              style={[
                styles.tabButton,
                activeTab === "hours" && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "hours" && styles.tabButtonTextActive,
                ]}
              >
                Horas
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("minutes")}
              style={[
                styles.tabButton,
                activeTab === "minutes" && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "minutes" && styles.tabButtonTextActive,
                ]}
              >
                Minutos
              </Text>
            </Pressable>
          </View>

          {activeTab === "hours" ? (
            <TimeGrid
              options={HOURS_12}
              selected={selectedHour}
              onSelect={(hour) => {
                setSelectedHour(hour);
                setActiveTab("minutes");
              }}
            />
          ) : (
            <TimeGrid options={MINUTES_STEPS} selected={selectedMinute} onSelect={setSelectedMinute} />
          )}

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={closeModal}
              style={[styles.actionBtn, styles.cancelBtn]}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={[styles.actionBtn, styles.confirmBtn]}
            >
              <Text style={styles.confirmBtnText}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TimeGrid({ options, selected, onSelect }: {
  options: number[];
  selected: number;
  onSelect: (option: number) => void;
}) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.gridCell,
              isSelected && styles.gridCellSelected,
            ]}
          >
            <Text
              style={[
                styles.gridCellText,
                isSelected && styles.gridCellTextSelected,
              ]}
            >
              {padZero(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.xl,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    color: theme.text.Body,
    textAlign: "center",
    marginBottom: 16,
  },
  timeDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  digitsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  digitButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.surface.neutral,
  },
  digitButtonActive: {
    backgroundColor: "#1B2CC1",
  },
  digitText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 28,
    color: theme.text.Body,
  },
  digitTextActive: {
    color: "#FFFFFF",
  },
  colonText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 26,
    color: theme.text.Body,
  },
  periodSwitch: {
    backgroundColor: theme.surface.neutral,
    borderRadius: 10,
    padding: 3,
    flexDirection: "column",
    gap: 2,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#1B2CC1",
  },
  periodText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
    color: theme.text.placeHolderLight,
  },
  periodTextActive: {
    color: "#FFFFFF",
  },
  segmentedTabs: {
    flexDirection: "row",
    backgroundColor: theme.surface.neutral,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: theme.surface.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.placeHolderLight,
  },
  tabButtonTextActive: {
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 20,
  },
  gridCell: {
    width: "23%",
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.surface.neutral,
    alignItems: "center",
    justifyContent: "center",
  },
  gridCellSelected: {
    backgroundColor: "#1B2CC1",
  },
  gridCellText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Body,
  },
  gridCellTextSelected: {
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.size_rounded.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: theme.surface.neutral,
  },
  cancelBtnText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
    color: theme.text.placeholder,
  },
  confirmBtn: {
    backgroundColor: "#1B2CC1",
  },
  confirmBtnText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
    color: "#FFFFFF",
  },
}));
