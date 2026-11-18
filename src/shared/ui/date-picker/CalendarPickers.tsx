import { Pressable, Text, View } from "react-native";
import { styles } from "./datePickerStyles";

export const YEARS_PER_PAGE = 12;

export type YearPickerProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export function YearPicker({
  years,
  selectedYear,
  onSelectYear,
}: YearPickerProps) {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.grid}>
      {years.map((year) => {
        const isSelected = selectedYear === year;
        const isCurrentYear = currentYear === year;

        return (
          <Pressable
            key={year}
            accessibilityRole="button"
            accessibilityLabel={`${year}`}
            onPress={() => onSelectYear(year)}
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
                !isSelected && isCurrentYear && styles.cellTextToday,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {year}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type MonthPickerProps = {
  months: string[];
  selectedMonth: number;
  selectedYear: number;
  currentViewYear: number;
  onSelectMonth: (monthIndex: number) => void;
};

export function MonthPicker({
  months,
  selectedMonth,
  selectedYear,
  currentViewYear,
  onSelectMonth,
}: MonthPickerProps) {
  const now = new Date();
  const isThisYear = now.getFullYear() === currentViewYear;
  const currentMonthIdx = now.getMonth();

  return (
    <View style={styles.grid}>
      {months.map((monthName, index) => {
        const isSelected =
          selectedMonth === index && selectedYear === currentViewYear;
        const isCurrentMonth = isThisYear && currentMonthIdx === index;

        return (
          <Pressable
            key={monthName}
            accessibilityRole="button"
            accessibilityLabel={monthName}
            onPress={() => onSelectMonth(index)}
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
                !isSelected && isCurrentMonth && styles.cellTextToday,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {monthName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type DayPickerProps = {
  daysOfWeek: string[];
  daysInMonth: number;
  firstDayOfMonth: number;
  selectedDate: Date;
  currentViewMonth: number;
  currentViewYear: number;
  onSelectDay: (day: number) => void;
};

export function DayPicker({
  daysOfWeek,
  daysInMonth,
  firstDayOfMonth,
  selectedDate,
  currentViewMonth,
  currentViewYear,
  onSelectDay,
}: DayPickerProps) {
  const now = new Date();
  const isThisMonth =
    now.getMonth() === currentViewMonth &&
    now.getFullYear() === currentViewYear;
  const todayDate = now.getDate();

  return (
    <View style={styles.dayViewContainer}>
      {/* Weekday headers */}
      <View style={styles.weekDaysRow}>
        {daysOfWeek.map((dayName) => (
          <View key={dayName} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCellContainer} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected =
            selectedDate.getDate() === dayNum &&
            selectedDate.getMonth() === currentViewMonth &&
            selectedDate.getFullYear() === currentViewYear;

          const isToday = isThisMonth && todayDate === dayNum;

          return (
            <View key={`day-${dayNum}`} style={styles.dayCellContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${dayNum}`}
                onPress={() => onSelectDay(dayNum)}
                style={({ pressed }) => [
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  !isSelected && pressed && styles.cellPressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    isSelected && styles.cellTextSelected,
                    !isSelected && isToday && styles.cellTextToday,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {dayNum}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
