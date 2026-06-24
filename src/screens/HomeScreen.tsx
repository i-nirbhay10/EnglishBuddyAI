import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { getProgress, checkDailyLogin } from '../services/storageService';
import { calculateLevel, calculateLevelProgress, getLevelTitle } from '../utils/levelUtils';
import { useFocusEffect } from '@react-navigation/native';
import { QuestCard } from '../components/QuestCard';

export const HomeScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        await checkDailyLogin();
        const progress = await getProgress();
        setXp(progress?.xp || 0);
        setStreak(progress?.streak || 0);
      };
      loadProgress();
    }, [])
  );

  const safeXp = xp || 0;
  const currentLevel = calculateLevel(safeXp);
  const { currentLevelXp, progressPercent, xpRequired } = calculateLevelProgress(safeXp);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={[
        styles.content, 
        { 
          padding: spacing.md, 
          paddingTop: Math.max(insets.top, spacing.lg),
          paddingBottom: insets.bottom + spacing.xl
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Section */}
      <View style={[styles.header, { marginBottom: spacing.lg }]}>
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={[styles.avatarGlow, { borderRadius: borderRadius.round }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.background, borderRadius: borderRadius.round }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>E</Text>
            </View>
          </LinearGradient>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={[styles.welcomeText, { color: colors.textMuted }]}>WELCOME BACK</Text>
            <Text style={[styles.username, { color: colors.text }]}>Explorer_99</Text>
          </View>
        </View>

        <View style={[styles.statsContainer, { gap: spacing.xs }]}>
          <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.round }]}>
            <Icon name="flame" size={14} color={colors.warning} />
            <Text style={[styles.statText, { color: colors.text, marginLeft: 4 }]}>{streak}d</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.round }]}
          >
            <Icon name="star" family="FontAwesome5" size={12} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.text, marginLeft: 4 }]}>{xp} XP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Card (Premium Glowing Gradient) */}
      <LinearGradient
        colors={[colors.secondary, colors.primaryNeon]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.progressCard, { borderRadius: borderRadius.lg, marginBottom: spacing.xl, padding: spacing.lg }]}
      >
        <View style={styles.progressCardHeader}>
          <View>
            <Text style={styles.progressLevelText}>Level {currentLevel}</Text>
            <Text style={styles.levelSubtitle}>{getLevelTitle(currentLevel)}</Text>
          </View>
          <Icon name="trophy" family="FontAwesome5" size={26} color="#FFE082" />
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: borderRadius.round }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${progressPercent}%`, 
                  backgroundColor: '#FFF', 
                  borderRadius: borderRadius.round,
                  shadowColor: '#FFF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentLevelXp} / {xpRequired} XP</Text>
        </View>
      </LinearGradient>

      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Choose Your Quest</Text>

      {/* Quests Grid (2x2 Grid) */}
      <View style={styles.grid}>
        <QuestCard
          name="Sentence Builder"
          description="Fill in the correct grammar values."
          xpReward={50}
          iconName="bullseye"
          iconColor={colors.error}
          onPress={() => navigation.navigate('GameScreen')}
          variant="grid"
        />

        <QuestCard
          name="AI Tutor Chat"
          description="Real-world roleplays & dialogue."
          xpReward={100}
          iconName="robot"
          iconColor={colors.primary}
          onPress={() => navigation.navigate('AI Chat')}
          variant="grid"
        />

        <QuestCard
          name="Word Scramble"
          description="Arrange mixed words into syntax."
          xpReward={100}
          iconName="puzzle-piece"
          iconColor={colors.accent}
          onPress={() => navigation.navigate('ScrambleScreen')}
          variant="grid"
        />

        <QuestCard
          name="Vocab Match"
          description="Match vocabulary with meanings."
          xpReward={120}
          iconName="clone"
          iconColor={colors.success}
          onPress={() => navigation.navigate('MatchScreen')}
          variant="grid"
        />
      </View>

      {/* Mind Soothing Section */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
        Casual Word Games
      </Text>

      <TouchableOpacity
        style={[
          styles.relaxCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
          }
        ]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('GuessScreen')}
      >
        <View style={[styles.relaxIconContainer, { backgroundColor: colors.warning + '15', borderRadius: borderRadius.md }]}>
          <Icon name="gamepad" family="FontAwesome5" size={24} color={colors.warning} />
        </View>
        <View style={styles.relaxInfo}>
          <Text style={[styles.relaxTitle, { color: colors.text }]}>Word Guesser (Hangman)</Text>
          <Text style={[styles.relaxDesc, { color: colors.textMuted }]}>
            Relax, take your time, and guess hidden words with interactive hint clues!
          </Text>
          <View style={[styles.relaxBadge, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.relaxBadgeText, { color: colors.warning }]}>+30 XP / word</Text>
          </View>
        </View>
        <Icon name="chevron-right" family="FontAwesome5" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.relaxCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
          }
        ]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ConnectScreen')}
      >
        <View style={[styles.relaxIconContainer, { backgroundColor: colors.primaryNeon + '15', borderRadius: borderRadius.md }]}>
          <Icon name="link" family="FontAwesome5" size={24} color={colors.primaryNeon} />
        </View>
        <View style={styles.relaxInfo}>
          <Text style={[styles.relaxTitle, { color: colors.text }]}>Word Connect</Text>
          <Text style={[styles.relaxDesc, { color: colors.textMuted }]}>
            Connect scrambled letters to discover all valid hidden words!
          </Text>
          <View style={[styles.relaxBadge, { backgroundColor: colors.primaryNeon + '20' }]}>
            <Text style={[styles.relaxBadgeText, { color: colors.primaryNeon }]}>+20 XP / word</Text>
          </View>
        </View>
        <Icon name="chevron-right" family="FontAwesome5" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGlow: {
    padding: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  welcomeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  username: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 1 
  },
  statsContainer: { 
    flexDirection: 'row',
  },
  statPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  statText: { 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  progressCard: { 
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLevelText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  levelSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressBarWrapper: {
    marginTop: 18,
  },
  progressBarBg: { 
    height: 8, 
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: { 
    height: '100%',
  },
  progressText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  relaxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  relaxIconContainer: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  relaxInfo: {
    flex: 1,
  },
  relaxTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  relaxDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  relaxBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  relaxBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  }
});
