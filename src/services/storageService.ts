import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@EnglishBuddy_Progress';

export interface UserProgress {
  completedNodes: number;
  xp: number;
}

export const getProgress = async (): Promise<UserProgress> => {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to fetch progress', e);
  }
  return { completedNodes: 0, xp: 0 };
};

export const saveProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

export const completeNode = async (): Promise<void> => {
  const progress = await getProgress();
  progress.completedNodes += 1;
  progress.xp += 50;
  await saveProgress(progress);
};
