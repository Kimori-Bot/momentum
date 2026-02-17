// SettingsScreen
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Alert, Modal } from 'react-native';
import { User } from '../types';
import { COLORS } from '../constants';
import { NotificationService } from '../services/notifications';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  user: User;
  onSubscribe: () => void;
  onSignOut: () => void;
}

const TIME_OPTIONS = [
  { label: '6:00 AM', hour: 6 },
  { label: '7:00 AM', hour: 7 },
  { label: '8:00 AM', hour: 8 },
  { label: '9:00 AM', hour: 9 },
  { label: '12:00 PM', hour: 12 },
  { label: '6:00 PM', hour: 18 },
  { label: '8:00 PM', hour: 20 },
  { label: '9:00 PM', hour: 21 },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onSubscribe, onSignOut }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const pending = await NotificationService.getPendingNotifications();
    setNotificationsEnabled(pending.length > 0);
  };

  const handleNotificationToggle = async (value: boolean) => {
    setIsLoading(true);
    if (value) {
      const id = await NotificationService.scheduleDailyReminder(reminderHour, 0);
      if (id) {
        setNotificationsEnabled(true);
        Alert.alert('Success', `Daily reminder set for ${reminderHour}:00`);
      } else {
        Alert.alert('Error', 'Could not enable notifications. Please check permissions.');
      }
    } else {
      await NotificationService.cancelAllReminders();
      setNotificationsEnabled(false);
      Alert.alert('Disabled', 'Daily reminders turned off');
    }
    setIsLoading(false);
  };

  const handleTimeSelect = async (hour: number) => {
    setReminderHour(hour);
    setShowTimePicker(false);
    
    // Reschedule if already enabled
    if (notificationsEnabled) {
      await NotificationService.scheduleDailyReminder(hour, 0);
      Alert.alert('Updated', `Reminder changed to ${hour}:00`);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will delete all your data including habits and premium subscription. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            onSignOut();
          }
        },
      ]
    );
  };

  const currentTimeLabel = TIME_OPTIONS.find(t => t.hour === reminderHour)?.label || '9:00 AM';

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <Text style={styles.email}>{user.email}</Text>
          {user.isPremium ? (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>⭐ Premium</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeBtn} onPress={onSubscribe}>
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDesc}>Get reminded to check your habits</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              disabled={isLoading}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
              thumbColor={COLORS.text}
            />
          </View>
          
          {notificationsEnabled && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.settingLabel}>Reminder Time</Text>
                <Text style={styles.settingValue}>{currentTimeLabel}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
            <Text style={[styles.settingLabel, { color: COLORS.error }]}>Delete Account</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Build</Text>
            <Text style={styles.settingValue}>Production</Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
        <Text style={styles.signOutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Reminder Time</Text>
            {TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.hour}
                style={[
                  styles.timeOption,
                  reminderHour === option.hour && styles.timeOptionActive,
                ]}
                onPress={() => handleTimeSelect(option.hour)}
              >
                <Text style={[
                  styles.timeOptionText,
                  reminderHour === option.hour && styles.timeOptionTextActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  email: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  premiumTag: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  premiumTagText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceLight,
    marginVertical: 12,
  },
  signOutBtn: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutBtnText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  timeOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  timeOptionActive: {
    backgroundColor: COLORS.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  timeOptionTextActive: {
    fontWeight: '600',
  },
  modalClose: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
