// HomeScreen with tab navigation
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, Habit } from '../types';
import { COLORS, LIMITS } from '../constants';
import { StorageService } from '../services/storage';
import { HabitService } from '../services/habit';
import { HabitCard } from '../components/HabitCard';
import { StatsBox } from '../components/StatsBox';
import { AddHabitModal } from '../components/AddHabitModal';
import { SettingsScreen } from './SettingsScreen';
import { AnalyticsScreen } from './AnalyticsScreen';

interface HomeScreenProps {
  user: User;
  onSubscribe: () => void;
  onSignOut: () => void;
}

type Tab = 'home' | 'analytics' | 'settings';

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onSubscribe, onSignOut }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const savedHabits = await StorageService.getHabits();
    setHabits(savedHabits);
  };

  const handleAddHabit = (name: string, color: string) => {
    if (!user) return;
    
    if (!user.isPremium && habits.length >= LIMITS.freeMaxHabits) {
      Alert.alert(
        'Free Limit Reached',
        'Free tier is limited to 3 habits. Upgrade to Premium!',
        [
          { text: 'OK' },
          { text: 'Upgrade', onPress: onSubscribe }
        ]
      );
      return;
    }
    
    const newHabit = HabitService.createHabit(name, color, user.id);
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    StorageService.setHabits(updatedHabits);
  };

  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        return HabitService.toggleHabit(h);
      }
      return h;
    });
    setHabits(updatedHabits);
    StorageService.setHabits(updatedHabits);
  };

  const handleDeleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            const updatedHabits = habits.filter(h => h.id !== habitId);
            setHabits(updatedHabits);
            StorageService.setHabits(updatedHabits);
          }
        }
      ]
    );
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const overallStreak = habits.length > 0 
    ? Math.min(...habits.map(h => HabitService.getStreak(h).currentStreak))
    : 0;

  // Render home tab
  const renderHome = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Momentum</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {user.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ PREMIUM</Text>
          </View>
        )}
      </View>

      {/* Premium Banner */}
      {!user.isPremium && habits.length >= 2 && (
        <TouchableOpacity style={styles.premiumBanner} onPress={onSubscribe}>
          <Text style={styles.premiumBannerText}>🔒 Upgrade to Premium for unlimited habits</Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatsBox value={`${completedToday}/${totalHabits}`} label="Today" />
        <StatsBox value={overallStreak} label="Streak" />
        <StatsBox value={`${habits.length}${!user.isPremium ? '/3' : ''}`} label="Habits" />
      </View>

      {/* Habits List */}
      <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>Add your first habit to get started</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => handleToggleHabit(habit.id)}
              onLongPress={() => handleDeleteHabit(habit.id)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
        isPremium={user.isPremium}
        currentHabitCount={habits.length}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {activeTab === 'home' && renderHome()}
      {activeTab === 'analytics' && <AnalyticsScreen habits={habits} isPremium={user.isPremium} />}
      {activeTab === 'settings' && <SettingsScreen user={user} onSubscribe={onSubscribe} onSignOut={onSignOut} />}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.tabActive]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabIcon, activeTab === 'analytics' && styles.tabActive]}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.tabLabelActive]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  premiumBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumBanner: {
    backgroundColor: COLORS.warning,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },
  premiumBannerText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: COLORS.text,
    fontWeight: '300',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
