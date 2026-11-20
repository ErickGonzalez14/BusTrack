import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, Platform } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

type AppTheme = "light" | "dark";
const THEME_STORAGE_KEY = "bustrack:theme";

function applyAppTheme(theme: AppTheme) {
  UnistylesRuntime.setTheme(theme);
  if (Platform.OS !== "web") Appearance.setColorScheme(theme);
}

export async function restoreAppTheme() {
  const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  applyAppTheme(savedTheme === "dark" ? "dark" : "light");
}

export async function setAppDarkMode(enabled: boolean) {
  const theme = enabled ? "dark" : "light";
  applyAppTheme(theme);
  await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
}
