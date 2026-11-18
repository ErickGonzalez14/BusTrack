import { Calendar, Clock } from "iconoir-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { YEARS_PER_PAGE, YearPicker, MonthPicker, DayPicker } from "./CalendarPickers";
import { TimePicker } from "./DateTimePicker";
import { DatePickerCard } from "./DatePickerCard";
import {
  type DatePickerType,
  type DatePickerView,
  type DatePickerLocale,
  MONTH_NAMES,
} from "./calendar";
import { styles } from "./datePickerStyles";
import { formatPickerValue } from "./formatPickerValue";

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

const POPOVER_MARGIN = 16;

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

    return formatPickerValue(selectedDate, type, locale, is24Hour);
  }, [value, placeholder, format, selectedDate, type, locale, is24Hour]);

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

DatePickerLabel.Card = DatePickerCard;

DatePickerLabel.Year = YearPicker;

DatePickerLabel.Month = MonthPicker;

DatePickerLabel.Day = DayPicker;

DatePickerLabel.Time = TimePicker;

export { YearPicker, MonthPicker, DayPicker } from "./CalendarPickers";
export { TimePicker } from "./DateTimePicker";
export { DatePickerCard } from "./DatePickerCard";
export { MONTH_NAMES } from "./calendar";
export { styles } from "./datePickerStyles";
export type { DatePickerType, DatePickerView, DatePickerLocale } from "./calendar";
export type { YearPickerProps, MonthPickerProps, DayPickerProps } from "./CalendarPickers";
export type { TimePickerProps } from "./DateTimePicker";
export type { DatePickerCardProps } from "./DatePickerCard";
