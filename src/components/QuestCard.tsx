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
  variant?: 'row' | 'grid';
}

export const QuestCard = ({ name, description, xpReward, iconName, iconColor, onPress, variant = 'row' }: QuestCardProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  if (variant === 'grid') {
    return (
      <TouchableOpacity 
        style={[
          styles.gridCard, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.cardBorder, 
            borderRadius: borderRadius.lg 
          }
        ]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: iconColor + '15' }]}>
          <Icon name={iconName} family="FontAwesome5" size={24} color={iconColor} />
        </View>
        <Text style={[styles.gridCardTitle, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.gridCardDesc, { color: colors.textMuted }]} numberOfLines={2}>
          {description}
        </Text>
        <View style={[styles.rewardBadge, { backgroundColor: iconColor + '20' }]}>
          <Text style={[styles.rewardTextGrid, { color: iconColor }]}>+{xpReward} XP</Text>
        </View>
      </TouchableOpacity>
    );
  }

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
  // Grid styles
  gridCard: {
    width: '48%',
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    height: 32,
    marginBottom: 12,
  },
  rewardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardTextGrid: {
    fontSize: 11,
    fontWeight: '700',
  }
});
