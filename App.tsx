import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase (will only work when configured)
const supabase = SUPABASE_URL !== 'YOUR_SUPABASE_URL' ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[];
  createdAt: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  isPremium: boolean;
}

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedHabits = await AsyncStorage.getItem('habits');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const signUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    // For demo: create local user (replace with Supabase in production)
    const newUser: User = {
      id: 'user_' + Date.now(),
      email,
      isPremium: false, // New users start free
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
    Alert.alert('Success', 'Account created! You start with a free tier.');
  };

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    // Demo: simulate login
    const existingUser: User = {
      id: 'user_' + Date.now(),
      email,
      isPremium: false,
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(existingUser));
    setUser(existingUser);
    setIsLoading(false);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setHabits([]);
    setEmail('');
    setPassword('');
  };

  const subscribeToPremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Premium features:\n• Unlimited habits\n• Cloud sync across devices\n• Advanced analytics\n• No ads\n\n$4.99/month or $39.99/year',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            if (user) {
              const premiumUser = { ...user, isPremium: true };
              await AsyncStorage.setItem('user', JSON.stringify(premiumUser));
              setUser(premiumUser);
              Alert.alert('Welcome to Premium! 🎉', 'You now have unlimited access.');
            }
          }
        },
      ]
    );
  };

  const saveHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    
    // Check premium limit
    if (!user?.isPremium && habits.length >= 3) {
      Alert.alert(
        'Free Limit Reached',
        'Free tier is limited to 3 habits. Upgrade to Premium for unlimited habits!',
        [
          { text: 'OK' },
          { text: 'Upgrade', onPress: subscribeToPremium }
        ]
      );
      return;
    }
    
    const newHabit: Habit = {
      id: 'habit_' + Date.now(),
      name: newHabitName.trim(),
      color: selectedColor,
      completedDates: [],
      createdAt: today,
      userId: user?.id || 'anonymous',
    };
    saveHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowAddModal(false);
  };

  const toggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          saveHabits(habits.filter(h => h.id !== habitId));
        }}
      ]
    );
  };

  const getStreak = (habit: Habit): number => {
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const overallStreak = habits.length > 0 ? Math.min(...habits.map(h => getStreak(h))) : 0;

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
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={isSignUp ? signUp : signIn}
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Momentum</Text>
          <TouchableOpacity onPress={signOut}>
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
        <TouchableOpacity style={styles.premiumBanner} onPress={subscribeToPremium}>
          <Text style={styles.premiumBannerText}>🔒 Upgrade to Premium for unlimited habits</Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{completedToday}/{totalHabits}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{overallStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{habits.length}{!user.isPremium ? '/3' : ''}</Text>
          <Text style={styles.statLabel}>Habits</Text>
        </View>
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
          habits.map(habit => {
            const isCompleted = habit.completedDates.includes(today);
            const streak = getStreak(habit);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitCard, { borderLeftColor: habit.color }]}
                onPress={() => toggleHabit(habit.id)}
                onLongPress={() => deleteHabit(habit.id)}
              >
                <View style={styles.habitLeft}>
                  <View style={[styles.checkbox, isCompleted && { backgroundColor: habit.color, borderColor: habit.color }]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View>
                    <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>{habit.name}</Text>
                    <Text style={styles.habitStreak}>🔥 {streak} day streak</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Habit</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter habit name..."
              placeholderTextColor="#9CA3AF"
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            <Text style={styles.colorLabel}>Choose a color:</Text>
            <View style={styles.colorPicker}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorSelected]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addHabit}>
                <Text style={styles.saveButtonText}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  authTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1F2937',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 14,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  premiumBadge: {
    backgroundColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
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
  statBox: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
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
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  habitCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  habitStreak: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
