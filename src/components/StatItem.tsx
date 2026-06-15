import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

interface StatItemProps {
  value: string;
  label: string;
  color?: string;
}

export const StatItem = ({ value, label, color }: StatItemProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
};

export const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />;
};

const styles = StyleSheet.create({
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 30,
  },
});
