import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProgress, saveProgress } from '../services/storageService';

interface GuessWord {
  word: string;
  hint: string;
  category: string;
}

const guessWords: GuessWord[] = [
  { word: "JOURNEY", hint: "An act of traveling from one place to another.", category: "Travel" },
  { word: "COMPASSION", hint: "Concern for the sufferings of others.", category: "Emotions" },
  { word: "HARMONY", hint: "A state of peaceful agreement or musical chord agreement.", category: "Abstract" },
  { word: "MYSTERY", hint: "Something that is difficult or impossible to understand.", category: "Literature" },
  { word: "CREATIVE", hint: "Involving the imagination or original ideas.", category: "Thinking" },
  { word: "HORIZON", hint: "The line where the earth's surface and the sky meet.", category: "Nature" },
  { word: "WISDOM", hint: "The quality of having experience and good judgment.", category: "Mind" },
  { word: "GENTLE", hint: "Mild in temperament; kind or tender.", category: "Personality" },
  { word: "FREEDOM", hint: "The power or right to act, speak, or think as one wants.", category: "Life" },
  { word: "NOSTALGIA", hint: "A sentimental longing for the past.", category: "Emotions" }
];

export const GuessScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [currentWordObj, setCurrentWordObj] = useState<GuessWord | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lives, setLives] = useState(6);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Load a random word
  const selectRandomWord = () => {
    const available = guessWords.filter(w => !currentWordObj || w.word !== currentWordObj.word);
    const selected = available[Math.floor(Math.random() * available.length)] || guessWords[0];
    setCurrentWordObj(selected);
    setGuessedLetters([]);
    setLives(6);
    setGameState('playing');
  };

  useEffect(() => {
    selectRandomWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoBack = async () => {
    if (score > 0) {
      try {
        const progress = await getProgress();
        progress.xp = (progress.xp || 0) + score * 30; // 30 XP per word guessed
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

  const handleLetterPress = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter) || !currentWordObj) return;

    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);

    const isCorrect = currentWordObj.word.includes(letter);
    if (!isCorrect) {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        setGameState('lost');
      }
    } else {
      // Check if all letters guessed
      const wordLetters = currentWordObj.word.split('');
      const allGuessed = wordLetters.every(char => newGuesses.includes(char));
      if (allGuessed) {
        setGameState('won');
        setScore(prev => prev + 1);
      }
    }
  };

  if (!currentWordObj) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryNeon} />
      </View>
    );
  }

  // Get ASCII Buddy face depending on lives
  const getBuddyFace = () => {
    if (gameState === 'won') return { face: '(≧◡≦)', msg: 'Brilliant! You guessed it!' };
    if (gameState === 'lost') return { face: '(ಥ﹏ಥ)', msg: 'Oh no! The word was ' + currentWordObj.word };
    
    switch (lives) {
      case 6: return { face: '(＾▽＾)', msg: 'Let\'s guess the word!' };
      case 5: return { face: '(●\'◡\'●)', msg: 'Doing great, try another!' };
      case 4: return { face: '(•‿•)', msg: 'Careful now!' };
      case 3: return { face: '(・_・;)', msg: 'Getting close...' };
      case 2: return { face: '(￣ヘ￣)', msg: 'Two tries left!' };
      case 1: return { face: '(｡•́︿•̀｡)', msg: 'Last chance!' };
      default: return { face: '(•_•)', msg: 'Ready?' };
    }
  };

  const buddy = getBuddyFace();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.md }]}>
        <TouchableOpacity onPress={handleGoBack} style={{ padding: 8 }}>
          <Icon name="times" family="FontAwesome5" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={[styles.scorePill, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <Text style={[styles.scoreText, { color: colors.text }]}>Score: {score}</Text>
        </View>

        <View style={styles.livesContainer}>
          <Icon name="heart" family="FontAwesome5" size={20} color={colors.error} />
          <Text style={[styles.livesText, { color: colors.text, marginLeft: 6 }]}>{lives}</Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.prompt, { color: colors.textMuted }]}>Word Guesser</Text>

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '20', borderRadius: borderRadius.sm, marginBottom: spacing.md }]}>
          <Text style={[styles.categoryText, { color: colors.accent }]}>{currentWordObj.category.toUpperCase()}</Text>
        </View>

        {/* Interactive ASCII Buddy */}
        <View style={[styles.buddyCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg }]}>
          <Text style={[styles.buddyFace, { color: colors.primaryNeon }]}>{buddy.face}</Text>
          <Text style={[styles.buddyMsg, { color: colors.text }]}>{buddy.msg}</Text>
        </View>

        {/* Hint Box */}
        <View style={[styles.hintCard, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.xl }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Icon name="lightbulb" family="FontAwesome5" size={16} color={colors.warning} />
            <Text style={[styles.hintTitle, { color: colors.warning, marginLeft: 8 }]}>HINT</Text>
          </View>
          <Text style={[styles.hintText, { color: colors.text }]}>{currentWordObj.hint}</Text>
        </View>

        {/* Secret Word Display */}
        <View style={styles.wordContainer}>
          {currentWordObj.word.split('').map((char, index) => {
            const isDiscovered = guessedLetters.includes(char) || gameState === 'lost';
            return (
              <View 
                key={index} 
                style={[
                  styles.charBox, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: isDiscovered && gameState === 'lost' && !guessedLetters.includes(char) ? colors.error : colors.cardBorder,
                    borderRadius: borderRadius.sm
                  }
                ]}
              >
                <Text style={[styles.charText, { color: isDiscovered && gameState === 'lost' && !guessedLetters.includes(char) ? colors.error : colors.text }]}>
                  {isDiscovered ? char : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Alphabet Keyboard */}
        <View style={[styles.keyboard, { marginTop: spacing.xl }]}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const inWord = currentWordObj.word.includes(letter);
            
            let btnBg = colors.surface;
            let btnBorder = colors.cardBorder;
            let textCol = colors.text;

            if (isGuessed) {
              if (inWord) {
                btnBg = colors.success + '15';
                btnBorder = colors.success;
                textCol = colors.success;
              } else {
                btnBg = colors.surfaceHighlight;
                btnBorder = colors.surfaceHighlight;
                textCol = colors.textMuted;
              }
            }

            return (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.key,
                  {
                    backgroundColor: btnBg,
                    borderColor: btnBorder,
                    borderRadius: borderRadius.sm,
                    opacity: (isGuessed || gameState !== 'playing') ? 0.6 : 1
                  }
                ]}
                onPress={() => handleLetterPress(letter)}
                disabled={isGuessed || gameState !== 'playing'}
              >
                <Text style={[styles.keyText, { color: textCol }]}>{letter}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Play Again Button */}
        {gameState !== 'playing' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primaryNeon, borderRadius: borderRadius.md, marginTop: spacing.xl }]}
            onPress={selectRandomWord}
          >
            <Text style={styles.actionBtnText}>Play Next Word</Text>
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
  scoreText: { fontWeight: 'bold', fontSize: 14 },
  livesContainer: { flexDirection: 'row', alignItems: 'center' },
  livesText: { fontWeight: 'bold', fontSize: 16 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10, paddingBottom: 40 },
  prompt: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  buddyCard: { width: '100%', alignItems: 'center', borderWidth: 1 },
  buddyFace: { fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  buddyMsg: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  hintCard: { width: '100%' },
  hintTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  hintText: { fontSize: 14, lineHeight: 20 },
  wordContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, width: '100%' },
  charBox: { width: 34, height: 42, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  charText: { fontSize: 20, fontWeight: 'bold' },
  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, width: '100%' },
  key: { width: '11%', height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 15, fontWeight: 'bold' },
  actionBtn: { width: '100%', padding: 14, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
