import { useEffect, useState } from "react";
import { useUnistyles } from "react-native-unistyles";
import { restoreAppTheme, setAppDarkMode } from "./appTheme";

export function useAppTheme() {
  const { rt, theme } = useUnistyles();

  return {
    theme,
    isDarkMode: rt.themeName === "dark",
    setDarkMode: (enabled: boolean) => {
      void setAppDarkMode(enabled).catch((error) => {
        console.warn("No se pudo guardar el tema de la app:", error);
      });
    },
  };
}

export function useRestoreAppTheme() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void restoreAppTheme()
      .catch((error) => console.warn("No se pudo recuperar el tema de la app:", error))
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => { active = false; };
  }, []);

  return isReady;
}
