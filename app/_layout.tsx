import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [loaded] = useFonts({
    ObjectSansHeavy: require("@/Fonts/ObjectSansHeavy.otf"),
    ObjectSansRegular: require("@/Fonts/ObjectSansRegular.otf"),
    Roboto_400Regular,
    Roboto_700Bold,
    Roboto_300Light,
  });

  return (
    <>
      <Stack initialRouteName="register">
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
