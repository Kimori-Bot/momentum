// Types for Momentum app

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[];
  createdAt: string;
  userId: string;
}

export interface HabitTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'health' | 'productivity' | 'learning' | 'fitness' | 'mindfulness';
}

export interface DailyStats {
  date: string;
  completedCount: number;
  totalCount: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};
