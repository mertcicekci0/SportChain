"use client";

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  // Configuration for consistent color mode
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  // Sports-themed color palette for athlete scholarship platform
  colors: {
    brand: {
      50: "#f0f9ff",
      100: "#e0f2fe", 
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Primary blue - trust and reliability
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e"
    },
    sport: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0", 
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Victory green - achievement and growth
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d"
    },
    energy: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // Energy orange - motivation and action
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f"
    },
    champion: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef", // Champion purple - excellence and prestige
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75"
    }
  },
});

export default theme;
