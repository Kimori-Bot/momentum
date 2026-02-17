// Storage service with Supabase cloud sync
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { supabase } from './supabase';

export const StorageService = {
  // User methods
  async getUser(): Promise<User | null> {
    try {
      // First check local storage
      const data = await AsyncStorage.getItem(STORAGE_KEYS.user);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      // Save locally
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      
      // Sync to cloud
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            is_premium: user.isPremium,
            created_at: user.createdAt,
          });
        
        if (error) {
          console.warn('Cloud sync failed for user:', error.message);
        }
      } catch (e) {
        console.warn('Cloud sync unavailable');
      }
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Habits methods
  async getHabits(): Promise<Habit[]> {
    try {
      // First check local storage
      const data = await AsyncStorage.getItem(STORAGE_KEYS.habits);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  },

  async setHabits(habits: Habit[]): Promise<void> {
    try {
      // Save locally
      await AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
      
      // Sync to cloud (if we have a userId)
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.user);
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          // Delete existing habits for this user and re-insert
          await supabase.from('habits').delete().eq('user_id', user.id);
          
          const habitsToInsert = habits.map(h => ({
            id: h.id,
            user_id: h.userId,
            name: h.name,
            color: h.color,
            completed_dates: h.completedDates,
            created_at: h.createdAt,
          }));
          
          const { error } = await supabase.from('habits').insert(habitsToInsert);
          
          if (error) {
            console.warn('Cloud sync failed for habits:', error.message);
          }
        } catch (e) {
          console.warn('Cloud sync unavailable');
        }
      }
    } catch (error) {
      console.error('Error setting habits:', error);
    }
  },

  // Cloud sync - fetch from cloud
  async syncFromCloud(): Promise<{ habits: Habit[]; user: User | null }> {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.user);
      if (!userStr) {
        return { habits: [], user: null };
      }
      
      const user = JSON.parse(userStr);
      
      // Fetch habits from cloud
      const { data: habitsData, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.warn('Cloud fetch failed:', error.message);
        return { habits: [], user };
      }
      
      const habits: Habit[] = (habitsData || []).map((h: any) => ({
        id: h.id,
        userId: h.user_id,
        name: h.name,
        color: h.color,
        completedDates: h.completed_dates || [],
        createdAt: h.created_at,
      }));
      
      // Save to local
      await AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
      
      return { habits, user };
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      return { habits: [], user: null };
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.user,
        STORAGE_KEYS.habits,
        STORAGE_KEYS.settings,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
