import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
            title: "Home",
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
