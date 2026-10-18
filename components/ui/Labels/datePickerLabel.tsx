import {
  Calendar,
  Clock,
  NavArrowLeft,
  NavArrowRight,
} from "iconoir-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type DatePickerType =
  | "month"
  | "day"
  | "year"
  | "time"
  | "datetime"
  | "month-year"
  | "combined"
  | "all";

export type DatePickerView = "year" | "month" | "day" | "time";
export type DatePickerLocale = "en" | "es";

export type DatePickerLabelProps = {
  type?: DatePickerType;
  /** Explicit list of views to allow custom combination (e.g. ['year', 'month'] or ['day', 'time']) */
  views?: DatePickerView[];
  value?: Date | string | number | null;
  onChange?: (date: Date, formattedValue: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  inline?: boolean;
  locale?: DatePickerLocale;
  is24Hour?: boolean;
  format?: (date: Date, type: DatePickerType) => string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const MONTH_NAMES = {
  en: {
    short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    full: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],

    tabs: {
      date: "Date",
      time: "Time",
      year: "Year",
      month: "Month",
    },
  },
  es: {
    short: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    full: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    days: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
    defaultLabels: {
      month: "Seleccionar mes",
      year: "Seleccionar año",
      day: "Seleccionar día",
      time: "Seleccionar hora",
      datetime: "Seleccionar fecha y hora",
      "month-year": "Seleccionar mes y año",
      combined: "Seleccionar fecha",
      all: "Seleccionar fecha",
    },
    tabs: {
      date: "Fecha",
      time: "Hora",
      year: "Año",
      month: "Mes",
    },
  },
};

const POPOVER_MARGIN = 16;
const YEARS_PER_PAGE = 12;
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
const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const HOURS_24_FIRST_HALF = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HOURS_24_SECOND_HALF = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

// ============================================================================
// 1. STANDALONE REUSABLE COMPONENT: YearPicker
// ============================================================================
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

// ============================================================================
// 2. STANDALONE REUSABLE COMPONENT: MonthPicker
// ============================================================================
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

// ============================================================================
// 3. STANDALONE REUSABLE COMPONENT: DayPicker
// ============================================================================
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

// ============================================================================
// 4. STANDALONE REUSABLE COMPONENT: TimePicker
// ============================================================================
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

// ============================================================================
// 5. STANDALONE REUSABLE COMPONENT: DatePickerCard (Container + Header)
// ============================================================================
export type DatePickerCardProps = {
  headerTitle?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canNavigateHeader?: boolean;
  onHeaderTitlePress?: () => void;
  inline?: boolean;
  children: React.ReactNode;
};

export function DatePickerCard({
  headerTitle,
  onPrev,
  onNext,
  canNavigateHeader = false,
  onHeaderTitlePress,
  inline = false,
  children,
}: DatePickerCardProps) {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.card, inline && styles.cardInline]}>
      {headerTitle ? (
        <View style={styles.header}>
          {onPrev ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous"
              onPress={onPrev}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <NavArrowLeft
                width={18}
                height={18}
                color={theme.text.Body}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}

          <Pressable
            disabled={!canNavigateHeader}
            onPress={onHeaderTitlePress}
            style={({ pressed }) => [
              styles.headerTitleContainer,
              canNavigateHeader && pressed && styles.headerTitlePressed,
            ]}
          >
            <Text
              style={[
                styles.headerTitleText,
                canNavigateHeader && styles.headerTitleInteractive,
              ]}
            >
              {headerTitle}
            </Text>
          </Pressable>

          {onNext ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next"
              onPress={onNext}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <NavArrowRight
                width={18}
                height={18}
                color={theme.text.Body}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>
      ) : null}

      {children}
    </View>
  );
}

// ============================================================================
// 6. MAIN ALL-IN-ONE COMPONENT: DatePickerLabel
// ============================================================================
export default function DatePickerLabel({
  type = "month",
  views,
  value,
  onChange,
  label,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  inline = false,
  locale = "en",
  is24Hour = false,
  format,
  containerStyle,
}: DatePickerLabelProps) {
  const { theme } = useUnistyles();
  const triggerRef = useRef<View>(null);

  // Parse initial date
  const parsedValue = useMemo(() => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [selectedDate, setSelectedDate] = useState<Date>(parsedValue);
  const [viewDate, setViewDate] = useState<Date>(parsedValue);
  const [isOpen, setIsOpen] = useState(inline);

  // Determine allowed views
  const allowedViews: DatePickerView[] = useMemo(() => {
    if (views && views.length > 0) return views;
    switch (type) {
      case "year":
        return ["year"];
      case "month":
        return ["month", "year"];
      case "day":
        return ["day"];
      case "time":
        return ["time"];
      case "month-year":
        return ["month", "year"];
      case "datetime":
        return ["day", "month", "year", "time"];
      case "combined":
      case "all":
      default:
        return ["day", "month", "year"];
    }
  }, [views, type]);

  // Initial view stage
  const initialViewMode: DatePickerView = useMemo(() => {
    if (allowedViews.includes("time") && allowedViews.length === 1)
      return "time";
    if (allowedViews.includes("day")) return "day";
    if (allowedViews.includes("month")) return "month";
    if (allowedViews.includes("year")) return "year";
    return allowedViews[0] || "month";
  }, [allowedViews]);

  const [activeView, setActiveView] = useState<DatePickerView>(initialViewMode);
  // Multi-mode top tab (e.g. for datetime: Date | Time)
  const [tabSelection, setTabSelection] = useState<"date" | "time">(
    type === "time" ? "time" : "date",
  );

  useEffect(() => {
    setSelectedDate(parsedValue);
    setViewDate(parsedValue);
  }, [parsedValue]);

  useEffect(() => {
    setActiveView(initialViewMode);
    setTabSelection(type === "time" ? "time" : "date");
  }, [initialViewMode, type]);

  // Dropdown modal position
  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: POPOVER_MARGIN,
    width: 320,
  });

  const openPicker = () => {
    if (disabled || inline) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get("window").width;
      const windowHeight = Dimensions.get("window").height;
      const targetWidth = Math.min(
        Math.max(340, width),
        windowWidth - POPOVER_MARGIN * 2,
      );

      let top = y + height + 8;
      if (top + 380 > windowHeight) {
        top = Math.max(POPOVER_MARGIN, y - 390);
      }

      const left = Math.min(
        Math.max(POPOVER_MARGIN, x),
        windowWidth - targetWidth - POPOVER_MARGIN,
      );

      setPopoverPosition({ top, left, width: targetWidth });
      setViewDate(selectedDate);
      setActiveView(initialViewMode);
      setTabSelection(type === "time" ? "time" : "date");
      setIsOpen(true);
    });
  };

  const closePicker = () => {
    if (!inline) setIsOpen(false);
  };

  const localized = MONTH_NAMES[locale] || MONTH_NAMES.en;

  // Format string for trigger
  const formattedDisplayValue = useMemo(() => {
    if (!value && placeholder) return placeholder;
    if (format) return format(selectedDate, type);

    const year = selectedDate.getFullYear();
    const monthName = localized.full[selectedDate.getMonth()];
    const day = selectedDate.getDate();

    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    let timeStr = "";
    if (is24Hour) {
      const hrStr = hours < 10 ? `0${hours}` : `${hours}`;
      timeStr = `${hrStr}:${minStr}`;
    } else {
      const period = hours >= 12 ? "PM" : "AM";
      const hr12 = hours % 12 === 0 ? 12 : hours % 12;
      timeStr = `${hr12}:${minStr} ${period}`;
    }

    switch (type) {
      case "year":
        return `${year}`;
      case "month":
      case "month-year":
        return `${year}, ${monthName}`;
      case "day":
        return `${day}, ${monthName}`;
      case "time":
        return timeStr;
      case "datetime":
        return `${monthName} ${day}, ${year} • ${timeStr}`;
      case "combined":
      case "all":
      default:
        return `${monthName} ${day}, ${year}`;
    }
  }, [value, placeholder, format, selectedDate, type, localized, is24Hour]);

  // 12-Year window calculation
  const currentViewYear = viewDate.getFullYear();
  const yearWindowStart = currentViewYear - (currentViewYear % YEARS_PER_PAGE);
  const yearWindowEnd = yearWindowStart + YEARS_PER_PAGE - 1;

  const yearsArray = useMemo(() => {
    const years: number[] = [];
    for (let y = yearWindowStart; y <= yearWindowEnd; y++) {
      years.push(y);
    }
    return years;
  }, [yearWindowStart, yearWindowEnd]);

  // Calendar calculations
  const currentViewMonth = viewDate.getMonth();
  const daysInMonth = new Date(
    currentViewYear,
    currentViewMonth + 1,
    0,
  ).getDate();
  const firstDayOfMonth =
    (new Date(currentViewYear, currentViewMonth, 1).getDay() + 6) % 7;

  // Nav chevrons
  const handlePrev = () => {
    if (activeView === "year") {
      setViewDate(
        new Date(currentViewYear - YEARS_PER_PAGE, currentViewMonth, 1),
      );
    } else if (activeView === "month") {
      setViewDate(new Date(currentViewYear - 1, currentViewMonth, 1));
    } else if (activeView === "day") {
      setViewDate(new Date(currentViewYear, currentViewMonth - 1, 1));
    }
  };

  const handleNext = () => {
    if (activeView === "year") {
      setViewDate(
        new Date(currentViewYear + YEARS_PER_PAGE, currentViewMonth, 1),
      );
    } else if (activeView === "month") {
      setViewDate(new Date(currentViewYear + 1, currentViewMonth, 1));
    } else if (activeView === "day") {
      setViewDate(new Date(currentViewYear, currentViewMonth + 1, 1));
    }
  };

  // Header Title
  const headerTitle = useMemo(() => {
    if (activeView === "time") return localized.tabs.time;
    if (activeView === "year") return `${yearWindowStart}-${yearWindowEnd}`;
    if (activeView === "month") return `${currentViewYear}`;
    return `${localized.full[currentViewMonth]} ${currentViewYear}`;
  }, [
    activeView,
    yearWindowStart,
    yearWindowEnd,
    currentViewYear,
    currentViewMonth,
    localized,
  ]);

  const canNavigateHeader = useMemo(() => {
    if (activeView === "time") return false;
    if (activeView === "day" && allowedViews.includes("month")) return true;
    if (activeView === "month" && allowedViews.includes("year")) return true;
    return false;
  }, [activeView, allowedViews]);

  const handleHeaderTitlePress = () => {
    if (!canNavigateHeader) return;
    if (activeView === "day") {
      setActiveView("month");
    } else if (activeView === "month") {
      setActiveView("year");
    }
  };

  // Selection handlers
  const handleSelectYear = (year: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setFullYear(year);
    setSelectedDate(nextDate);
    setViewDate(nextDate);

    if (
      type === "year" ||
      (allowedViews.length === 1 && allowedViews[0] === "year")
    ) {
      onChange?.(nextDate, `${year}`);
      closePicker();
    } else if (allowedViews.includes("month")) {
      setActiveView("month");
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setFullYear(currentViewYear);
    nextDate.setMonth(monthIndex);
    setSelectedDate(nextDate);
    setViewDate(nextDate);

    if (type === "month" || type === "month-year") {
      const formatted = `${currentViewYear}, ${localized.full[monthIndex]}`;
      onChange?.(nextDate, formatted);
      closePicker();
    } else if (allowedViews.includes("day")) {
      setActiveView("day");
    }
  };

  const handleSelectDay = (day: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setFullYear(currentViewYear);
    nextDate.setMonth(currentViewMonth);
    nextDate.setDate(day);
    setSelectedDate(nextDate);
    setViewDate(nextDate);

    if (
      allowedViews.includes("time") &&
      (type === "datetime" || tabSelection === "date")
    ) {
      // Step to time
      setTabSelection("time");
      setActiveView("time");
    } else {
      const formatted = `${localized.full[currentViewMonth]} ${day}, ${currentViewYear}`;
      onChange?.(nextDate, formatted);
      closePicker();
    }
  };

  const handleSelectTime = (hours: number, minutes: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setHours(hours);
    nextDate.setMinutes(minutes);
    setSelectedDate(nextDate);

    const formatted = formattedDisplayValue;
    onChange?.(nextDate, formatted);
  };

  const hasDateTimeToggle =
    allowedViews.includes("time") &&
    (allowedViews.includes("day") || allowedViews.includes("month"));

  const renderContent = () => {
    return (
      <DatePickerCard
        headerTitle={activeView !== "time" ? headerTitle : undefined}
        onPrev={activeView !== "time" ? handlePrev : undefined}
        onNext={activeView !== "time" ? handleNext : undefined}
        canNavigateHeader={canNavigateHeader}
        onHeaderTitlePress={handleHeaderTitlePress}
        inline={inline}
      >
        {/* If component supports Date + Time, render a sleek segmented toggle tab */}
        {hasDateTimeToggle && (
          <View style={styles.topSegmentedContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setTabSelection("date");
                setActiveView("day");
              }}
              style={[
                styles.topSegmentedItem,
                tabSelection === "date" && styles.topSegmentedItemActive,
              ]}
            >
              <Text
                style={[
                  styles.topSegmentedText,
                  tabSelection === "date" && styles.topSegmentedTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {localized.tabs.date}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setTabSelection("time");
                setActiveView("time");
              }}
              style={[
                styles.topSegmentedItem,
                tabSelection === "time" && styles.topSegmentedItemActive,
              ]}
            >
              <Text
                style={[
                  styles.topSegmentedText,
                  tabSelection === "time" && styles.topSegmentedTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {localized.tabs.time}
              </Text>
            </Pressable>
          </View>
        )}

        {/* YEAR VIEW */}
        {activeView === "year" && (
          <YearPicker
            years={yearsArray}
            selectedYear={selectedDate.getFullYear()}
            onSelectYear={handleSelectYear}
          />
        )}

        {/* MONTH VIEW */}
        {activeView === "month" && (
          <MonthPicker
            months={localized.short}
            selectedMonth={selectedDate.getMonth()}
            selectedYear={selectedDate.getFullYear()}
            currentViewYear={currentViewYear}
            onSelectMonth={handleSelectMonth}
          />
        )}

        {/* DAY VIEW */}
        {activeView === "day" && (
          <DayPicker
            daysOfWeek={localized.days}
            daysInMonth={daysInMonth}
            firstDayOfMonth={firstDayOfMonth}
            selectedDate={selectedDate}
            currentViewMonth={currentViewMonth}
            currentViewYear={currentViewYear}
            onSelectDay={handleSelectDay}
          />
        )}

        {/* TIME VIEW */}
        {activeView === "time" && (
          <TimePicker
            selectedDate={selectedDate}
            onSelectTime={handleSelectTime}
            is24Hour={is24Hour}
          />
        )}
      </DatePickerCard>
    );
  };

  if (inline) {
    return <View style={[styles.root, containerStyle]}>{renderContent()}</View>;
  }

  return (
    <View style={[styles.root, containerStyle]}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.triggerContainer,
            pressed && styles.triggerPressed,
            disabled && styles.triggerDisabled,
          ]}
        >
          <Text
            style={styles.triggerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formattedDisplayValue}
          </Text>
          {type === "time" ? (
            <Clock
              width={22}
              height={22}
              color={theme.text.placeHolderLight}
              strokeWidth={1.8}
            />
          ) : (
            <Calendar
              width={22}
              height={22}
              color={theme.text.placeHolderLight}
              strokeWidth={1.8}
            />
          )}
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        statusBarTranslucent
        transparent
        visible={isOpen}
      >
        <Pressable style={styles.modalBackdrop} onPress={closePicker}>
          <View
            aria-modal={true}
            style={[
              styles.popoverWrapper,
              {
                top: popoverPosition.top,
                left: popoverPosition.left,
                width: popoverPosition.width,
              },
            ]}
          >
            {renderContent()}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Compound component pattern export
DatePickerLabel.Card = DatePickerCard;
DatePickerLabel.Year = YearPicker;
DatePickerLabel.Month = MonthPicker;
DatePickerLabel.Day = DayPicker;
DatePickerLabel.Time = TimePicker;

export const styles = StyleSheet.create((theme) => ({
  root: {
    width: "100%",
  },
  label: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Primary,
    marginBottom: 8,
  },
  triggerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface.inputs,
    borderRadius: theme.size_rounded.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    maxWidth: "75%",
    flexShrink: 1,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  popoverWrapper: {
    position: "absolute",
  },
  card: {
    width: "100%",
    backgroundColor: theme.surface.inputs,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#EBECEF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardInline: {
    shadowOpacity: 0.02,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEEF2",
    backgroundColor: theme.surface.background,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonPressed: {
    backgroundColor: theme.surface.neutral,
  },
  headerTitleContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerTitlePressed: {
    backgroundColor: theme.surface.neutral,
  },
  headerTitleText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Primary,
    textAlign: "center",
  },
  headerTitleInteractive: {
    textDecorationLine: "underline",
    textDecorationColor: theme.text.placeHolderLight,
  },
  // Top Segmented Switch (Date | Time)
  topSegmentedContainer: {
    flexDirection: "row",
    backgroundColor: theme.surface.neutral,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  topSegmentedItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  topSegmentedItemActive: {
    backgroundColor: theme.surface.background,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topSegmentedText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.placeHolderLight,
  },
  topSegmentedTextActive: {
    fontFamily: theme.fonts.heavy,
    color: theme.text.Primary,
  },
  // Grids
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  gridCell: {
    width: "31%",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    backgroundColor: "#0F1115",
  },
  cellPressed: {
    backgroundColor: "#F1F3F5",
  },
  cellText: {
    width: "85%",
    flexShrink: 1,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.text.Body,
  },
  cellTextSelected: {
    fontFamily: theme.fonts.heavy,
    color: "#FFFFFF",
  },
  cellTextToday: {
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
  },
  // Day View
  dayViewContainer: {
    width: "100%",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDayCell: {
    width: "14.28%",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
    color: theme.text.placeHolderLight,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellContainer: {
    width: "14.28%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellSelected: {
    backgroundColor: "#0F1115",
  },
  dayCellText: {
    maxWidth: "100%",
    flexShrink: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.Body,
  },
  // Time View
  timeContainer: {
    width: "100%",
  },
  timeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timeSegmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeSegmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.surface.neutral,
  },
  timeSegmentActive: {
    backgroundColor: "#0F1115",
  },
  timeSegmentText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    color: theme.text.Body,
  },
  timeSegmentTextActive: {
    color: "#FFFFFF",
  },
  timeColon: {
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
    color: theme.text.Primary,
  },
  ampmSwitchContainer: {
    flexDirection: "row",
    backgroundColor: theme.surface.neutral,
    borderRadius: 8,
    padding: 2,
  },
  ampmButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ampmButtonActive: {
    backgroundColor: "#0F1115",
  },
  ampmText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 13,
    color: theme.text.placeHolderLight,
  },
  ampmTextActive: {
    color: "#FFFFFF",
  },
}));
