import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { QuestCard } from '../components/QuestCard';

export const HomeScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={[
        styles.content, 
        { 
          padding: spacing.lg, 
          paddingTop: Math.max(insets.top, spacing.xxl),
          paddingBottom: insets.bottom + spacing.xl
        }
      ]}
    >
      {/* Header Profile Section */}
      <View style={[styles.header, { marginBottom: spacing.xl }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.primaryNeon }]}>Level 5 Scholar</Text>
          <Text style={[styles.username, { color: colors.text }]}>Explorer_99</Text>
        </View>
        <View style={[styles.statsContainer, { gap: spacing.sm }]}>
          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.round }]}>
            <View style={{ marginRight: 4 }}><Icon name="flame" size={16} color={colors.warning} /></View>
            <Text style={[styles.statText, { color: colors.text }]}>7</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.round }]}>
            <View style={{ marginRight: 4 }}><Icon name="gem" family="FontAwesome5" size={16} color={colors.accent} /></View>
            <Text style={[styles.statText, { color: colors.text }]}>150</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, marginBottom: spacing.xl, padding: spacing.lg }]}>
        <Text style={[styles.progressTitle, { color: colors.text, marginBottom: spacing.md }]}>Next Level: 450 / 1000 XP</Text>
        <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <LinearGradient
            colors={[colors.secondary, colors.primaryNeon]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: '45%', borderRadius: borderRadius.round }]}
          />
        </View>
      </View>

      {/* Daily Quests */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>Daily Quests</Text>
      
      <QuestCard 
        name="Sentence Completer"
        description="Complete 10 sentences"
        xpReward={50}
        iconName="bullseye"
        iconColor={colors.error}
        onPress={() => navigation.navigate('GameScreen')}
      />

      <QuestCard 
        name="AI Conversation"
        description="Chat for 5 minutes"
        xpReward={100}
        iconName="robot"
        iconColor={colors.primary}
        onPress={() => navigation.navigate('AI Chat')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  statsContainer: { flexDirection: 'row' },
  statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  statText: { fontWeight: 'bold' },
  progressCard: { borderWidth: 1 },
  progressTitle: { fontSize: 16, fontWeight: '600' },
  progressBarBg: { height: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
});
