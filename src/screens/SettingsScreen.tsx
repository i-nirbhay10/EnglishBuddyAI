import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PreferenceItem } from '../components/PreferenceItem';
import { resetProgress, getPreferences, savePreferences, UserPreferences } from '../services/storageService';

export const SettingsScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [prefs, setPrefs] = useState<UserPreferences>({ soundEffects: true, dailyReminders: true });

  useEffect(() => {
    const loadPrefs = async () => {
      const storedPrefs = await getPreferences();
      setPrefs(storedPrefs);
    };
    loadPrefs();
  }, []);

  const handleToggle = async (key: keyof UserPreferences, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    await savePreferences(newPrefs);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your learning progress? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            await resetProgress();
            Alert.alert("Success", "Your progress has been reset.");
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, spacing.lg),
        paddingBottom: insets.bottom + spacing.xl
      }}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginLeft: -8 }}>
          <Icon name="arrow-left" family="FontAwesome5" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, marginLeft: spacing.md }]}>Settings</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm }]}>Appearance</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg, padding: spacing.md }]}>
        <PreferenceItem 
          iconName="moon" 
          label="Dark Mode" 
          value={isDark} 
          onValueChange={toggleTheme} 
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm }]}>Preferences</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg, padding: spacing.md }]}>
        <PreferenceItem 
          iconName="volume-high" 
          label="Sound Effects" 
          value={prefs.soundEffects} 
          onValueChange={(val) => handleToggle('soundEffects', val)} 
        />
        <View style={[styles.horizontalDivider, { backgroundColor: colors.cardBorder, marginVertical: spacing.sm }]} />
        <PreferenceItem 
          iconName="bell" 
          label="Daily Reminders" 
          value={prefs.dailyReminders} 
          onValueChange={(val) => handleToggle('dailyReminders', val)} 
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm }]}>Data Management</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg, paddingVertical: spacing.sm }]}>
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleResetProgress}
        >
          <Icon name="trash" family="FontAwesome5" size={18} color={colors.error} />
          <Text style={[styles.dangerButtonText, { color: colors.error, marginLeft: spacing.sm }]}>Reset All Progress</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>EnglishBuddy AI v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
