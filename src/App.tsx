// Main App - Entry point
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User } from './types';
import { COLORS } from './constants';
import { StorageService } from './services/storage';
import { RevenueCatService } from './services/revenueCat';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize RevenueCat
    await RevenueCatService.initialize();
    
    // Check for existing user
    const savedUser = await StorageService.getUser();
    if (savedUser) {
      // Check subscription status with RevenueCat
      const premiumStatus = await RevenueCatService.isPremium();
      setIsPremium(premiumStatus);
      
      // Update user with premium status from RevenueCat
      const updatedUser = { ...savedUser, isPremium: premiumStatus };
      setUser(updatedUser);
      
      // Set user ID for RevenueCat attribution
      await RevenueCatService.setUserId(savedUser.id);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email,
      isPremium: false,
      createdAt: today,
    };
    
    await StorageService.setUser(newUser);
    
    // Set RevenueCat user ID
    await RevenueCatService.setUserId(userId);
    
    setUser(newUser);
    setIsPremium(false);
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setIsLoading(true);
    
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email,
      isPremium: false,
      createdAt: today,
    };
    
    await StorageService.setUser(newUser);
    
    // Check subscription status
    const premiumStatus = await RevenueCatService.isPremium();
    
    // Update user with premium status
    const updatedUser = { ...newUser, isPremium: premiumStatus };
    await StorageService.setUser(updatedUser);
    
    // Set RevenueCat user ID
    await RevenueCatService.setUserId(userId);
    
    setUser(updatedUser);
    setIsPremium(premiumStatus);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await StorageService.removeUser();
    await RevenueCatService.logOut();
    setUser(null);
    setIsPremium(false);
    setEmail('');
    setPassword('');
  };

  const handleSubscribe = async () => {
    // Show subscription options
    Alert.alert(
      'Upgrade to Premium',
      'Unlock all features:\n• Unlimited habits\n• Cloud sync\n• Advanced analytics\n• No ads\n\n$4.99/month or $39.99/year',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '$4.99/month', 
          onPress: async () => {
            // In production, this would call RevenueCatService.purchaseProduct()
            // For demo, we simulate a purchase
            Alert.alert(
              'Demo Mode',
              'In production, this would open Apple/Google Play payment. For now, simulating purchase...',
              [
                { 
                  text: 'Simulate Purchase', 
                  onPress: async () => {
                    if (user) {
                      const premiumUser = { ...user, isPremium: true };
                      await StorageService.setUser(premiumUser);
                      setUser(premiumUser);
                      setIsPremium(true);
                      Alert.alert('Welcome to Premium! 🎉');
                    }
                  }
                }
              ]
            );
          }
        },
        {
          text: '$39.99/year',
          onPress: async () => {
            Alert.alert(
              'Demo Mode',
              'In production, this would open Apple/Google Play payment.',
              [
                { 
                  text: 'Simulate Purchase', 
                  onPress: async () => {
                    if (user) {
                      const premiumUser = { ...user, isPremium: true };
                      await StorageService.setUser(premiumUser);
                      setUser(premiumUser);
                      setIsPremium(true);
                      Alert.alert('Welcome to Premium! 🎉');
                    }
                  }
                }
              ]
            );
          }
        },
      ]
    );
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Purchases',
      'Looking for previous subscription...',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          onPress: async () => {
            const restored = await RevenueCatService.restorePurchases();
            if (restored && user) {
              const premiumUser = { ...user, isPremium: true };
              await StorageService.setUser(premiumUser);
              setUser(premiumUser);
              setIsPremium(true);
              Alert.alert('Subscription restored! 🎉');
            } else {
              Alert.alert('No subscription found', 'Please purchase a subscription to unlock Premium.');
            }
          }
        },
      ]
    );
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
          
          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main App with tabs - pass isPremium from state (checked via RevenueCat)
  return (
    <HomeScreen 
      user={{ ...user, isPremium }} 
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
  restoreButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
