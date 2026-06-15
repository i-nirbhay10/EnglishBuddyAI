import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/theme';

const RootApp = () => {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      <AppNavigator />
    </>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
