import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProgress, saveProgress } from '../services/storageService';

interface ConnectPuzzle {
  letters: string[];
  words: string[];
}

const puzzles: ConnectPuzzle[] = [
  { letters: ["A", "E", "T", "R"], words: ["RATE", "TEAR", "EAT", "TEA", "ART", "ARE", "ERA", "EAR", "RAT", "TAR"] },
  { letters: ["O", "W", "L", "B"], words: ["BOWL", "BLOW", "LOB", "BOW", "LOW", "OWL"] },
  { letters: ["S", "T", "A", "R"], words: ["STAR", "ARTS", "RATS", "TARS", "ART", "RAT", "TAR", "SAT"] },
  { letters: ["I", "N", "K", "S"], words: ["SKIN", "SINK", "INKS", "INK", "SIN", "KIN"] },
  { letters: ["E", "P", "N", "S"], words: ["PENS", "PEN", "PIN", "SIP", "NIP", "SEN"] }
];

export const ConnectScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [currentPuzzle, setCurrentPuzzle] = useState<ConnectPuzzle | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  // Initialize a puzzle
  const initPuzzle = useCallback((index: number) => {
    const puzzle = puzzles[index % puzzles.length];
    setCurrentPuzzle(puzzle);
    setShuffledLetters([...puzzle.letters].sort(() => 0.5 - Math.random()));
    setSelectedIndices([]);
    setFoundWords([]);
    setInputWord('');
    setFeedbackMsg('');
    setFeedbackType('');
  }, []);

  useEffect(() => {
    initPuzzle(0);
  }, [initPuzzle]);

  const handleGoBack = async () => {
    if (totalXpEarned > 0) {
      try {
        const progress = await getProgress();
        progress.xp = (progress.xp || 0) + totalXpEarned;
        await saveProgress(progress);
      } catch (e) {
        console.error(e);
      }
    }
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleLetterPress = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Deselect last letter if clicked again
      if (selectedIndices[selectedIndices.length - 1] === index) {
        setSelectedIndices(prev => prev.slice(0, -1));
        setInputWord(prev => prev.slice(0, -1));
      }
      return;
    }

    const newIndices = [...selectedIndices, index];
    setSelectedIndices(newIndices);
    setInputWord(prev => prev + shuffledLetters[index]);
    setFeedbackMsg('');
    setFeedbackType('');
  };

  const handleShuffle = () => {
    setShuffledLetters(prev => [...prev].sort(() => 0.5 - Math.random()));
    setSelectedIndices([]);
    setInputWord('');
  };

  const handleClear = () => {
    setSelectedIndices([]);
    setInputWord('');
    setFeedbackMsg('');
    setFeedbackType('');
  };

  const handleSubmit = () => {
    if (!currentPuzzle || !inputWord) return;

    const wordUpper = inputWord.toUpperCase();

    if (foundWords.includes(wordUpper)) {
      setFeedbackMsg('Already found!');
      setFeedbackType('error');
    } else if (currentPuzzle.words.includes(wordUpper)) {
      // Correct Word!
      const newFound = [...foundWords, wordUpper];
      setFoundWords(newFound);
      setTotalXpEarned(prev => prev + 20); // 20 XP per word
      setFeedbackMsg('Correct! +20 XP');
      setFeedbackType('success');
      
      // Clear current input
      setSelectedIndices([]);
      setInputWord('');

      // Check if all target words are found
      if (newFound.length === currentPuzzle.words.length) {
        setTotalXpEarned(prev => prev + 50); // bonus XP
        setFeedbackMsg('Puzzles Cleared! +50 XP Bonus!');
      }
    } else {
      // Wrong Word
      setFeedbackMsg('Not in the word list!');
      setFeedbackType('error');
      // Shake or reset input
      setSelectedIndices([]);
      setInputWord('');
    }
  };

  const loadNextPuzzle = () => {
    const nextIdx = puzzleIndex + 1;
    setPuzzleIndex(nextIdx);
    initPuzzle(nextIdx);
  };

  if (!currentPuzzle) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryNeon} />
      </View>
    );
  }

  const isAllFound = foundWords.length === currentPuzzle.words.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.md }]}>
        <TouchableOpacity onPress={handleGoBack} style={{ padding: 8 }}>
          <Icon name="times" family="FontAwesome5" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={[styles.scorePill, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <Text style={[styles.scoreText, { color: colors.text }]}>
            Found: {foundWords.length} / {currentPuzzle.words.length}
          </Text>
        </View>

        <View style={[styles.scorePill, { backgroundColor: colors.primary + '15', borderRadius: borderRadius.round }]}>
          <Text style={[styles.scoreText, { color: colors.primaryNeon }]}>+{totalXpEarned} XP</Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.prompt, { color: colors.textMuted }]}>Word Connect</Text>
        <Text style={[styles.subPrompt, { color: colors.text, marginBottom: spacing.lg }]}>
          Tap letters to form English words!
        </Text>

        {/* Word Targets Placeholder Grid */}
        <View style={styles.gridContainer}>
          {currentPuzzle.words.map((word, index) => {
            const isDiscovered = foundWords.includes(word);
            return (
              <View 
                key={index} 
                style={[
                  styles.wordRow, 
                  { 
                    backgroundColor: isDiscovered ? colors.success + '15' : colors.surface, 
                    borderColor: isDiscovered ? colors.success : colors.cardBorder,
                    borderRadius: borderRadius.sm
                  }
                ]}
              >
                <Text style={[styles.wordRowText, { color: isDiscovered ? colors.success : colors.textMuted }]}>
                  {isDiscovered ? word : word.split('').map(() => '_').join(' ')}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Input word show */}
        <View style={[styles.inputDisplay, { borderColor: colors.cardBorder, borderRadius: borderRadius.md, minHeight: 48 }]}>
          <Text style={[styles.inputDisplayText, { color: colors.text }]}>{inputWord || ' '}</Text>
        </View>

        {/* Feedback Message */}
        {feedbackMsg ? (
          <Text style={[
            styles.feedbackText, 
            { 
              color: feedbackType === 'success' ? colors.success : colors.error,
              marginBottom: spacing.md
            }
          ]}>
            {feedbackMsg}
          </Text>
        ) : null}

        {/* Circle of Letters */}
        <View style={styles.wheelContainer}>
          {shuffledLetters.map((letter, index) => {
            const isSelected = selectedIndices.includes(index);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.wheelLetter,
                  {
                    backgroundColor: isSelected ? colors.primaryNeon : colors.surface,
                    borderColor: isSelected ? colors.primaryNeon : colors.cardBorder,
                    borderRadius: borderRadius.round,
                  }
                ]}
                onPress={() => handleLetterPress(index)}
              >
                <Text style={[styles.wheelLetterText, { color: isSelected ? '#FFF' : colors.text }]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Controls */}
        <View style={[styles.controls, { marginTop: spacing.lg }]}>
          <TouchableOpacity onPress={handleShuffle} style={[styles.controlBtn, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
            <Icon name="random" family="FontAwesome5" size={16} color={colors.text} />
            <Text style={[styles.controlBtnText, { color: colors.text, marginLeft: 6 }]}>Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClear} style={[styles.controlBtn, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
            <Icon name="eraser" family="FontAwesome5" size={16} color={colors.text} />
            <Text style={[styles.controlBtnText, { color: colors.text, marginLeft: 6 }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Submit or Next Puzzle actions */}
        {isAllFound ? (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.success, borderRadius: borderRadius.md, marginTop: spacing.xl }]}
            onPress={loadNextPuzzle}
          >
            <Text style={styles.actionBtnText}>Next Puzzle</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primaryNeon, borderRadius: borderRadius.md, marginTop: spacing.xl }]}
            onPress={handleSubmit}
            disabled={!inputWord}
          >
            <Text style={styles.actionBtnText}>Submit Word</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  scorePill: { paddingHorizontal: 14, paddingVertical: 6 },
  scoreText: { fontWeight: 'bold', fontSize: 13 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10, paddingBottom: 40 },
  prompt: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  subPrompt: { fontSize: 14, fontWeight: '500' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%', marginBottom: 20 },
  wordRow: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, minWidth: 70, alignItems: 'center' },
  wordRowText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5 },
  inputDisplay: { width: '80%', padding: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  inputDisplayText: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  feedbackText: { fontSize: 14, fontWeight: 'bold' },
  wheelContainer: { flexDirection: 'row', justifyContent: 'center', gap: 14, width: '100%', marginVertical: 10 },
  wheelLetter: { width: 56, height: 56, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  wheelLetterText: { fontSize: 22, fontWeight: 'bold' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16, width: '100%' },
  controlBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  controlBtnText: { fontSize: 13, fontWeight: '700' },
  actionBtn: { width: '100%', padding: 14, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
