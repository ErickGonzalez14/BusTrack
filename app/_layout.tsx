import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { queryClient } from "@/lib/queryClient";
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
export const unstable_settings = {
  anchor: "(tabs)",
};
const stripePublishableKey = Constants.expoConfig?.extra?.stripePublishableKey;

function RootNavigator() {
  const { user, hasProfile, isAuthLoading, isAuthFlowInProgress } = useAuth();

  useLocationPermission({
    enabled:
      !isAuthLoading &&
      !isAuthFlowInProgress &&
      Boolean(user) &&
      hasProfile === true,
    userId: user?.uid,
  });

  if (isAuthLoading) {
    return null;
  }

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <Stack>
        <Stack.Protected guard={!user || isAuthFlowInProgress}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="logIn" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected
          guard={
            Boolean(user) && (hasProfile === false || isAuthFlowInProgress)
          }
        >
          <Stack.Screen
            name="completeProfile"
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        <Stack.Protected guard={Boolean(user) && hasProfile === true}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="Settings/editProfile"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/UserRequests/requests"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/UserRequests/driverRequest"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/UserRequests/businessPlans"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Settings/UserRequests/businessLightRequest"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/UserRequests/businessProRequest"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Settings/Business/dashBoard"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/Business/productForm"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/Business/serviceForm"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/Business/discountForm"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/Favorites/favorite"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings/Favorites/createRoutine"
            options={{ headerShown: false }}
          />
        </Stack.Protected>
      </Stack>
    </StripeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    ObjectSansHeavy: require("@/Fonts/ObjectSansHeavy.otf"),
    ObjectSansRegular: require("@/Fonts/ObjectSansRegular.otf"),
    Roboto_400Regular,
    Roboto_700Bold,
    Roboto_300Light,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
