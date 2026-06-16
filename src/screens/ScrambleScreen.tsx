import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { getProgress, saveProgress } from '../services/storageService';

interface ScrambleQuestion {
  sentence: string;
  scrambled: string[];
  explanation: string;
}

const fallbackScrambleQuestions: ScrambleQuestion[] = [
  { sentence: "I am learning English with my phone", scrambled: ["learning", "am", "I", "phone", "with", "my", "English"], explanation: "Subject (I) + verb (am learning) + object (English) + prepositional phrase." },
  { sentence: "She plays the piano very well", scrambled: ["plays", "piano", "the", "She", "well", "very"], explanation: "Adverbs of degree (very) modify adverbs of manner (well)." },
  { sentence: "They are going to the beach tomorrow", scrambled: ["going", "beach", "tomorrow", "to", "are", "the", "They"], explanation: "Future plans using present continuous 'are going to'." },
  { sentence: "He does not like to eat vegetables", scrambled: ["like", "does", "not", "to", "He", "vegetables", "eat"], explanation: "Negative present simple uses auxiliary 'does not' + verb." },
  { sentence: "Where is the nearest post office", scrambled: ["the", "office", "post", "nearest", "is", "Where"], explanation: "Question structure with 'where' + verb 'is' + subject." }
];

export const ScrambleScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const [questions, setQuestions] = useState<ScrambleQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    // Generate questions (could use AI later, currently use fallbacks to keep it offline-friendly and instant)
    const shuffled = fallbackScrambleQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setAvailableWords([...shuffled[0].scrambled].sort(() => 0.5 - Math.random()));
    setIsLoading(false);
  }, []);

  if (isLoading || questions.length === 0) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryNeon} />
      </View>
    );
  }

  const question = questions[currentIdx];

  const handleWordPress = (word: string, index: number) => {
    if (isCorrect !== null) return;
    
    // Add to selected
    setSelectedWords([...selectedWords, word]);
    // Remove from available
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
  };

  const handleSelectedWordPress = (word: string, index: number) => {
    if (isCorrect !== null) return;
    
    // Remove from selected
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    // Add back to available
    setAvailableWords([...availableWords, word]);
  };

  const handleCheck = () => {
    const assembledSentence = selectedWords.join(' ');
    // Simple direct comparison
    const correct = assembledSentence.trim().toLowerCase() === question.sentence.trim().toLowerCase();
    setIsCorrect(correct);
    
    if (!correct) {
      setLives(prev => prev - 1);
    }
  };

  const handleContinue = async () => {
    if (currentIdx < questions.length - 1) {
      if (lives <= 0 && !isCorrect) {
        handleGoBack();
      } else {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setSelectedWords([]);
        setAvailableWords([...questions[nextIdx].scrambled].sort(() => 0.5 - Math.random()));
        setIsCorrect(null);
      }
    } else {
      if (lives > 0 || isCorrect) {
        try {
          const progress = await getProgress();
          progress.xp = (progress.xp || 0) + 100; // Reward for scrambled sentences completion
          await saveProgress(progress);
        } catch (e) {
          console.error(e);
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
          <ProgressBar progress={(currentIdx / questions.length) * 100} color={colors.success} />
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
        <Text style={[styles.prompt, { color: colors.textMuted }]}>Build the Sentence</Text>
        
        {/* Selected Words Area (Sentence Builder Board) */}
        <View style={[styles.board, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.xl }]}>
          {selectedWords.length === 0 ? (
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Tap words below to build the sentence...</Text>
          ) : (
            <View style={styles.wordsRow}>
              {selectedWords.map((word, index) => (
                <TouchableOpacity
                  key={`selected-${index}`}
                  style={[styles.wordCard, { backgroundColor: colors.primaryNeon, borderRadius: borderRadius.md }]}
                  onPress={() => handleSelectedWordPress(word, index)}
                >
                  <Text style={styles.wordTextSelected}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />

        {/* Available Words Area */}
        <View style={styles.wordsRow}>
          {availableWords.map((word, index) => (
            <TouchableOpacity
              key={`available-${index}`}
              style={[styles.wordCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.md }]}
              onPress={() => handleWordPress(word, index)}
            >
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        {isCorrect === null && (
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: selectedWords.length === 0 ? colors.surfaceHighlight : colors.primary,
                borderRadius: borderRadius.round
              }
            ]}
            disabled={selectedWords.length === 0}
            onPress={handleCheck}
          >
            <Text style={[styles.checkButtonText, { color: selectedWords.length === 0 ? colors.textMuted : '#FFF' }]}>
              Check Answer
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <FeedbackBanner 
        isCorrect={isCorrect}
        correctAnswer={question.sentence}
        explanation={question.explanation}
        lives={lives}
        onContinue={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  progressWrapper: { flex: 1, marginHorizontal: 16 },
  livesContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  livesText: { fontWeight: 'bold', fontSize: 16, marginLeft: 6 },
  content: { flexGrow: 1, alignItems: 'stretch', justifyContent: 'flex-start', paddingTop: 16, paddingBottom: 40 },
  prompt: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16, textAlign: 'center' },
  board: {
    minHeight: 150,
    width: '100%',
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 15,
    textAlign: 'center'
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  wordCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500'
  },
  wordTextSelected: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF'
  },
  checkButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});
