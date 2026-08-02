import { StyleSheet } from "react-native-unistyles";
import * as Colors from "./Design/Tokens/Colors";
import * as Sizes from "./Design/Tokens/size";

export const LightTheme = {
  surface: {
    brand: Colors.Colors.BerryBlue[500],
    primary: Colors.Colors.persianBlue[500],
    secondary: Colors.Colors.deepNavy[500],
    tertiary: Colors.Colors.duskBlue[500],
    quaternary: Colors.Colors.icyBlue[500],
    contrast: Colors.Colors.jadeGreen[500],
    background: Colors.Colors.base.white,
    neutral: Colors.Colors.blueGray[100],
    inputs: Colors.Colors.base.white,
  },
  components: {
    cards: Colors.Colors.blueGray[500],
    buttons: {
      primary: Colors.Colors.persianBlue[500],
      primaryHover: Colors.Colors.persianBlue[600],
      secondary: Colors.Colors.icyBlue[500],
      secondaryHover: Colors.Colors.icyBlue[700],
    },
  },
  text: {
    Body: Colors.Colors.blueGray[800],
    Primary: Colors.Colors.base.black,
    placeholder: Colors.Colors.blueGray[400],
    Secondary: Colors.Colors.base.white,
    contrast: Colors.Colors.BerryBlue[500],
  },

  icons: {
    primary: Colors.Colors.blueGray[100],
    alternative: Colors.Colors.jadeGreen[500],
    brand: Colors.Colors.BerryBlue[500],
    alternativeBrand: Colors.Colors.cornFlowerBlue[500],
  },
  size_rounded: {
    xs: Sizes.size.xs,
    sm: Sizes.size.sm,
    md: Sizes.size.md,
    lg: Sizes.size.lg,
    xl: Sizes.size.xl,
    "2xl": Sizes.size["2xl"],
    "3xl": Sizes.size["3xl"],
    "4xl": Sizes.size["4xl"],
    full: Sizes.size.full,
  },
};

export const DarkTheme = {
  surface: {
    brand: Colors.Colors.base.white,
    primary: Colors.Colors.persianBlue[300],
    secondary: Colors.Colors.icyBlue[500],
    tertiary: Colors.Colors.duskBlue[400],
    quaternary: Colors.Colors.icyBlue[800],
    contrast: Colors.Colors.jadeGreen[500],
    background: Colors.Colors.deepNavy[900],
    neutral: Colors.Colors.blueGray[900],
    inputs: Colors.Colors.duskBlue[800],
  },
  components: {
    cards: Colors.Colors.blueGray[800],
    buttons: {
      primary: Colors.Colors.persianBlue[400],
      primaryHover: Colors.Colors.persianBlue[500],
      secondary: Colors.Colors.icyBlue[700],
      secondaryHover: Colors.Colors.icyBlue[600],
    },
  },
  text: {
    Body: Colors.Colors.blueGray[100],
    Primary: Colors.Colors.base.white,
    placeholder: Colors.Colors.blueGray[600],
    Secondary: Colors.Colors.base.black,
    contrast: Colors.Colors.BerryBlue[300],
  },

  icons: {
    primary: Colors.Colors.blueGray[200],
    alternative: Colors.Colors.jadeGreen[300],
    brand: Colors.Colors.BerryBlue[300],
    alternativeBrand: Colors.Colors.cornFlowerBlue[300],
  },
  size_rounded: {
    xs: Sizes.size.xs,
    sm: Sizes.size.sm,
    md: Sizes.size.md,
    lg: Sizes.size.lg,
    xl: Sizes.size.xl,
    "2xl": Sizes.size["2xl"],
    "3xl": Sizes.size["3xl"],
    "4xl": Sizes.size["4xl"],
    full: Sizes.size.full,
  },
};

const appThemes = {
  light: LightTheme,
  dark: DarkTheme,
};

type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  settings: {
    initialTheme: "light",
  },
  themes: appThemes,
});
