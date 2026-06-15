import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { generateQuestions, Question } from '../services/aiService';

export const GameScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await generateQuestions(5, 5); // Level 5, 5 questions
        setQuestions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const shakeAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shakeAnimation.value },
        { scale: scaleAnimation.value }
      ],
    };
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryNeon} />
        <Text style={[styles.loadingText, { color: colors.textMuted, marginTop: spacing.md }]}>Generating dynamic AI questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>Failed to load questions.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md }}>
          <Text style={{ color: colors.text }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    
    if (option === question.correctAnswer) {
      setIsCorrect(true);
      scaleAnimation.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    } else {
      setIsCorrect(false);
      setLives(prev => prev - 1);
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      if (lives <= 0 && !isCorrect) {
        // Game over state
        navigation.goBack();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { padding: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="times" family="FontAwesome5" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <ProgressBar progress={(currentQuestionIndex / questions.length) * 100} color={colors.success} />
        </View>

        <View style={styles.livesContainer}>
          <Icon name="heart" family="FontAwesome5" size={20} color={colors.error} />
          <Text style={[styles.livesText, { color: colors.text }]}>{lives}</Text>
        </View>
      </View>

      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text style={[styles.prompt, { color: colors.textMuted }]}>Fill in the blank</Text>
        
        <Animated.View style={[styles.sentenceContainer, animatedStyle, { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5, borderRadius: borderRadius.xl }]}>
          <Text style={[styles.sentenceText, { color: colors.text }]}>
            {question.sentence.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <Text style={[
                    styles.blankSpan, 
                    { 
                      color: selectedAnswer 
                        ? (isCorrect === true ? colors.success : (isCorrect === false ? colors.error : colors.primaryNeon)) 
                        : colors.primaryNeon,
                      borderBottomColor: selectedAnswer 
                        ? (isCorrect === true ? colors.success : (isCorrect === false ? colors.error : colors.primaryNeon)) 
                        : colors.primaryNeon,
                    }
                  ]}>
                    {selectedAnswer ? ` ${selectedAnswer} ` : '          '}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              index={index}
              option={option}
              isSelected={selectedAnswer === option}
              isCorrect={isCorrect}
              onPress={() => handleSelectOption(option)}
              disabled={selectedAnswer !== null && isCorrect === true}
            />
          ))}
        </View>
      </View>

      {isCorrect === false && (
        <Animated.View style={[styles.feedbackContainer, { backgroundColor: colors.error + '10', borderTopColor: colors.error + '30', padding: spacing.xl, borderTopWidth: 1 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="times-circle" family="FontAwesome5" size={24} color={colors.error} />
            <Text style={[styles.feedbackTitle, { color: colors.error, marginLeft: 8 }]}>Incorrect</Text>
          </View>
          <Text style={[styles.feedbackText, { color: colors.text, marginBottom: spacing.lg }]}>The correct answer is <Text style={{fontWeight: 'bold', color: colors.success}}>{question.correctAnswer}</Text></Text>
          <TouchableOpacity 
            style={[styles.continueButton, { backgroundColor: colors.error, borderRadius: borderRadius.round, shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
            onPress={handleNextQuestion}
          >
            <Text style={styles.continueButtonText}>{lives <= 0 ? "Game Over" : "Got it"}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const OptionButton = ({ option, index, isSelected, isCorrect, onPress, disabled }: any) => {
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
  container: { flex: 1 },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  progressWrapper: { flex: 1, marginHorizontal: 20 },
  livesContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  livesText: { fontWeight: 'bold', fontSize: 18, marginLeft: 6 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  prompt: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 },
  sentenceContainer: { width: '100%', padding: 32, marginBottom: 40, minHeight: 180, justifyContent: 'center', alignItems: 'center' },
  sentenceText: { fontSize: 24, fontWeight: '600', textAlign: 'center', lineHeight: 36 },
  blankSpan: { fontWeight: '700', borderBottomWidth: 3, paddingBottom: 2 },
  optionsContainer: { width: '100%' },
  optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingRight: 20, borderWidth: 2 },
  letterCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  letterText: { fontSize: 14, fontWeight: 'bold' },
  optionText: { fontSize: 18, fontWeight: '600' },
  feedbackContainer: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  feedbackTitle: { fontSize: 22, fontWeight: '800' },
  feedbackText: { fontSize: 16, lineHeight: 24 },
  continueButton: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
});
