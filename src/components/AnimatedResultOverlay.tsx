import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import Animated, {
  ZoomIn, FadeIn, FadeInUp, BounceIn, SlideInDown,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence
} from 'react-native-reanimated';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

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

  const pulseAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      pulseAnim.value = 1;
      rotateAnim.value = 0;
    }
  }, [visible, pulseAnim, rotateAnim]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnim.value },
      { rotateZ: `${rotateAnim.value}deg` }
    ],
  }));

  const isWin = type === 'win';
  const mainColor = isWin ? colors.success : colors.error;
  const lightColor = isWin ? '#34d399' : '#f87171'; // Lighter variants for gradient

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onSecondaryPress}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.overlay, { backgroundColor: 'rgba(10, 15, 25, 0.48)' }]}
      >
        <Animated.View
          entering={FadeInUp.duration(600).springify().damping(15).stiffness(120)}
          style={styles.cardContainer}
        >
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={[styles.card, { borderRadius: borderRadius.xl, borderColor: mainColor + '50' }]}
          >
            {/* Header Graphic */}
            <Animated.View entering={BounceIn.delay(300).springify()} style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.glowStar,
                  glowStyle,
                  { backgroundColor: mainColor + '25', borderRadius: borderRadius.round }
                ]}
              />
              <View style={[styles.iconInner, { backgroundColor: mainColor + '15', borderRadius: borderRadius.round }]}>
                <Icon
                  name={isWin ? "trophy" : "times-circle"}
                  family="FontAwesome5"
                  size={52}
                  color={isWin ? colors.warning : colors.error}
                />
              </View>
            </Animated.View>

            <Text style={[styles.title, { color: colors.text }]}>
              {title || (isWin ? "Victory!" : "Game Over")}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted, marginBottom: spacing.xl }]}>
              {subtitle || (isWin ? "Outstanding work! You've mastered this challenge." : "Don't give up! Every mistake is a learning step.")}
            </Text>

            {isWin && xpReward > 0 && (
              <Animated.View
                entering={ZoomIn.delay(500).springify().damping(12)}
                style={[
                  styles.rewardPill,
                  {
                    backgroundColor: colors.success + '15',
                    borderColor: colors.success + '40',
                    borderRadius: borderRadius.round,
                    marginBottom: spacing.xxl
                  }
                ]}
              >
                <Icon name="star" family="FontAwesome5" size={16} color={colors.success} solid />
                <Text style={[styles.rewardText, { color: colors.success, marginLeft: 8 }]}>+{xpReward} XP</Text>
              </Animated.View>
            )}

            <Animated.View entering={SlideInDown.delay(700).springify()} style={styles.btnRow}>
              <TouchableOpacity
                onPress={onPrimaryPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[lightColor, mainColor]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.primaryBtn, { borderRadius: borderRadius.lg, padding: spacing.md }]}
                >
                  <Text style={styles.primaryBtnText}>
                    {primaryBtnText || (isWin ? "Continue" : "Try Again")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSecondaryPress}
                style={[
                  styles.secondaryBtn,
                  {
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md
                  }
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
                  {secondaryBtnText || "Exit to Menu"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  cardContainer: {
    width: width * 0.88,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 24,
  },
  card: {
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glowStar: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.4 }],
  },
  iconInner: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    opacity: 0.9,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnRow: {
    width: '100%',
    gap: 14,
  },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
