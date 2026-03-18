import React, { createContext, useContext, useState } from 'react';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  alertRed: string;
  alertRedBg: string;
  alertYellow: string;
  alertYellowBg: string;
  statGreen: string;
  statBlue: string;
  statPurple: string;
  statOrange: string;
  danger: string;
  dangerBg: string;
  border: string;
  white: string;
  black: string;
  tabBar: string;
  statusBar: 'dark' | 'light';
}

const lightColors: ThemeColors = {
  primary: '#2DC88A',
  primaryDark: '#1DAA74',
  primaryLight: '#E8FAF3',
  background: '#EFF1F5',
  cardBg: '#FFFFFF',
  textPrimary: '#1A2340',
  textSecondary: '#8896B3',
  textMuted: '#AAB4C8',
  alertRed: '#FF4D4D',
  alertRedBg: '#FFF2F2',
  alertYellow: '#F5A623',
  alertYellowBg: '#FFFBEB',
  statGreen: '#2DC88A',
  statBlue: '#4A90D9',
  statPurple: '#9B59B6',
  statOrange: '#F5A623',
  danger: '#FF4D4D',
  dangerBg: '#FFF0F0',
  border: '#E4E8F0',
  white: '#FFFFFF',
  black: '#000000',
  tabBar: '#FFFFFF',
  statusBar: 'dark',
};

const darkColors: ThemeColors = {
  primary: '#2DC88A',
  primaryDark: '#1DAA74',
  primaryLight: '#1A3D2E',
  background: '#0A1119',
  cardBg: '#111923',
  textPrimary: '#E8EDF5',
  textSecondary: '#7A8BA8',
  textMuted: '#3D4F63',
  alertRed: '#FF6B6B',
  alertRedBg: '#1E0F0F',
  alertYellow: '#F5A623',
  alertYellowBg: '#1E1608',
  statGreen: '#2DC88A',
  statBlue: '#4A90D9',
  statPurple: '#9B59B6',
  statOrange: '#F5A623',
  danger: '#FF6B6B',
  dangerBg: '#1E0F0F',
  border: '#1C2733',
  white: '#111923',
  black: '#E8EDF5',
  tabBar: '#0D1520',
  statusBar: 'light',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
