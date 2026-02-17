// Storage service for local data persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, User } from '../types';
import { STORAGE_KEYS } from '../constants';

export const StorageService = {
  // User methods
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.user);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
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
      const data = await AsyncStorage.getItem(STORAGE_KEYS.habits);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  },

  async setHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
    } catch (error) {
      console.error('Error setting habits:', error);
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
