import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';
import Animated from 'react-native-reanimated';

interface FeedbackBannerProps {
  isCorrect: boolean | null;
  correctAnswer: string;
  explanation?: string;
  lives: number;
  onContinue: () => void;
}

export const FeedbackBanner = ({ isCorrect, correctAnswer, explanation, lives, onContinue }: FeedbackBannerProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  if (isCorrect === null) return null;

  return (
    <Animated.View style={[
      styles.feedbackContainer, 
      { 
        backgroundColor: isCorrect ? (colors.success + '10') : (colors.error + '10'), 
        borderTopColor: isCorrect ? (colors.success + '30') : (colors.error + '30'), 
        padding: spacing.xl, 
        borderTopWidth: 1 
      }
    ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon 
          name={isCorrect ? "check-circle" : "times-circle"} 
          family="FontAwesome5" 
          size={24} 
          color={isCorrect ? colors.success : colors.error} 
        />
        <Text style={[styles.feedbackTitle, { color: isCorrect ? colors.success : colors.error, marginLeft: 8 }]}>
          {isCorrect ? "Excellent!" : "Incorrect"}
        </Text>
      </View>
      
      {!isCorrect && (
        <Text style={[styles.feedbackText, { color: colors.text, marginBottom: spacing.md }]}>
          The correct answer is <Text style={{fontWeight: 'bold', color: colors.success}}>{correctAnswer}</Text>
        </Text>
      )}

      {explanation && (
        <Text style={[styles.explanationText, { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 22 }]}>
          {explanation}
        </Text>
      )}

      <TouchableOpacity 
        style={[
          styles.continueButton, 
          { 
            backgroundColor: isCorrect ? colors.success : colors.error, 
            borderRadius: borderRadius.round, 
            shadowColor: isCorrect ? colors.success : colors.error, 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 8, 
            elevation: 4 
          }
        ]}
        onPress={onContinue}
      >
        <Text style={styles.continueButtonText}>
          {lives <= 0 && !isCorrect ? "Game Over" : "Continue"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  feedbackTitle: { fontSize: 20, fontWeight: '800' },
  feedbackText: { fontSize: 15, lineHeight: 22 },
  explanationText: { fontSize: 14, fontStyle: 'italic' },
  continueButton: { padding: 14, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
