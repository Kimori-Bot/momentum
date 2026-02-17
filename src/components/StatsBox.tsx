// StatsBox component
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants';

interface StatsBoxProps {
  value: string | number;
  label: string;
}

export const StatsBox: React.FC<StatsBoxProps> = ({ value, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
