import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/theme';

interface SkillBarProps {
  title: string;
  percentage: number;
  color: string;
}

export const SkillBar = ({ title, percentage, color }: SkillBarProps) => {
  const { colors, spacing, borderRadius } = useTheme();
  
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <Text style={{ color: colors.text, fontWeight: '500' }}>{title}</Text>
        <Text style={{ color: colors.textMuted }}>{percentage}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: borderRadius.round }} />
      </View>
    </View>
  );
};
