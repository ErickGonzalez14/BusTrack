

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
