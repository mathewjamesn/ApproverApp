import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  isDark: false,
  colors: lightColors,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('light');

  // useColorScheme() can return null on Android before the system resolves the preference.
  // Default to 'light' in that case to prevent a theme flicker on first render.
  const resolvedScheme = systemColorScheme ?? 'light';
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
