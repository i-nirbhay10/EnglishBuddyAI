import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
}

export const ProgressBar = ({ progress, color, height = 12 }: ProgressBarProps) => {
  const { colors, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round, height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            backgroundColor: color || colors.primary, 
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            borderRadius: borderRadius.round 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
