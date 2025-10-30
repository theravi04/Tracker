import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, BookOpen } from 'lucide-react-native';

interface Session {
  id: number;
  subject: string;
  duration: number;
  date: string;
}

export default function SettingsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem('sessions');
    const parsed: Session[] = stored ? JSON.parse(stored) : [];
    setSessions(parsed);
    const total = parsed.reduce((sum, s) => sum + s.duration, 0);
    setTotalTime(total);
    setTotalSessions(parsed.length);
  };

  const deleteSession = async (id: number) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = sessions.filter((s) => s.id !== id);
          await AsyncStorage.setItem('sessions', JSON.stringify(updated));
          loadData();
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getColorBySubject = (subject: string) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
    const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Stats */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Study Statistics 📈</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{(totalTime / 3600).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        {/* All Sessions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>All Sessions</Text>
            <Text style={styles.sessionCount}>{sessions.length} total</Text>
          </View>

          {sessions.length > 0 ? (
            <View style={styles.sessionsList}>
              {sessions
                .slice()
                .reverse()
                .map((item) => (
                  <View key={item.id} style={styles.sessionCard}>
                    <View style={styles.sessionLeft}>
                      <View
                        style={[
                          styles.sessionIcon,
                          { backgroundColor: getColorBySubject(item.subject) },
                        ]}
                      >
                        <Text style={styles.sessionIconText}>
                          {item.subject.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionSubject}>{item.subject}</Text>
                        <Text style={styles.sessionMeta}>
                          {formatDate(item.date)} • {(item.duration / 60).toFixed(0)} min
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteSession(item.id)}
                    >
                      <Trash2 color="#ff6b6b" size={20} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <BookOpen color="#667eea" size={48} />
              <Text style={styles.emptyText}>No sessions yet</Text>
              <Text style={styles.emptySubtext}>Start studying to see your history</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingTop: 60 },
  contentContainer: { padding: 20, paddingBottom: 120 },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 36, fontWeight: '800', color: '#667eea', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  statDivider: { width: 1, height: 50, backgroundColor: '#e0e0e0' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  sessionCount: { fontSize: 14, color: '#888', fontWeight: '600' },
  sessionsList: { gap: 10 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 16,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionIconText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  sessionMeta: { fontSize: 13, color: '#888' },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe0e0',
  },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999' },
});
