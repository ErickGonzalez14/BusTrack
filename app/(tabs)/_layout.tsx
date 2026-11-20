import { useAppTheme } from "@/src/shared/theme/useAppTheme";
import { Tabs, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Crown, Home, Map, Settings } from "iconoir-react-native";
import React from "react";

export default function TabLayout() {
  const { isDarkMode } = useAppTheme();
  const statusBarStyles = {
    home: "light",
    settings: isDarkMode ? "light" : "dark",
    profile: isDarkMode ? "light" : "dark",
    notifications: "light",
  } as const;
  const pathname = usePathname();

  const currentTab = pathname.split("/").pop() as keyof typeof statusBarStyles;

  const statusBarStyle = statusBarStyles[currentTab] ?? "light";
  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Home color={color} width={size} height={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            title: "Mapa",
            tabBarIcon: ({ color, size }) => (
              <Map color={color} width={size} height={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="premium"
          options={{
            title: "Premium",
            tabBarIcon: ({ color, size }) => (
              <Crown color={color} width={size} height={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} width={size} height={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
