// App constants

export const COLORS = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  background: '#111827',
  surface: '#1F2937',
  surfaceLight: '#374151',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#4B5563',
  
  // Habit colors
  habitColors: [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ],
};

export const LIMITS = {
  freeMaxHabits: 3,
  premiumPriceMonthly: 4.99,
  premiumPriceYearly: 39.99,
};

export const STORAGE_KEYS = {
  user: 'user',
  habits: 'habits',
  settings: 'settings',
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: 'https://ukhtixxdqoqiryxqhvng.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraHRpeHhkcW9xaXJ5eHFodm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTY0OTQsImV4cCI6MjA4NjkzMjQ5NH0.hNFgvtfBCYFmdd6agDQ960iat6ynyWrNdcjFvUhmxhc',
};
