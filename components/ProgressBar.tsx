import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0–1
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.bar}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
});
