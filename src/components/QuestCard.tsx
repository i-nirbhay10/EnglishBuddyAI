import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';

interface QuestCardProps {
  name: string;
  description: string;
  xpReward: number;
  iconName: string;
  iconColor: string;
  onPress?: () => void;
}

export const QuestCard = ({ name, description, xpReward, iconName, iconColor, onPress }: QuestCardProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.questCard, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.cardBorder, 
          borderRadius: borderRadius.md, 
          marginBottom: spacing.md, 
          padding: spacing.md 
        }
      ]} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.questIconContainer, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, marginRight: spacing.md }]}>
        <Icon name={iconName} family="FontAwesome5" size={24} color={iconColor} />
      </View>
      <View style={styles.questInfo}>
        <Text style={[styles.questName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.questDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Text style={[styles.rewardText, { color: colors.warning }]}>+{xpReward} XP</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 16,
    fontWeight: '600',
  },
  questDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  rewardText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
