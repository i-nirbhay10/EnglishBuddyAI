import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SkillBar } from '../components/SkillBar';
import { StatItem, Divider } from '../components/StatItem';
import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../services/storageService';
import { calculateLevel, getLevelTitle } from '../utils/levelUtils';

export const ProfileScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [xp, setXp] = useState(0);
  const [completedNodes, setCompletedNodes] = useState(0);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        const progress = await getProgress();
        setXp(progress?.xp || 0);
        setCompletedNodes(progress?.completedNodes || 0);
        setWeaknesses(progress?.weaknesses || []);
      };
      loadProgress();
    }, [])
  );

  const safeXp = xp || 0;
  const safeNodes = completedNodes || 0;
  const currentLevel = calculateLevel(safeXp);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          padding: spacing.md,
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingBottom: insets.bottom + spacing.xl
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}
          onPress={() => navigation.navigate('SettingsScreen')}
        >
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
            <Text style={styles.levelText}>{currentLevel}</Text>
          </View>
        </View>
        
        <Text style={[styles.username, { color: colors.text, marginTop: spacing.md }]}>Explorer_99</Text>
        <Text style={[styles.titleText, { color: colors.primaryNeon, marginBottom: spacing.lg }]}>{getLevelTitle(currentLevel)}</Text>
        
        <View style={styles.statsRow}>
          <StatItem value={safeNodes.toString()} label="Missions" />
          <Divider />
          <StatItem value={safeXp.toLocaleString()} label="Total XP" />
          <Divider />
          <StatItem value="Bronze" label="League" color={colors.warning} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Skill Mastery</Text>
      
      {safeXp === 0 ? (
        <View style={[styles.emptyStateCard, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center' }]}>
          <Icon name="chart-bar" family="FontAwesome5" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginTop: spacing.md, textAlign: 'center' }}>No Skill Data Yet</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>Complete your first mission to unlock your skill mastery breakdown.</Text>
        </View>
      ) : (
        <View style={[styles.skillsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl }]}>
          <SkillBar title="Vocabulary" percentage={Math.min(100, 20 + (safeXp / 50))} color={colors.primary} />
          <SkillBar title="Grammar" percentage={Math.min(100, 10 + (safeXp / 40))} color={colors.secondary} />
          <SkillBar title="Speaking" percentage={Math.min(100, 5 + (safeXp / 80))} color={colors.accent} />
          <SkillBar title="Listening" percentage={Math.min(100, 15 + (safeXp / 60))} color={colors.success} />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Focus Areas</Text>
      {weaknesses.length === 0 ? (
        <View style={[styles.emptyStateCard, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center' }]}>
          <Icon name="check-circle" family="FontAwesome5" size={40} color={colors.success} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginTop: spacing.md, textAlign: 'center' }}>No Weak Areas Detected!</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>You're doing great. Keep practicing to maintain your streak.</Text>
        </View>
      ) : (
        <View style={[styles.skillsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl }]}>
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md, fontSize: 14 }}>
            The AI tutor is prioritizing these areas in your personalized sessions:
          </Text>
          <View style={styles.weaknessTagsContainer}>
            {weaknesses.map((topic, index) => (
              <View 
                key={index} 
                style={[
                  styles.weaknessTag, 
                  { 
                    backgroundColor: colors.error + '15', 
                    borderColor: colors.error + '30',
                    borderRadius: borderRadius.md 
                  }
                ]}
              >
                <Icon name="exclamation-triangle" family="FontAwesome5" size={12} color={colors.error} />
                <Text style={[styles.weaknessText, { color: colors.error, marginLeft: spacing.xs }]}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  weaknessTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  weaknessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  weaknessText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
