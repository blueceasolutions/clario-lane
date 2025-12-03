import { create } from "zustand";
import type {
  Achievement,
  Quest,
  UserAchievement,
  UserQuest,
  UserStats,
} from "@/types";

interface GamificationState {
  stats: UserStats | null;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  quests: Quest[];
  userQuests: UserQuest[];
  isLoading: boolean;

  // Modal State
  victoryModal: {
    isOpen: boolean;
    data: {
      xpGained: number;
      wordsRead: number;
      timeSpentSeconds: number;
      currentLevel: number;
      currentXP: number;
      isLevelUp: boolean;
      newAchievements?: { achievement_id: string; title?: string }[];
    } | null;
  };
  levelUpModal: {
    isOpen: boolean;
    newLevel: number;
  };

  setStats: (stats: UserStats | null) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setUserAchievements: (userAchievements: UserAchievement[]) => void;
  setQuests: (quests: Quest[]) => void;
  setUserQuests: (userQuests: UserQuest[]) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Modal Actions
  openVictoryModal: (data: GamificationState["victoryModal"]["data"]) => void;
  closeVictoryModal: () => void;
  openLevelUpModal: (newLevel: number) => void;
  closeLevelUpModal: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  stats: null,
  achievements: [],
  userAchievements: [],
  quests: [],
  userQuests: [],
  isLoading: true,

  victoryModal: {
    isOpen: false,
    data: null,
  },
  levelUpModal: {
    isOpen: false,
    newLevel: 1,
  },

  setStats: (stats) => set({ stats }),
  setAchievements: (achievements) => set({ achievements }),
  setUserAchievements: (userAchievements) => set({ userAchievements }),
  setQuests: (quests) => set({ quests }),
  setUserQuests: (userQuests) => set({ userQuests }),
  setIsLoading: (isLoading) => set({ isLoading }),

  openVictoryModal: (data) => set({ victoryModal: { isOpen: true, data } }),
  closeVictoryModal: () => set({ victoryModal: { isOpen: false, data: null } }),
  openLevelUpModal: (newLevel) =>
    set({ levelUpModal: { isOpen: true, newLevel } }),
  closeLevelUpModal: () =>
    set({ levelUpModal: { isOpen: false, newLevel: 1 } }),
}));
