import { Clock, NavArrowRight } from "iconoir-react-native";
import {
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { TimeSelectionModal } from "./TimeSelectionModal";
import { useTimeSelection } from "./useTimeSelection";

import type { TimeValue } from "./time";

export type { TimeValue } from "./time";

export type TimePickerCardProps = {
  value?: string;
  initialTime?: string;
  is24Hour?: boolean;
  onChange?: (timeString: string, details: TimeValue) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function TimePickerCard({
  value,
  initialTime = "07:30",
  is24Hour = false,
  onChange,
  style,
  disabled = false,
}: TimePickerCardProps) {
  const { theme } = useUnistyles();

  const selection = useTimeSelection({ value, initialTime, is24Hour, onChange, disabled });
  const currentDisplay = value || selection.displayTime;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={selection.openModal}
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

      <TimeSelectionModal selection={selection} is24Hour={is24Hour} />
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
}));
