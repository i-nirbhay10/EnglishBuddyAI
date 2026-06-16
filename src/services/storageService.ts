import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@EnglishBuddy_Progress';

export interface UserProgress {
  completedNodes: number;
  xp: number;
  streak: number;
  lastLoginDate?: string;
  weaknesses: string[];
}

export const getProgress = async (): Promise<UserProgress> => {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        completedNodes: typeof parsed.completedNodes === 'number' ? parsed.completedNodes : 0,
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        lastLoginDate: parsed.lastLoginDate,
      };
    }
  } catch (e) {
    console.error('Failed to fetch progress', e);
  }
  return { completedNodes: 0, xp: 0, streak: 0, weaknesses: [] };
};

export const checkDailyLogin = async (): Promise<void> => {
  const progress = await getProgress();
  const today = new Date().toISOString().split('T')[0];
  
  if (progress.lastLoginDate !== today) {
    if (progress.lastLoginDate) {
      const lastDate = new Date(progress.lastLoginDate);
      if (!isNaN(lastDate.getTime())) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          progress.streak = (progress.streak || 0) + 1;
        } else {
          progress.streak = 1; // reset streak
        }
      } else {
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }
    progress.lastLoginDate = today;
    await saveProgress(progress);
  }
};

export const addWeakness = async (weaknessTopic: string): Promise<void> => {
  const progress = await getProgress();
  if (!progress.weaknesses) progress.weaknesses = [];
  
  // keep last 5 weaknesses to avoid prompt bloat
  progress.weaknesses.unshift(weaknessTopic);
  progress.weaknesses = Array.from(new Set(progress.weaknesses)).slice(0, 5);
  await saveProgress(progress);
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
  progress.completedNodes = (progress.completedNodes || 0) + 1;
  progress.xp = (progress.xp || 0) + 50;
  await saveProgress(progress);
};

export const resetProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    await AsyncStorage.removeItem(CHAT_KEY);
  } catch (e) {
    console.error('Failed to reset progress', e);
  }
};

const CHAT_KEY = '@EnglishBuddy_Chat';

export const getChatHistory = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(CHAT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to fetch chat history', e);
  }
  return [];
};

export const saveChatHistory = async (messages: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
};

const PREFS_KEY = '@EnglishBuddy_Prefs';

export interface UserPreferences {
  soundEffects: boolean;
  dailyReminders: boolean;
}

export const getPreferences = async (): Promise<UserPreferences> => {
  try {
    const data = await AsyncStorage.getItem(PREFS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to fetch preferences', e);
  }
  return { soundEffects: true, dailyReminders: true };
};

export const savePreferences = async (prefs: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};
