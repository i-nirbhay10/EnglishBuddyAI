import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../services/storageService';

const baseRegions = [
  { id: 1, name: 'Beginner Kingdom', levels: 5 },
  { id: 2, name: 'Grammar Forest', levels: 6 },
  { id: 3, name: 'Vocabulary Valley', levels: 4 },
  { id: 4, name: 'Speaking Arena', levels: 3 },
  { id: 5, name: 'Writing Castle', levels: 5 },
];

export const MapScreen = ({ navigation }: any) => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [completedNodes, setCompletedNodes] = useState(0);
  const [xp, setXp] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        const progress = await getProgress();
        setCompletedNodes(progress.completedNodes);
        setXp(progress.xp);
      };
      loadProgress();
    }, [])
  );

  let nodesPassed = 0;
  const regions = baseRegions.map((r) => {
    const regionStartNode = nodesPassed;
    const regionEndNode = nodesPassed + r.levels - 1;

    const unlocked = completedNodes >= regionStartNode;

    let currentLevel = 0;
    if (completedNodes > regionEndNode) {
      currentLevel = r.levels;
    } else if (completedNodes >= regionStartNode) {
      currentLevel = completedNodes - regionStartNode;
    }

    nodesPassed += r.levels;
    return { ...r, unlocked, currentLevel };
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingBottom: insets.bottom + spacing.xxl * 2,
        }
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.lg, marginBottom: spacing.xl }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>World Map</Text>
        <View style={[styles.energyBadge, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <Icon name="star" family="FontAwesome5" size={16} color={colors.warning} />
          <Text style={[styles.energyText, { color: colors.text }]}>{xp} XP</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {regions.map((region, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <View key={region.id} style={styles.regionWrapper}>
              <View style={[styles.regionCard, { backgroundColor: region.unlocked ? colors.surface : colors.background, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <View style={styles.regionHeader}>
                  <Text style={[styles.regionName, { color: region.unlocked ? colors.text : colors.textMuted }]}>
                    {region.name}
                  </Text>
                  {!region.unlocked && <Icon name="lock" family="FontAwesome5" size={16} color={colors.textMuted} />}
                </View>

                {region.unlocked && (
                  <View style={styles.levelsContainer}>
                    {Array.from({ length: region.levels }).map((_, levelIdx) => {
                      const isCompleted = levelIdx < region.currentLevel;
                      const isCurrent = levelIdx === region.currentLevel;
                      const isLocked = levelIdx > region.currentLevel;

                      let nodeColor = colors.surfaceHighlight;
                      let iconName = 'lock';
                      let iconColor = colors.textMuted;

                      if (isCompleted) {
                        nodeColor = colors.success;
                        iconName = 'star';
                        iconColor = '#FFF';
                      } else if (isCurrent) {
                        nodeColor = colors.primaryNeon;
                        iconName = 'play';
                        iconColor = '#FFF';
                      }

                      return (
                        <React.Fragment key={`level-${levelIdx}`}>
                          <TouchableOpacity
                            style={[
                              styles.levelNode,
                              {
                                backgroundColor: nodeColor,
                                borderColor: isCurrent ? colors.text : 'transparent',
                                borderWidth: isCurrent ? 2 : 0,
                                transform: [{ scale: isCurrent ? 1.2 : 1 }]
                              }
                            ]}
                            disabled={isLocked}
                            activeOpacity={0.7}
                            onPress={() => {
                              if (isCurrent || isCompleted) {
                                navigation.navigate('GameScreen');
                              }
                            }}
                          >
                            <Icon name={iconName} family="FontAwesome5" size={12} color={iconColor} />
                          </TouchableOpacity>

                          {levelIdx < region.levels - 1 && (
                            <View style={[styles.pathLine, { backgroundColor: isCompleted ? colors.success : colors.surfaceHighlight }]} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Connector between regions */}
              {index < regions.length - 1 && (
                <View style={[
                  styles.regionConnector,
                  {
                    backgroundColor: regions[index + 1].unlocked ? colors.success : colors.surfaceHighlight,
                    alignSelf: isReversed ? 'flex-start' : 'flex-end',
                    marginLeft: isReversed ? spacing.xxl : 0,
                    marginRight: isReversed ? 0 : spacing.xxl,
                  }
                ]} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  energyText: {
    fontWeight: 'bold',
    marginLeft: 6,
  },
  mapContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  regionWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  regionCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    marginBottom: 0, // Margin is handled by the connector
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  regionName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathLine: {
    flex: 1,
    height: 4,
    minWidth: 10,
    borderRadius: 2,
  },
  regionConnector: {
    width: 4,
    height: 40,
    marginVertical: 4,
  },
});
