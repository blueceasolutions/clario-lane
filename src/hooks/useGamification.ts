import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "@/integration/queries/fetchUserStats";
import {
  fetchAchievements,
  fetchUserAchievements,
} from "@/integration/queries/fetchAchievements";
import {
  fetchQuests,
  fetchUserQuests,
} from "@/integration/queries/fetchQuests";
import { supabaseService } from "~supabase/clientServices";
import { useEffect, useState } from "react";
import { useGamificationStore } from "@/store/gamification/useGamificationStore";

export function useGamification(propUserId?: string) {
  const [fetchedUserId, setFetchedUserId] = useState<string | undefined>(
    undefined,
  );
  const userId = propUserId || fetchedUserId;

  // Store actions
  const {
    setStats,
    setAchievements,
    setUserAchievements,
    setQuests,
    setUserQuests,
    setIsLoading,
  } = useGamificationStore();

  useEffect(() => {
    if (!propUserId) {
      supabaseService.getSession().then((session) => {
        setFetchedUserId(session?.user?.id);
      });
    }
  }, [propUserId]);

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    fetchUserStats(userId),
  );

  const { data: allAchievements, isLoading: isLoadingAllAchievements } =
    useQuery(fetchAchievements);
  const { data: userAchievements, isLoading: isLoadingUserAchievements } =
    useQuery(fetchUserAchievements(userId));

  const { data: allQuests, isLoading: isLoadingAllQuests } = useQuery(
    fetchQuests,
  );
  const { data: userQuests, isLoading: isLoadingUserQuests } = useQuery(
    fetchUserQuests(userId),
  );

  const isLoading = isLoadingStats || isLoadingAllAchievements ||
    isLoadingUserAchievements || isLoadingAllQuests || isLoadingUserQuests;

  // Sync with store
  useEffect(() => {
    if (stats !== undefined) setStats(stats || null);
    if (allAchievements !== undefined) setAchievements(allAchievements);
    if (userAchievements !== undefined) setUserAchievements(userAchievements);
    if (allQuests !== undefined) setQuests(allQuests);
    if (userQuests !== undefined) setUserQuests(userQuests);
    setIsLoading(isLoading);
  }, [
    stats,
    allAchievements,
    userAchievements,
    allQuests,
    userQuests,
    isLoading,
    setStats,
    setAchievements,
    setUserAchievements,
    setQuests,
    setUserQuests,
    setIsLoading,
  ]);

  // Helper to check if an achievement is unlocked
  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements?.some((ua) =>
      ua.achievement_id === achievementId
    ) ?? false;
  };

  // Helper to get quest progress
  const getQuestProgress = (questId: string) => {
    return userQuests?.find((uq) => uq.quest_id === questId);
  };

  return {
    stats,
    achievements: {
      all: allAchievements,
      unlocked: userAchievements,
      isUnlocked: isAchievementUnlocked,
    },
    quests: {
      all: allQuests,
      userProgress: userQuests,
      getProgress: getQuestProgress,
    },
    isLoading,
  };
}
