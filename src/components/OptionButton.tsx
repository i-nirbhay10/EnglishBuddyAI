import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';

interface OptionButtonProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean | null;
  onPress: () => void;
  disabled?: boolean;
}

export const OptionButton = ({ option, index, isSelected, isCorrect, onPress, disabled }: OptionButtonProps) => {
  const { colors, spacing, borderRadius } = useTheme();
  
  const letters = ['A', 'B', 'C', 'D'];
  let optionBg = colors.surface;
  let optionBorder = colors.cardBorder;
  let textColor = colors.text;
  let letterBg = colors.surfaceHighlight;
  let letterColor = colors.textMuted;
  let icon = null;
  
  if (isSelected) {
    if (isCorrect === true) {
      optionBg = colors.success + '15';
      optionBorder = colors.success;
      textColor = colors.success;
      letterBg = colors.success;
      letterColor = '#FFF';
      icon = <Icon name="check-circle" family="FontAwesome5" size={20} color={colors.success} />;
    } else if (isCorrect === false) {
      optionBg = colors.error + '10';
      optionBorder = colors.error;
      textColor = colors.error;
      letterBg = colors.error;
      letterColor = '#FFF';
      icon = <Icon name="times-circle" family="FontAwesome5" size={20} color={colors.error} />;
    } else {
      optionBg = colors.primaryNeon + '10';
      optionBorder = colors.primaryNeon;
      textColor = colors.primaryNeon;
      letterBg = colors.primaryNeon;
      letterColor = '#FFF';
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        { backgroundColor: optionBg, borderColor: optionBorder, borderRadius: borderRadius.xl, marginBottom: spacing.md }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.letterCircle, { backgroundColor: letterBg }]}>
          <Text style={[styles.letterText, { color: letterColor }]}>{letters[index]}</Text>
        </View>
        <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
      </View>
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingRight: 16, borderWidth: 1.5 },
  letterCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  letterText: { fontSize: 12, fontWeight: 'bold' },
  optionText: { fontSize: 16, fontWeight: '600' },
});
