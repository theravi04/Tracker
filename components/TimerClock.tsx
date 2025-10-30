import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw, Square } from 'lucide-react-native';

interface Props {
  onSessionComplete: (duration: number) => void;
  disabled?: boolean;
}

export default function TimerClock({ onSessionComplete, disabled }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toggle play/pause
  const handleStartPause = () => {
    if (disabled) return;

    if (isRunning) {
      // Pause
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      // Start/Resume
      setIsRunning(true);
      intervalRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
  };

  // Stop and save session
  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (seconds > 0) onSessionComplete(seconds);
    setSeconds(0);
    setIsRunning(false);
  };

  // Reset timer only
  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(0);
    setIsRunning(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format time → hh:mm:ss
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

      {/* Horizontal Buttons */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.disabled]}
          onPress={handleStartPause}
          disabled={disabled}
        >
          {isRunning ? (
            <Pause color="#764ba2" size={20} />
          ) : (
            <Play color="#0571ffff" size={20} />
          )}
          <Text style={[styles.btnText, { color: isRunning ? '#764ba2' : '#0571ffff' }]}>
            {isRunning ? 'Pause' : seconds > 0 ? 'Resume' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Square color="#e63946" size={20} />
          <Text style={[styles.btnText, { color: '#e63946' }]}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <RotateCcw color="#999" size={20} />
          <Text style={[styles.btnText, { color: '#999' }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 20 },
  time: {
    fontSize: 42,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 20,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: { opacity: 0.5 },
});
