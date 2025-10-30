import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBar from '@/components/ProgressBar';
import TimerClock from '@/components/TimerClock';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Clock, Target, List, ChevronRight, Edit3 } from 'lucide-react-native';

interface Session {
  id: number;
  subject: string;
  duration: number;
  date: string;
  time: string;
}

export default function TimerScreen() {
  const [subject, setSubject] = useState('');
  const [timeStudied, setTimeStudied] = useState(0);
  const [goal, setGoal] = useState(8 * 60 * 60); // Default: 2 hrs (in seconds)
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('2');

  useEffect(() => {
    loadTodayData();
    loadGoal();
  }, []);

  const loadGoal = async () => {
    const storedGoal = await AsyncStorage.getItem('dailyGoal');
    if (storedGoal) {
      const hours = parseFloat(storedGoal);
      setGoal(hours * 3600);
      setGoalInput(hours.toString());
    }
  };

  const saveGoal = async () => {
    const hours = parseFloat(goalInput);
    if (!isNaN(hours) && hours > 0) {
      await AsyncStorage.setItem('dailyGoal', hours.toString());
      setGoal(hours * 3600);
    }
    setIsEditingGoal(false);
  };

  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = await AsyncStorage.getItem('sessions');
    const parsed: Session[] = stored ? JSON.parse(stored) : [];
    const todaySessions = parsed.filter((s) => s.date === today);
    const total = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setSessions(todaySessions);
    setTimeStudied(total);
  };

  const handleSessionEnd = async (duration: number) => {
    if (!subject.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const newSession: Session = {
      id: Date.now(),
      subject,
      duration,
      date: today,
      time: new Date().toLocaleTimeString(),
    };
    const stored = await AsyncStorage.getItem('sessions');
    const parsed: Session[] = stored ? JSON.parse(stored) : [];
    const updated = [...parsed, newSession];
    await AsyncStorage.setItem('sessions', JSON.stringify(updated));
    loadTodayData();
  };

  const progress = Math.min(timeStudied / goal, 1);
  const hoursStudied = (timeStudied / 3600).toFixed(1);
  const goalHours = (goal / 3600).toFixed(1);

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER / PROGRESS CARD */}
        <View style={styles.statsCard}>
          <View style={styles.headerRow}>
            {/* <Target color="#667eea" size={28} /> */}
            <Text style={styles.greeting}>Keep it up! 🎯</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.timeDisplay}>
              <Clock color="#764ba2" size={32} />
              <Text style={styles.timeNumber}>{hoursStudied}</Text>
              <Text style={styles.timeLabel}>hours studied</Text>
            </View>

            <View style={styles.progressWrapper}>
              <ProgressBar progress={progress} />

              {/* Editable Goal Section */}
              <View style={styles.goalRow}>
                {isEditingGoal ? (
                  <>
                    <TextInput
                      style={styles.goalInput}
                      value={goalInput}
                      onChangeText={setGoalInput}
                      keyboardType="numeric"
                      placeholder="Enter hours"
                      placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity onPress={saveGoal}>
                      <Text style={styles.saveGoalText}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.goalText}>Daily Goal: {goalHours} hrs</Text>
                    <TouchableOpacity onPress={() => setIsEditingGoal(true)}>
                      <Edit3 color="#667eea" size={18} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* SUBJECT INPUT CARD */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Book color="#667eea" size={22} />
            <Text style={styles.cardTitle}>What are you studying?</Text>
          </View>
          <View style={styles.inputWrapper}>
            <Book color="#667eea" size={20} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Polity, Geography, ..."
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
        </View>

        {/* TIMER CARD */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Clock color="#764ba2" size={22} />
            <Text style={styles.cardTitle}>Focus Timer</Text>
          </View>

          <View style={styles.timerWrapper}>
            <TimerClock onSessionComplete={handleSessionEnd} disabled={!subject} />
          </View>

          {!subject && (
            <Text style={styles.hint}>💡 Enter a subject to start the timer</Text>
          )}
        </View>

        {/* TODAY'S SESSIONS */}
        {sessions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <List color="#43e97b" size={22} />
              <Text style={styles.cardTitle}>Today's Sessions</Text>
            </View>

            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionDot} />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionSubject}>{session.subject}</Text>
                  <Text style={styles.sessionTime}>{session.time}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDuration}>
                    {(session.duration / 60).toFixed(0)} min
                  </Text>
                  <ChevronRight color="#aaa" size={18} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 20, paddingTop: 60 },
  contentContainer: { paddingBottom: 120 },

  // HEADER CARD
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  progressSection: { gap: 16 },
  timeDisplay: { alignItems: 'center', marginBottom: 8 },
  timeNumber: { fontSize: 48, fontWeight: '800', color: '#667eea', lineHeight: 56 },
  timeLabel: { fontSize: 16, color: '#666', fontWeight: '500' },
  progressWrapper: { gap: 8 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  goalText: { fontSize: 15, color: '#666', fontWeight: '500' },
  goalInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    color: '#1a1a1a',
    width: 80,
    textAlign: 'center',
  },
  saveGoalText: { color: '#667eea', fontWeight: '600' },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },

  // INPUT
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#1a1a1a' },

  // TIMER
  timerWrapper: { alignItems: 'center', paddingVertical: 12 },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // SESSIONS
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  sessionTime: { fontSize: 13, color: '#888' },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDuration: { fontSize: 15, fontWeight: '700', color: '#667eea' },
});
