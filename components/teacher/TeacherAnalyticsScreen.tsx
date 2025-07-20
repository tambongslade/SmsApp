import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';
// Note: You would need to install and link a library like 'react-native-chart-kit'
// For this example, we'll mock the chart components.

const screenWidth = Dimensions.get('window').width;

// --- Interfaces ---

interface TeacherDashboardStats {
  subjectsTeaching: number;
  totalStudentsTeaching: number;
  marksToEnter: number;
  classesTaught: number;
  upcomingPeriods: number;
  weeklyHours: number;
  attendanceRate: number;
  totalHoursPerWeek: number;
}

interface TeacherAnalyticsScreenProps {
  route: any;
  navigation: any;
}

const TeacherAnalyticsScreen: React.FC<TeacherAnalyticsScreenProps> = ({
  route,
  navigation,
}) => {
  const { token, user, selectedRole } = route.params as { token: string, user: User, selectedRole: any };
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        academicYearId: selectedRole.academicYearId.toString(),
      });
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/teachers/me/dashboard?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          setDashboardData(mockStats);
        }
      } else {
        setDashboardData(mockStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      Alert.alert('Error', 'Could not fetch analytics.');
      setDashboardData(mockStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  
  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />}
      >
        {loading || !dashboardData ? (
          <ActivityIndicator size="large" color="#667eea" style={{marginTop: 50}}/>
        ) : (
          <>
            <View style={styles.statsGrid}>
              {renderStatCard('Subjects', dashboardData.subjectsTeaching, '📚')}
              {renderStatCard('Students', dashboardData.totalStudentsTeaching, '🎓')}
              {renderStatCard('Classes', dashboardData.classesTaught, '🏫')}
              {renderStatCard('Attendance', `${dashboardData.attendanceRate}%`, '📈')}
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Marks Entry Progress</Text>
              {/* Mock Chart */}
              <View style={styles.mockChart}>
                <Text>Chart showing {dashboardData.marksToEnter} marks remaining</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Weekly Schedule Summary</Text>
               {/* Mock Chart */}
               <View style={styles.mockChart}>
                <Text>Chart showing {dashboardData.weeklyHours}/{dashboardData.totalHoursPerWeek} hours</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockStats: TeacherDashboardStats = {
  subjectsTeaching: 4,
  totalStudentsTeaching: 120,
  marksToEnter: 35,
  classesTaught: 8,
  upcomingPeriods: 3,
  weeklyHours: 18,
  attendanceRate: 95,
  totalHoursPerWeek: 22,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  scrollView: { flex: 1, padding: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: (screenWidth - 60) / 2,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statIcon: { fontSize: 32, marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 14, color: '#64748b', marginTop: 4 },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  mockChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
});

export default TeacherAnalyticsScreen; 