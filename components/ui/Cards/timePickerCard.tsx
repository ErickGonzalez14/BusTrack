import { Clock, NavArrowRight } from "iconoir-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type TimeValue = {
  hours: number;
  minutes: number;
  period: "AM" | "PM";
  formatted: string;
};

export type TimePickerCardProps = {
  value?: string;
  initialTime?: string;
  is24Hour?: boolean;
  onChange?: (timeString: string, details: TimeValue) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export default function TimePickerCard({
  value,
  initialTime = "07:30",
  is24Hour = false,
  onChange,
  style,
  disabled = false,
}: TimePickerCardProps) {
  const { theme } = useUnistyles();

  // Parse initial values
  const parseTimeString = (timeStr: string) => {
    const parts = timeStr.trim().split(":");
    let h = parseInt(parts[0] || "7", 10);
    const m = parseInt(parts[1] || "30", 10);
    let p: "AM" | "PM" = "AM";

    if (h >= 12) {
      p = "PM";
      if (!is24Hour && h > 12) h -= 12;
    } else if (h === 0) {
      if (!is24Hour) h = 12;
    }

    return {
      hours: isNaN(h) ? 7 : h,
      minutes: isNaN(m) ? 30 : m,
      period: p,
    };
  };

  const initialParsed = parseTimeString(value || initialTime);

  const [displayTime, setDisplayTime] = useState(value || initialTime);
  const [modalVisible, setModalVisible] = useState(false);

  // Estados temporales del modal mientras el usuario selecciona
  const [selectedHour, setSelectedHour] = useState(initialParsed.hours);
  const [selectedMinute, setSelectedMinute] = useState(initialParsed.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    initialParsed.period,
  );
  const [activeTab, setActiveTab] = useState<"hours" | "minutes">("hours");

  const openModal = () => {
    if (disabled) return;
    const current = parseTimeString(value || displayTime);
    setSelectedHour(current.hours);
    setSelectedMinute(current.minutes);
    setSelectedPeriod(current.period);
    setActiveTab("hours");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    const hour = is24Hour
      ? selectedHour
      : selectedHour % 12 + (selectedPeriod === "PM" ? 12 : 0);
    const formatted = `${padZero(hour)}:${padZero(selectedMinute)}`;
    setDisplayTime(formatted);
    onChange?.(formatted, {
      hours: selectedHour,
      minutes: selectedMinute,
      period: selectedPeriod,
      formatted,
    });
    setModalVisible(false);
  };

  const currentDisplay = value || displayTime;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openModal}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
          disabled && styles.cardDisabled,
          style,
        ]}
      >
        <View style={styles.leftContainer}>
          {/* Badge azul con icono de reloj */}
          <View style={styles.iconBadge}>
            <Clock
              width={22}
              height={22}
              color="#FFFFFF"
              strokeWidth={2.2}
            />
          </View>

          {/* Hora seleccionada destacada */}
          <Text style={styles.timeText}>{currentDisplay}</Text>
        </View>

        {/* Flecha derecha */}
        <NavArrowRight
          width={22}
          height={22}
          color={theme.text.placeHolderLight}
          strokeWidth={1.8}
        />
      </Pressable>

      {/* Modal para seleccionar la hora */}
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

            {/* Grid de Horas */}
            {activeTab === "hours" && (
              <View style={styles.grid}>
                {HOURS_12.map((hour) => {
                  const isSelected = selectedHour === hour;
                  return (
                    <Pressable
                      key={`hour-${hour}`}
                      onPress={() => {
                        setSelectedHour(hour);
                        setActiveTab("minutes");
                      }}
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
                        {padZero(hour)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Grid de Minutos */}
            {activeTab === "minutes" && (
              <View style={styles.grid}>
                {MINUTES_STEPS.map((minute) => {
                  const isSelected = selectedMinute === minute;
                  return (
                    <Pressable
                      key={`min-${minute}`}
                      onPress={() => setSelectedMinute(minute)}
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
                        {padZero(minute)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
    </>
  );
}

export { TimePickerCard as timePickerCard };

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    shadowColor: "#505F6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1B2CC1",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 26,
    color: theme.text.Body,
    letterSpacing: 0.5,
  },
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
