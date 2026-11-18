export type TimeValue = {
  hours: number;
  minutes: number;
  period: "AM" | "PM";
  formatted: string;
};

export const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function parseTimeString(timeStr: string, is24Hour: boolean) {
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
}
