import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { ZoomIn, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';

interface AnimatedResultOverlayProps {
  visible: boolean;
  type: 'win' | 'lose';
  xpReward: number;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  title?: string;
  subtitle?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
}

export const AnimatedResultOverlay = ({
  visible,
  type,
  xpReward,
  onPrimaryPress,
  onSecondaryPress,
  title,
  subtitle,
  primaryBtnText,
  secondaryBtnText
}: AnimatedResultOverlayProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  if (!visible) return null;

  const isWin = type === 'win';

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      style={[styles.overlay, { backgroundColor: 'rgba(15, 23, 42, 0.96)' }]}
    >
      <Animated.View 
        entering={ZoomIn.springify().damping(12).stiffness(100)}
        style={[
          styles.card, 
          { 
            backgroundColor: colors.surface, 
            borderColor: isWin ? colors.success + '40' : colors.error + '40',
            borderRadius: borderRadius.lg,
            padding: spacing.xl
          }
        ]}
      >
        {/* Glow Header */}
        <View style={styles.iconContainer}>
          <View style={[
            styles.glowBg, 
            { 
              backgroundColor: isWin ? colors.success + '20' : colors.error + '20',
              borderRadius: borderRadius.round
            }
          ]} />
          <Icon 
            name={isWin ? "trophy" : "sad-tear"} 
            family="FontAwesome5" 
            size={56} 
            color={isWin ? colors.warning : colors.error} 
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {title || (isWin ? "Victory!" : "Game Over")}
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textMuted, marginBottom: spacing.lg }]}>
          {subtitle || (isWin ? "You did a fantastic job completing this quest!" : "Don't lose hope, practice makes perfect!")}
        </Text>

        {isWin && xpReward > 0 && (
          <Animated.View 
            entering={ZoomIn.delay(200)}
            style={[
              styles.rewardPill, 
              { 
                backgroundColor: colors.success + '15', 
                borderColor: colors.success + '40',
                borderRadius: borderRadius.round,
                marginBottom: spacing.xl
              }
            ]}
          >
            <Icon name="star" family="FontAwesome5" size={14} color={colors.success} />
            <Text style={[styles.rewardText, { color: colors.success, marginLeft: 8 }]}>+{xpReward} XP Earned</Text>
          </Animated.View>
        )}

        <Animated.View entering={SlideInDown.delay(300)} style={styles.btnRow}>
          <TouchableOpacity 
            onPress={onPrimaryPress}
            style={[
              styles.primaryBtn, 
              { 
                backgroundColor: isWin ? colors.success : colors.error, 
                borderRadius: borderRadius.md,
                padding: spacing.md
              }
            ]}
          >
            <Text style={styles.primaryBtnText}>
              {primaryBtnText || (isWin ? "Continue" : "Try Again")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onSecondaryPress}
            style={[
              styles.secondaryBtn, 
              { 
                borderColor: colors.cardBorder, 
                borderRadius: borderRadius.md,
                padding: spacing.md
              }
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
              {secondaryBtnText || "Exit"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '85%',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.2 }],
    opacity: 0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnRow: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  }
});
