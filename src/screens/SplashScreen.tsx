import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';

export const SplashScreen = ({ navigation }: any) => {
  const { colors, spacing } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 800 }),
      withTiming(1, { duration: 400 })
    );

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={{ marginBottom: spacing.md }}>
          <Icon name="robot" family="FontAwesome5" size={80} color={colors.primaryNeon} />
        </View>
        <Text style={[styles.title, { color: colors.primaryNeon }]}>EnglishBuddy AI</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, marginTop: spacing.sm }]}>Level Up Your English Skills</Text>
      </Animated.View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
  },
});
