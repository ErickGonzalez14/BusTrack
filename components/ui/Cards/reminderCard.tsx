import { Check, Clock, NavArrowRight } from "iconoir-react-native";
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

export type AlertOptionValue = "5min" | "10min" | "30min" | "40min" | "1h" | string;

export type AlertOption = {
  id: AlertOptionValue;
  label: string;
  description: string;
};

export const DEFAULT_ALERT_OPTIONS: AlertOption[] = [
  { id: "5min", label: "5 min", description: "5 minutos antes" },
  { id: "10min", label: "10 min", description: "10 minutos antes" },
  { id: "30min", label: "30 min", description: "30 minutos antes" },
  { id: "40min", label: "40 min", description: "40 minutos antes" },
  { id: "1h", label: "1 hora", description: "1 hora antes" },
];

export type ReminderCardProps = {
  title?: string;
  value?: AlertOptionValue;
  initialValue?: AlertOptionValue;
  options?: AlertOption[];
  onChange?: (value: AlertOptionValue, option: AlertOption) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function ReminderCard({
  title = "Recordatorio previo",
  value,
  initialValue = "5min",
  options = DEFAULT_ALERT_OPTIONS,
  onChange,
  style,
  disabled = false,
}: ReminderCardProps) {
  const { theme } = useUnistyles();

  const [selectedAlertId, setSelectedAlertId] = useState<AlertOptionValue>(
    value || initialValue,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState<AlertOptionValue>(
    value || initialValue,
  );

  const currentActiveId = value !== undefined ? value : selectedAlertId;
  const currentOption =
    options.find((opt) => opt.id === currentActiveId) || options[0];

  const openModal = () => {
    if (disabled) return;
    setTempSelectedId(currentActiveId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSelectOption = (optId: AlertOptionValue) => {
    setTempSelectedId(optId);
  };

  const handleConfirm = () => {
    setSelectedAlertId(tempSelectedId);
    const chosen =
      options.find((opt) => opt.id === tempSelectedId) || options[0];
    onChange?.(tempSelectedId, chosen);
    setModalVisible(false);
  };

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

          {/* Textos del recordatorio previo */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {currentOption?.description || "Seleccionar alerta"}
            </Text>
          </View>
        </View>

        {/* Flecha derecha */}
        <NavArrowRight
          width={22}
          height={22}
          color={theme.text.placeHolderLight}
          strokeWidth={1.8}
        />
      </Pressable>

      {/* Modal para seleccionar los tipos de alertas */}
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
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>
              Selecciona con cuánta anticipación deseas recibir la alerta
            </Text>

            {/* Lista de las 5 opciones de alertas */}
            <View style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = tempSelectedId === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleSelectOption(option.id)}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.badge,
                          isSelected && styles.badgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isSelected && styles.badgeTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionDescription,
                          isSelected && styles.optionDescriptionSelected,
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>

                    {/* Indicador de selección */}
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check
                          width={14}
                          height={14}
                          color="#FFFFFF"
                          strokeWidth={2.5}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

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

export { ReminderCard as reminderCard };

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
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1B2CC1",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
    marginBottom: 2,
  },
  subtitleText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.text.placeholder,
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
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.text.placeholder,
    textAlign: "center",
    marginBottom: 18,
  },
  optionsList: {
    gap: 8,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.surface.neutral,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionItemSelected: {
    backgroundColor: "#EFF3FE",
    borderColor: "#1B2CC1",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.surface.background,
  },
  badgeSelected: {
    backgroundColor: "#1B2CC1",
  },
  badgeText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
    color: theme.text.Body,
  },
  badgeTextSelected: {
    color: "#FFFFFF",
  },
  optionDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.Body,
  },
  optionDescriptionSelected: {
    fontFamily: theme.fonts.heavy,
    color: "#1B2CC1",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.text.placeHolderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#1B2CC1",
    backgroundColor: "#1B2CC1",
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
