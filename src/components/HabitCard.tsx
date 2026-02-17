// HabitCard component
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Habit, StreakInfo } from '../types';
import { COLORS } from '../constants';
import { HabitService } from '../services/habit';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onLongPress: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onLongPress }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const streakInfo: StreakInfo = HabitService.getStreak(habit);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: habit.color }]}
      onPress={onToggle}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.checkbox, isCompleted && { backgroundColor: habit.color, borderColor: habit.color }]}>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View>
          <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
            {habit.name}
          </Text>
          <Text style={styles.streak}>🔥 {streakInfo.currentStreak} day streak</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  streak: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
