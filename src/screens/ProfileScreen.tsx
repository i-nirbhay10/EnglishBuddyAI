import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SkillBar } from '../components/SkillBar';
import { StatItem, Divider } from '../components/StatItem';
import { PreferenceItem } from '../components/PreferenceItem';

export const ProfileScreen = () => {
  const { colors, spacing, borderRadius, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          padding: spacing.lg,
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingBottom: insets.bottom + spacing.xl
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <Icon name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl }]}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={[styles.avatarGradient, { borderRadius: borderRadius.round }]}
          >
            <Icon name="user-astronaut" family="FontAwesome5" size={40} color="#FFF" />
          </LinearGradient>
          <View style={[styles.levelBadge, { backgroundColor: colors.accent, borderColor: colors.surface, borderRadius: borderRadius.round }]}>
            <Text style={styles.levelText}>5</Text>
          </View>
        </View>
        
        <Text style={[styles.username, { color: colors.text, marginTop: spacing.md }]}>Explorer_99</Text>
        <Text style={[styles.titleText, { color: colors.primaryNeon, marginBottom: spacing.lg }]}>Advanced Scholar</Text>
        
        <View style={styles.statsRow}>
          <StatItem value="12" label="Day Streak" />
          <Divider />
          <StatItem value="4,500" label="Total XP" />
          <Divider />
          <StatItem value="Gold" label="League" color={colors.warning} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Skill Mastery</Text>
      
      <View style={[styles.skillsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl }]}>
        <SkillBar title="Vocabulary" percentage={75} color={colors.primary} />
        <SkillBar title="Grammar" percentage={60} color={colors.secondary} />
        <SkillBar title="Speaking" percentage={45} color={colors.accent} />
        <SkillBar title="Listening" percentage={80} color={colors.success} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Preferences</Text>
      
      <View style={[styles.preferencesCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.md }]}>
        <PreferenceItem 
          iconName="moon" 
          label="Dark Mode" 
          value={isDark} 
          onValueChange={toggleTheme} 
        />
        <View style={[styles.horizontalDivider, { backgroundColor: colors.cardBorder, marginVertical: spacing.sm }]} />
        <PreferenceItem 
          iconName="volume-high" 
          label="Sound Effects" 
          value={true} 
          onValueChange={() => {}} 
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  levelText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  skillsCard: {
    borderWidth: 1,
  },
  preferencesCard: {
    borderWidth: 1,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
  },
});
