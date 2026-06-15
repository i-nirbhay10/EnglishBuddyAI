import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const lightColors = {
  background: '#F8FAFC', // Light gray/white
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F5F9',
  primary: '#3B82F6', // Blue
  primaryNeon: '#2563EB',
  secondary: '#8B5CF6', // Purple
  secondaryNeon: '#7C3AED',
  accent: '#06B6D4', // Cyan
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  text: '#0F172A',
  textMuted: '#64748B',
  cardBorder: 'rgba(0, 0, 0, 0.05)',
};

const darkColors = {
  background: '#0F172A', // Dark navy
  surface: '#1E293B',
  surfaceHighlight: '#334155',
  primary: '#3B82F6', // Blue
  primaryNeon: '#60A5FA',
  secondary: '#8B5CF6', // Purple
  secondaryNeon: '#A78BFA',
  accent: '#06B6D4', // Cyan
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

export const ThemeContext = createContext({
  colors: darkColors,
  ...baseTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceTheme === 'dark');

  useEffect(() => {
    setIsDark(deviceTheme === 'dark');
  }, [deviceTheme]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    colors: isDark ? darkColors : lightColors,
    ...baseTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Keeping this for backwards compatibility where we don't use hooks (not recommended)
export const theme = {
  colors: darkColors,
  ...baseTheme,
};
