// Habit service - business logic for habits
import { Habit, StreakInfo } from '../types';

export const HabitService = {
  // Create a new habit
  createHabit(name: string, color: string, userId: string): Habit {
    const today = new Date().toISOString().split('T')[0];
    return {
      id: `habit_${Date.now()}`,
      name: name.trim(),
      color,
      completedDates: [],
      createdAt: today,
      userId,
    };
  },

  // Toggle habit completion for today
  toggleHabit(habit: Habit): Habit {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.completedDates.includes(today);
    
    return {
      ...habit,
      completedDates: isCompleted
        ? habit.completedDates.filter(d => d !== today)
        : [...habit.completedDates, today],
    };
  },

  // Calculate streak for a habit
  getStreak(habit: Habit): StreakInfo {
    if (habit.completedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
    }

    // Sort dates in descending order
    const sortedDates = [...habit.completedDates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date();
    
    // Start from today or yesterday
    if (!habit.completedDates.includes(today)) {
      if (!habit.completedDates.includes(yesterday)) {
        currentStreak = 0;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedAsc = [...habit.completedDates].sort();
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: sortedDates[0] || null,
    };
  },

  // Get completion rate for a habit
  getCompletionRate(habit: Habit): number {
    const createdDate = new Date(habit.createdAt);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((today.getTime() - createdDate.getTime()) / 86400000) + 1);
    return Math.round((habit.completedDates.length / totalDays) * 100);
  },
};
