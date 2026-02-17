// Advanced Analytics Screen (Premium Feature)
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Habit } from '../types';
import { COLORS } from '../constants';
import { HabitService } from '../services/habit';
import { StatsBox } from '../components/StatsBox';

interface AnalyticsScreenProps {
  habits: Habit[];
  isPremium: boolean;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ habits, isPremium }) => {
  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedEmoji}>🔒</Text>
        <Text style={styles.lockedTitle}>Premium Analytics</Text>
        <Text style={styles.lockedText}>
          Upgrade to Premium to unlock advanced analytics, trends, and insights.
        </Text>
      </View>
    );
  }

  // Calculate analytics
  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const avgCompletionRate = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + HabitService.getCompletionRate(h), 0) / habits.length)
    : 0;
  const bestStreak = habits.length > 0
    ? Math.max(...habits.map(h => HabitService.getStreak(h).longestStreak))
    : 0;

  // Weekly progress (last 7 days)
  const weekProgress: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayCompletions = habits.filter(h => h.completedDates.includes(dateStr)).length;
    weekProgress.push(dayCompletions);
  }

  const maxWeekProgress = Math.max(...weekProgress, 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your habit insights</Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.statsGrid}>
        <StatsBox value={totalCompletions} label="Total Completions" />
        <StatsBox value={avgCompletionRate + '%'} label="Avg. Rate" />
        <StatsBox value={bestStreak} label="Best Streak" />
      </View>

      {/* Weekly Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.chart}>
          {weekProgress.map((count, i) => {
            const day = new Date();
            day.setDate(day.getDate() - (6 - i));
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const height = (count / maxWeekProgress) * 100;
            
            return (
              <View key={i} style={styles.chartBar}>
                <View style={[styles.bar, { height: Math.max(height, 4) }]} />
                <Text style={styles.barLabel}>{dayName}</Text>
                <Text style={styles.barValue}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Per-habit breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Habit</Text>
        {habits.map(habit => {
          const info = HabitService.getStreak(habit);
          const rate = HabitService.getCompletionRate(habit);
          
          return (
            <View key={habit.id} style={styles.habitRow}>
              <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitMeta}>
                  🔥 {info.currentStreak} current • {info.longestStreak} best • {rate}% rate
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  habitMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockedEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
