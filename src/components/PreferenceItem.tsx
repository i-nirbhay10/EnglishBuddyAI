import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';

interface PreferenceItemProps {
  iconName: string;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export const PreferenceItem = ({ iconName, label, value, onValueChange }: PreferenceItemProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, marginRight: spacing.md }]}>
          <Icon name={iconName} size={20} color={colors.text} />
        </View>
        <Text style={[styles.preferenceText, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: colors.textMuted, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
