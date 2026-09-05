import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Tabs, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Home, Map, Settings } from "iconoir-react-native";
import React from "react";

export default function TabLayout() {
  const statusBarStyles = {
    home: "light",
    settings: "dark",
    profile: "dark",
    notifications: "light",
  } as const;
  const pathname = usePathname();

  const currentTab = pathname.split("/").pop() as keyof typeof statusBarStyles;

  const statusBarStyle = statusBarStyles[currentTab] ?? "light";
  return (
    <QueryClientProvider client={queryClient}>
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
          name="settings"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} width={size} height={size} />
            ),
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
