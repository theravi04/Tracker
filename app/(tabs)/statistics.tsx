import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Clock, CalendarDays, BarChart3 } from 'lucide-react-native';

interface Session {
  id: number;
  subject: string;
  duration: number; // seconds
  date: string; // yyyy-mm-dd
}

export default function StatisticsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [avgDaily, setAvgDaily] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = last week, etc.

  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      generateChart(sessions, weekOffset);
      calculateStats(sessions);
    }
  }, [sessions, weekOffset]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('sessions');
      const parsed: Session[] = stored ? JSON.parse(stored) : [];
      setSessions(parsed);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateStats = (data: Session[]) => {
    const total = data.reduce((sum, s) => sum + s.duration / 3600, 0);
    setTotalHours(total);
    setAvgDaily(total / 7);
  };

  const generateChart = (data: Session[], offset: number) => {
    const labels: string[] = [];
    const totals: number[] = [];

    // Start from the Sunday of the target week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - offset * 7); // start of week
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      labels.push(label);

      const total = data
        .filter(s => s.date === key)
        .reduce((sum, s) => sum + s.duration / 3600, 0);
      totals.push(Number(total.toFixed(2)));
    }

    setChartLabels(labels);
    setChartData(totals);
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === 1) return 'Last Week';
    return `${weekOffset} Weeks Ago`;
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
          <Text style={styles.headerTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Clock color="#667eea" size={26} />
              <Text style={styles.statNumber}>{totalHours.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>

            <View style={styles.statBox}>
              <CalendarDays color="#764ba2" size={26} />
              <Text style={styles.statNumber}>{avgDaily.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Daily Avg</Text>
            </View>

            <View style={styles.statBox}>
              <BarChart3 color="#43e97b" size={26} />
              <Text style={styles.statNumber}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <TouchableOpacity
              onPress={() => setWeekOffset(prev => Math.min(prev + 1, 10))}
              style={styles.navButton}
            >
              <ChevronLeft color="#667eea" size={24} />
            </TouchableOpacity>

            <Text style={styles.weekLabel}>{getWeekLabel()}</Text>

            <TouchableOpacity
              onPress={() => setWeekOffset(prev => Math.max(prev - 1, 0))}
              style={styles.navButton}
              disabled={weekOffset === 0}
            >
              <ChevronRight color={weekOffset === 0 ? '#ccc' : '#667eea'} size={24} />
            </TouchableOpacity>
          </View>

          {chartData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: chartData }],
                }}
                width={screenWidth}
                height={230}
                yAxisSuffix="h"
                yAxisInterval={1}
                chartConfig={{
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#f7f8fa',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#667eea',
                    fill: '#fff',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#e0e0e0',
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <BarChart3 color="#ccc" size={48} />
              <Text style={styles.emptyText}>No data for this week</Text>
              <Text style={styles.emptySubtext}>
                Try selecting another week or start studying!
              </Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#667eea', marginTop: 8 },
  statLabel: { fontSize: 13, color: '#666', fontWeight: '500' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
  },
  weekLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  chartWrapper: { alignItems: 'center' },
  chart: { borderRadius: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#999' },
});
