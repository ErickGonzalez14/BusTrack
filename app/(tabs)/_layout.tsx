import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Tabs, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
          name="test"
          options={{
            title: "Test",
          }}
        />

        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Ajustes",
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
