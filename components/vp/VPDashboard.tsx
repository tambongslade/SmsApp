import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';
import FallbackImage from '../FallbackImage';

interface DashboardStats {
  totalStudents: number;
  studentsAssigned: number;
  pendingInterviews: number;
  completedInterviews: number;
  awaitingAssignment: number;
  recentDisciplineIssues: number;
  classesWithPendingReports: number;
  teacherAbsences: number;
  enrollmentTrends: {
    thisMonth: number;
    lastMonth: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
  subclassCapacityUtilization?: Array<{
    subclassName: string;
    className: string;
    currentCapacity: number;
    maxCapacity: number;
    utilizationRate: number;
  }>;
  urgentTasks: Array<{
    type: 'INTERVIEW_OVERDUE' | 'ASSIGNMENT_PENDING' | 'CAPACITY_EXCEEDED';
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    count: number;
  }>;
}

const VPDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'failed' | 'unauthorized'>('checking');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadDashboardData(),
      testApiConnectivity(),
      loadUser(),
    ]);
    setLoading(false);
  };
  
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error("Failed to load user data", e);
    }
  };

  const testApiConnectivity = async () => {
    try {
      setApiStatus('checking');
      const token = await AsyncStorage.getItem('authToken');
      
      // Test basic connectivity
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const responseData = await response.json();
      console.log('API Response - testApiConnectivity:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus(response.status === 401 ? 'unauthorized' : 'failed');
      }
    } catch (error) {
      console.error('API connectivity test failed:', error);
      setApiStatus('failed');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear stored authentication data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      // Navigate back to login (you'll need to pass navigation props or use navigation context)
      // For now, just show an alert
      alert('Logged out. Please restart the app and log in again.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vice-principal/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response - loadDashboardData:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`Failed to load dashboard data: ${response.status} ${response.statusText}`);
      }

      if (data.success && data.data) {
        setStats(data.data);
        setError(null);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Dashboard load error:', err);
      
      // Set default stats to prevent UI from breaking
      setStats({
        totalStudents: 0,
        studentsAssigned: 0,
        pendingInterviews: 0,
        completedInterviews: 0,
        awaitingAssignment: 0,
        recentDisciplineIssues: 0,
        classesWithPendingReports: 0,
        teacherAbsences: 0,
        enrollmentTrends: {
          thisMonth: 0,
          lastMonth: 0,
          trend: 'STABLE',
        },
        urgentTasks: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderUrgentTask = (task: DashboardStats['urgentTasks'][0], index: number) => (
    <View key={index} style={styles.urgentTaskCard}>
      <View style={styles.urgentTaskHeader}>
        <Ionicons name="alert-circle-outline" size={22} color={getPriorityColor(task.priority)} />
        <Text style={styles.urgentTaskTitle}>{task.description}</Text>
      </View>
      <View style={styles.urgentTaskMeta}>
        <Text style={styles.urgentTaskCount}>{task.count} items</Text>
        <Text style={[styles.urgentTaskPriority, { color: getPriorityColor(task.priority) }]}>
          {task.priority}
        </Text>
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#FF3B30';
      case 'MEDIUM': return '#FF9500';
      case 'LOW': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'INCREASING': return 'trending-up-outline';
      case 'DECREASING': return 'trending-down-outline';
      case 'STABLE': return 'remove-outline';
      default: return 'remove-outline';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return '#34C759';
      case 'DECREASING': return '#FF3B30';
      case 'STABLE': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const renderDiagnostics = () => (
    <View style={styles.diagnosticsSection}>
      <TouchableOpacity 
        style={styles.diagnosticsHeader}
        onPress={() => setShowDiagnostics(!showDiagnostics)}
      >
        <Text style={styles.diagnosticsTitle}>API Diagnostics</Text>
        <Ionicons 
          name={showDiagnostics ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#8E8E93" 
        />
      </TouchableOpacity>
      
      {showDiagnostics && (
        <View style={styles.diagnosticsContent}>
          <View style={styles.diagnosticItem}>
            <Text style={styles.diagnosticLabel}>API Status:</Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(apiStatus) }]}>
              <Text style={styles.statusText}>{apiStatus.toUpperCase()}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.diagnosticButton} onPress={testApiConnectivity}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.diagnosticButtonText}>Re-test Connection</Text>
          </TouchableOpacity>

          <View style={styles.diagnosticItem}>
            <Text style={styles.diagnosticLabel}>API Base URL:</Text>
            <Text style={styles.diagnosticValue}>{API_BASE_URL}</Text>
          </View>
          
          <View style={styles.diagnosticItem}>
            <Text style={styles.diagnosticLabel}>VP Dashboard Endpoint:</Text>
            <Text style={styles.diagnosticValue}>{API_BASE_URL}/vice-principal/dashboard</Text>
          </View>
          
          {error && (
            <View style={styles.diagnosticItem}>
              <Text style={styles.diagnosticLabel}>Last Error:</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
            <Text style={styles.diagnosticButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#34C759';
      case 'failed': return '#FF3B30';
      case 'checking': return '#FF9500';
      case 'unauthorized': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        {renderDiagnostics()}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VP Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {user?.name || 'VP'}!</Text>
          </View>
          <FallbackImage
            source={require('../../assets/icon.png')}
            fallbackSource={require('../../assets/adaptive-icon.png')}
            style={styles.avatar}
          />
        </View>

        {error && (
          <View style={styles.inlineError}>
            <Ionicons name="warning-outline" size={16} color="#D9534F" />
            <Text style={styles.inlineErrorText}>Could not refresh all data: {error}</Text>
          </View>
        )}

        {/* Key Metrics */}
        <View style={styles.statsGrid}>
          {renderStatCard('Total Students', stats?.totalStudents ?? 0, 'people-outline', '#007AFF')}
          {renderStatCard('Assigned', stats?.studentsAssigned ?? 0, 'checkmark-circle-outline', '#34C759')}
          {renderStatCard('Unassigned', stats?.awaitingAssignment ?? 0, 'help-circle-outline', '#FF9500')}
          {renderStatCard('Pending Interviews', stats?.pendingInterviews ?? 0, 'hourglass-outline', '#5856D6')}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add-outline" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Assign Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={24} color="#34C759" />
              <Text style={styles.actionButtonText}>Manage Interviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text-outline" size={24} color="#FF9500" />
              <Text style={styles.actionButtonText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Urgent Tasks */}
        {stats?.urgentTasks && stats.urgentTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urgent Tasks</Text>
            {stats.urgentTasks.map(renderUrgentTask)}
          </View>
        )}

        {/* Enrollment Trends */}
        {stats?.enrollmentTrends && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enrollment Trends</Text>
            <View style={styles.trendCard}>
              <Ionicons name={getTrendIcon(stats.enrollmentTrends.trend)} size={40} color={getTrendColor(stats.enrollmentTrends.trend)} />
              <View style={styles.trendInfo}>
                <Text style={styles.trendLabel}>This month vs. last month</Text>
                <Text style={styles.trendValue}>{stats.enrollmentTrends.thisMonth} vs {stats.enrollmentTrends.lastMonth}</Text>
                <Text style={[styles.trendStatus, { color: getTrendColor(stats.enrollmentTrends.trend) }]}>
                  {stats.enrollmentTrends.trend}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {renderDiagnostics()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEB',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  inlineErrorText: {
    color: '#D9534F',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  urgentTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  urgentTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  urgentTaskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  urgentTaskCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  urgentTaskPriority: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  trendInfo: {
    flex: 1,
  },
  trendLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  trendStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  diagnosticsSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  diagnosticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagnosticsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  diagnosticsContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  diagnosticItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagnosticLabel: {
    fontSize: 14,
    color: '#333',
  },
  diagnosticValue: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  diagnosticButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  diagnosticButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    flex: 1,
    textAlign: 'right',
  }
});

export default VPDashboard; 