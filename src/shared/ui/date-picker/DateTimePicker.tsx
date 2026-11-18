import { HOURS_12 } from "../time-picker/time";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./datePickerStyles";

const MINUTE_STEPS = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

export type TimePickerProps = {
  selectedDate: Date;
  onSelectTime: (hours: number, minutes: number) => void;
  is24Hour?: boolean;
};

export function TimePicker({
  selectedDate,
  onSelectTime,
  is24Hour = false,
}: TimePickerProps) {
  const currentHours = selectedDate.getHours();
  const currentMinutes = selectedDate.getMinutes();

  const [timeSubView, setTimeSubView] = useState<"hours" | "minutes">("hours");
  const [period, setPeriod] = useState<"AM" | "PM">(
    currentHours >= 12 ? "PM" : "AM",
  );

  // Format 12-hour values
  const display12Hour = currentHours % 12 === 0 ? 12 : currentHours % 12;
  const displayMinutes =
    currentMinutes < 10 ? `0${currentMinutes}` : `${currentMinutes}`;

  const handleHourClick = (hour: number) => {
    let resolvedHours = hour;
    if (!is24Hour) {
      if (period === "PM" && hour < 12) resolvedHours = hour + 12;
      if (period === "AM" && hour === 12) resolvedHours = 0;
    }
    onSelectTime(resolvedHours, currentMinutes);
    setTimeSubView("minutes");
  };

  const handleMinuteClick = (minute: number) => {
    onSelectTime(currentHours, minute);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    let resolvedHours = currentHours;
    if (newPeriod === "PM" && currentHours < 12) {
      resolvedHours = currentHours + 12;
    } else if (newPeriod === "AM" && currentHours >= 12) {
      resolvedHours = currentHours - 12;
    }
    onSelectTime(resolvedHours, currentMinutes);
  };

  return (
    <View style={styles.timeContainer}>
      {/* Time Display Header Switcher */}
      <View style={styles.timeHeaderRow}>
        <View style={styles.timeSegmentsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTimeSubView("hours")}
            style={[
              styles.timeSegmentButton,
              timeSubView === "hours" && styles.timeSegmentActive,
            ]}
          >
            <Text
              style={[
                styles.timeSegmentText,
                timeSubView === "hours" && styles.timeSegmentTextActive,
              ]}
            >
              {is24Hour
                ? currentHours < 10
                  ? `0${currentHours}`
                  : `${currentHours}`
                : display12Hour}
            </Text>
          </Pressable>

          <Text style={styles.timeColon}>:</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setTimeSubView("minutes")}
            style={[
              styles.timeSegmentButton,
              timeSubView === "minutes" && styles.timeSegmentActive,
            ]}
          >
            <Text
              style={[
                styles.timeSegmentText,
                timeSubView === "minutes" && styles.timeSegmentTextActive,
              ]}
            >
              {displayMinutes}
            </Text>
          </Pressable>
        </View>

        {!is24Hour && (
          <View style={styles.ampmSwitchContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => handlePeriodChange("AM")}
              style={[
                styles.ampmButton,
                period === "AM" && styles.ampmButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  period === "AM" && styles.ampmTextActive,
                ]}
              >
                AM
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handlePeriodChange("PM")}
              style={[
                styles.ampmButton,
                period === "PM" && styles.ampmButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.ampmText,
                  period === "PM" && styles.ampmTextActive,
                ]}
              >
                PM
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Grid: HOURS */}
      {timeSubView === "hours" && (
        <View style={styles.grid}>
          {HOURS_12.map((hour) => {
            const isSelected = display12Hour === hour;
            return (
              <Pressable
                key={`h-${hour}`}
                accessibilityRole="button"
                accessibilityLabel={`${hour} hours`}
                onPress={() => handleHourClick(hour)}
                style={({ pressed }) => [
                  styles.gridCell,
                  isSelected && styles.cellSelected,
                  !isSelected && pressed && styles.cellPressed,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    isSelected && styles.cellTextSelected,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {hour}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Grid: MINUTES */}
      {timeSubView === "minutes" && (
        <View style={styles.grid}>
          {MINUTE_STEPS.map((minStr) => {
            const minNum = parseInt(minStr, 10);
            const isSelected =
              Math.floor(currentMinutes / 5) * 5 === minNum ||
              currentMinutes === minNum;
            return (
              <Pressable
                key={`m-${minStr}`}
                accessibilityRole="button"
                accessibilityLabel={`${minStr} minutes`}
                onPress={() => handleMinuteClick(minNum)}
                style={({ pressed }) => [
                  styles.gridCell,
                  isSelected && styles.cellSelected,
                  !isSelected && pressed && styles.cellPressed,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    isSelected && styles.cellTextSelected,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {minStr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
