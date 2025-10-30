import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  onSessionComplete: (duration: number) => void;
  disabled?: boolean;
}

export default function TimerClock({ onSessionComplete, disabled }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleTimer = () => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      onSessionComplete(seconds);
      setSeconds(0);
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(0);
    setIsRunning(false);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(seconds)}</Text>
      <Button title={isRunning ? 'Stop & Save' : 'Start'} onPress={toggleTimer} disabled={disabled} />
      <View style={{ height: 10 }} />
      <Button title="Reset" onPress={resetTimer} color="#999" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 20 },
  time: { fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
});
