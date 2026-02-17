// Main App - Entry point
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Habit, User } from './types';
import { COLORS, LIMITS } from './constants';
import { StorageService } from './services/storage';
import { HabitService } from './services/habit';
import { HabitCard } from './components/HabitCard';
import { StatsBox } from './components/StatsBox';
import { AddHabitModal } from './components/AddHabitModal';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Load data on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = await StorageService.getUser();
      if (savedUser) {
        setUser(savedUser);
        const savedHabits = await StorageService.getHabits();
        setHabits(savedHabits);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  // Auth handlers
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      isPremium: false,
      createdAt: today,
    };
    
    await StorageService.setUser(newUser);
    setUser(newUser);
    setIsLoading(false);
    Alert.alert('Success', 'Account created!');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    // Demo: create user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      isPremium: false,
      createdAt: today,
    };
    
    await StorageService.setUser(newUser);
    setUser(newUser);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await StorageService.removeUser();
    setUser(null);
    setHabits([]);
    setEmail('');
    setPassword('');
  };

  // Subscription
  const handleSubscribe = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features:\n• Unlimited habits\n• Cloud sync\n• Advanced analytics\n• No ads\n\n$4.99/month or $39.99/year',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            if (user) {
              const premiumUser = { ...user, isPremium: true };
              await StorageService.setUser(premiumUser);
              setUser(premiumUser);
              Alert.alert('Welcome to Premium! 🎉', 'You now have unlimited access.');
            }
          }
        },
      ]
    );
  };

  // Habit handlers
  const handleAddHabit = (name: string, color: string) => {
    if (!user) return;
    
    // Check limit
    if (!user.isPremium && habits.length >= LIMITS.freeMaxHabits) {
      Alert.alert(
        'Free Limit Reached',
        'Free tier is limited to 3 habits. Upgrade to Premium!',
        [
          { text: 'OK' },
          { text: 'Upgrade', onPress: handleSubscribe }
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

  // Stats
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const overallStreak = habits.length > 0 
    ? Math.min(...habits.map(h => HabitService.getStreak(h).currentStreak))
    : 0;

  // Auth Screen
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Momentum</Text>
          <Text style={styles.authSubtitle}>Build better habits</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main App
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Momentum</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity style={styles.premiumBanner} onPress={handleSubscribe}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  authTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  signOutText: {
    color: COLORS.error,
    fontSize: 14,
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
    paddingVertical: 20,
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
    bottom: 30,
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
});
