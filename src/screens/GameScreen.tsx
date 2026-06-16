import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { OptionButton } from '../components/OptionButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { generateQuestions, Question } from '../services/aiService';
import { completeNode } from '../services/storageService';

export const GameScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };
  
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
        <TouchableOpacity onPress={handleGoBack} style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md }}>
          <Text style={{ color: colors.text }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestionIndex];
  const promptText = question.type === 'spelling' ? 'Select the correct spelling' : question.type === 'vocabulary' ? 'Select the correct word' : 'Fill in the blank';

  const handleSelectOption = async (option: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (!correct && question.topic) {
      try {
        const { addWeakness } = await import('../services/storageService');
        await addWeakness(question.topic);
      } catch (e) {
        console.error("Failed to save weakness", e);
      }
    }
    
    if (correct) {
      scaleAnimation.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
    } else {
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

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      if (lives <= 0 && !isCorrect) {
        // Game over state
        handleGoBack();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    } else {
      if (lives > 0 || isCorrect) {
        // Finished all questions successfully
        try {
          await completeNode();
        } catch (e) {
          console.error("Failed to save progress", e);
        }
      }
      handleGoBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { padding: spacing.md }]}>
        <TouchableOpacity onPress={handleGoBack} style={{ padding: 8 }}>
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

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.prompt, { color: colors.textMuted }]}>{promptText}</Text>
        
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
      </ScrollView>

      <FeedbackBanner 
        isCorrect={isCorrect}
        correctAnswer={question.correctAnswer}
        explanation={question.explanation}
        lives={lives}
        onContinue={handleNextQuestion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  progressWrapper: { flex: 1, marginHorizontal: 16 },
  livesContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  livesText: { fontWeight: 'bold', fontSize: 16, marginLeft: 6 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40 },
  prompt: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },
  sentenceContainer: { width: '100%', padding: 20, marginBottom: 24, minHeight: 120, justifyContent: 'center', alignItems: 'center' },
  sentenceText: { fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 28 },
  blankSpan: { fontWeight: '700', borderBottomWidth: 2, paddingBottom: 1 },
  optionsContainer: { width: '100%' },
});
