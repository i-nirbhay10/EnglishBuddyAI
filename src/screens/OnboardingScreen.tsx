import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';

export const OnboardingScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={{ marginBottom: spacing.xl }}>
          <Icon name="graduation-cap" family="FontAwesome5" size={80} color={colors.primaryNeon} />
        </View>
        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.md }]}>Your Quest Begins</Text>
        <Text style={[styles.description, { color: colors.textMuted, paddingHorizontal: spacing.md }]}>
          Master English through epic challenges, boss battles, and an AI companion by your side.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.buttonContainer, { marginBottom: spacing.xxl, borderRadius: borderRadius.lg }]}
        activeOpacity={0.8}
        onPress={() => navigation.replace('MainTabs')}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, { paddingVertical: spacing.md }]}
        >
          <Text style={styles.buttonText}>Start Adventure</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    overflow: 'hidden',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
