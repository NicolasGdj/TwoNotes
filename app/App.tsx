import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect } from "react";

import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

export default function App() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <Navigation colorScheme={colorScheme} />
      <StatusBar />
    </SafeAreaProvider>
  );
}
