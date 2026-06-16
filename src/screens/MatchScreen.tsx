import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { getProgress, saveProgress } from '../services/storageService';

interface MatchItem {
  id: string;
  text: string;
  type: 'word' | 'meaning';
  pairId: string;
}

interface MatchPair {
  word: string;
  meaning: string;
  explanation: string;
}

const fallbackMatchPairs: MatchPair[] = [
  { word: "Enormous", meaning: "Extremely large", explanation: "'Enormous' means huge or immense in size." },
  { word: "Precise", meaning: "Exact and accurate", explanation: "'Precise' refers to details that are strict and clear." },
  { word: "Elated", meaning: "Extremely happy", explanation: "'Elated' describes being in high spirits or ecstatic." },
  { word: "Doubtful", meaning: "Uncertain or unlikely", explanation: "'Doubtful' means feeling disbelief or hesitancy." },
  { word: "Trivial", meaning: "Of little value or importance", explanation: "'Trivial' means minor or insignificant." },
  { word: "Courageous", meaning: "Brave and bold", explanation: "'Courageous' describes showing courage in difficulty." },
  { word: "Hostile", meaning: "Unfriendly and aggressive", explanation: "'Hostile' refers to an antagonistic attitude." },
  { word: "Diligent", meaning: "Hardworking and careful", explanation: "'Diligent' refers to steady, earnest effort." }
];

export const MatchScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentPair, setCurrentPair] = useState<MatchPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    // Select 4 random pairs from fallbackMatchPairs
    const shuffledPairs = [...fallbackMatchPairs].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Create cards for words and definitions
    const cards: MatchItem[] = [];
    shuffledPairs.forEach((pair, idx) => {
      const pairId = idx.toString();
      cards.push({ id: `word-${pairId}`, text: pair.word, type: 'word', pairId });
      cards.push({ id: `meaning-${pairId}`, text: pair.meaning, type: 'meaning', pairId });
    });

    // Shuffle cards
    setItems(cards.sort(() => 0.5 - Math.random()));
    setIsLoading(false);
  }, []);

  const handleGoBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleCardPress = (id: string) => {
    if (matchedIds.includes(id) || failedIds.includes(id) || lives <= 0) return;
    
    // Reset failed cards immediately on tap
    if (failedIds.length > 0) {
      setFailedIds([]);
    }

    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      // We have two cards selected
      const firstItem = items.find(item => item.id === selectedId);
      const secondItem = items.find(item => item.id === id);

      if (firstItem && secondItem) {
        // Must be of different types (one word, one meaning)
        if (firstItem.type !== secondItem.type) {
          if (firstItem.pairId === secondItem.pairId) {
            // Correct Match!
            const newMatches = [...matchedIds, firstItem.id, secondItem.id];
            setMatchedIds(newMatches);
            setSelectedId(null);

            // Fetch the details for the feedback banner
            const originalPairs = fallbackMatchPairs.filter(p => p.word === firstItem.text || p.word === secondItem.text);
            if (originalPairs.length > 0) {
              setCurrentPair(originalPairs[0]);
            }
            setIsCorrect(true);
          } else {
            // Wrong Match!
            setFailedIds([firstItem.id, secondItem.id]);
            setSelectedId(null);
            setLives(prev => prev - 1);
            setIsCorrect(false);
            
            // Set current wrong pair for error feedback
            const wordItem = firstItem.type === 'word' ? firstItem : secondItem;
            const originalPairs = fallbackMatchPairs.filter(p => p.word === wordItem.text);
            if (originalPairs.length > 0) {
              setCurrentPair(originalPairs[0]);
            }
          }
        } else {
          // If tapping another card of same type, just select the new one
          setSelectedId(id);
        }
      }
    }
  };

  const handleContinue = async () => {
    setIsCorrect(null);
    setCurrentPair(null);
    setFailedIds([]);

    if (lives <= 0) {
      handleGoBack();
      return;
    }

    // Check if game won
    if (matchedIds.length === items.length && items.length > 0) {
      try {
        const progress = await getProgress();
        progress.xp = (progress.xp || 0) + 120; // Match Game Reward
        await saveProgress(progress);
      } catch (e) {
        console.error(e);
      }
      handleGoBack();
    }
  };

  if (isLoading || items.length === 0) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryNeon} />
      </View>
    );
  }

  const progressPercent = (matchedIds.length / items.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { padding: spacing.md }]}>
        <TouchableOpacity onPress={handleGoBack} style={{ padding: 8 }}>
          <Icon name="times" family="FontAwesome5" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <ProgressBar progress={progressPercent} color={colors.success} />
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
        <Text style={[styles.prompt, { color: colors.textMuted }]}>Vocabulary Match</Text>
        <Text style={[styles.subPrompt, { color: colors.text, marginBottom: spacing.lg }]}>
          Match the words on the left or right with their correct meanings!
        </Text>

        <View style={styles.gridContainer}>
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const isMatched = matchedIds.includes(item.id);
            const isFailed = failedIds.includes(item.id);

            let cardBg = colors.surface;
            let cardBorderColor = colors.cardBorder;
            
            if (isSelected) {
              cardBg = colors.surfaceHighlight;
              cardBorderColor = colors.primaryNeon;
            } else if (isMatched) {
              cardBg = colors.success + '15';
              cardBorderColor = colors.success;
            } else if (isFailed) {
              cardBg = colors.error + '15';
              cardBorderColor = colors.error;
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: cardBg,
                    borderColor: cardBorderColor,
                    borderRadius: borderRadius.md,
                    opacity: isMatched ? 0.6 : 1,
                  }
                ]}
                onPress={() => handleCardPress(item.id)}
                disabled={isMatched}
              >
                <Text 
                  style={[
                    styles.cardText, 
                    { 
                      color: isMatched ? colors.success : isFailed ? colors.error : colors.text 
                    }
                  ]}
                  numberOfLines={4}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <FeedbackBanner 
        isCorrect={isCorrect}
        correctAnswer={currentPair ? `${currentPair.word}: ${currentPair.meaning}` : ''}
        explanation={currentPair ? currentPair.explanation : ''}
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
  prompt: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, textAlign: 'center' },
  subPrompt: { fontSize: 15, textAlign: 'center', fontWeight: '500' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    minHeight: 100,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  }
});
