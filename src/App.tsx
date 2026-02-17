// Main App - Entry point
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User } from './types';
import { COLORS } from './constants';
import { StorageService } from './services/storage';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
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
    const savedUser = await StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
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
  };

  const handleSignIn = async () => {
    if (!email || !password) {
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
  };

  const handleSignOut = async () => {
    await StorageService.removeUser();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  const handleSubscribe = async () => {
    if (user) {
      const premiumUser = { ...user, isPremium: true };
      await StorageService.setUser(premiumUser);
      setUser(premiumUser);
    }
  };

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

  // Main App with tabs
  return (
    <HomeScreen 
      user={user} 
      onSubscribe={handleSubscribe}
      onSignOut={handleSignOut}
    />
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
});
