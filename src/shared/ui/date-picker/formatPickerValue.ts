import { padZero } from "../time-picker/time";
import { MONTH_NAMES, type DatePickerLocale, type DatePickerType } from "./calendar";

export function formatPickerValue(
  selectedDate: Date,
  type: DatePickerType,
  locale: DatePickerLocale,
  is24Hour: boolean,
) {
  const localized = MONTH_NAMES[locale] || MONTH_NAMES.en;
  const year = selectedDate.getFullYear();
  const monthName = localized.full[selectedDate.getMonth()];
  const day = selectedDate.getDate();

  const hours = selectedDate.getHours();
  const minutes = selectedDate.getMinutes();
  const minStr = padZero(minutes);
  let timeStr = "";
  if (is24Hour) {
    const hrStr = padZero(hours);
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
}
