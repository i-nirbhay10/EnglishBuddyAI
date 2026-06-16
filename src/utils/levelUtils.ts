export const XP_PER_LEVEL = 500;

export const calculateLevel = (xp: number): number => {
  const safeXp = xp || 0;
  return Math.floor(safeXp / XP_PER_LEVEL) + 1;
};

export const calculateLevelProgress = (xp: number) => {
  const safeXp = xp || 0;
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const progressPercent = Math.max(0, Math.min(100, (currentLevelXp / XP_PER_LEVEL) * 100));
  
  return {
    currentLevelXp,
    progressPercent,
    xpRequired: XP_PER_LEVEL
  };
};

export const getLevelTitle = (level: number): string => {
  if (level < 3) return "Novice Learner";
  if (level < 6) return "Intermediate Scholar";
  if (level < 10) return "Advanced Linguist";
  return "Master Wordsmith";
};
