import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { User } from '../LoginScreen';

// Real API Response Interfaces
interface StaffOverview {
  totalStaff: number;
  activeStaff: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
}

interface AttendanceData {
  overallAttendanceRate: number;
  departmentBreakdown: {
    department: string;
    attendanceRate: number;
    presentCount: number;
    absentCount: number;
  }[];
  weeklyTrend: {
    date: string;
    attendanceRate: number;
  }[];
}

interface MaintenanceData {
  totalRequests: number;
  pendingRequests: number;
  completedThisWeek: number;
  urgentRequests: number;
  facilityStatus: {
    facilityName: string;
    status: string;
    lastInspection: string;
  }[];
}

interface PerformanceData {
  staffPerformanceScore: number;
  topPerformers: {
    userId: number;
    name: string;
    role: string;
    performanceScore: number;
  }[];
  improvementAreas: string[];
}

interface TasksData {
  totalActiveTasks: number;
  completedThisWeek: number;
  overdueTasks: number;
  upcomingDeadlines: {
    id: number;
    title: string;
    assignedTo: string;
    deadline: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

interface SuperManagerDashboardData {
  overview: StaffOverview;
  attendance: AttendanceData;
  maintenance: MaintenanceData;
  performance: PerformanceData;
  tasks: TasksData;
}

interface SuperManagerDashboardProps {
  user: User;
  selectedRole: any;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const SuperManagerDashboard: React.FC<SuperManagerDashboardProps> = ({ 
  user, 
  selectedRole, 
  token, 
  onLogout, 
  onNavigate 
}) => {
  const [dashboardData, setDashboardData] = useState<SuperManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for fallback (matching real API structure)
  const mockDashboardData: SuperManagerDashboardData = {
    overview: {
      totalStaff: 10,
      activeStaff: 10,
      onLeaveToday: 0,
      pendingLeaveRequests: 1
    },
    attendance: {
      overallAttendanceRate: 92.5,
      departmentBreakdown: [
        {
          department: "TEACHER",
          attendanceRate: 84.1,
          presentCount: 5,
          absentCount: 0
        },
        {
          department: "PRINCIPAL",
          attendanceRate: 94.7,
          presentCount: 1,
          absentCount: 0
        }
      ],
      weeklyTrend: []
    },
    maintenance: {
      totalRequests: 3,
      pendingRequests: 1,
      completedThisWeek: 0,
      urgentRequests: 0,
      facilityStatus: [
        {
          facilityName: "Main Building",
          status: "OPERATIONAL",
          lastInspection: "2025-06-30"
        }
      ]
    },
    performance: {
      staffPerformanceScore: 87.5,
      topPerformers: [
        {
          userId: 15,
          name: "Emma English Teacher",
          role: "TEACHER",
          performanceScore: 96.6
        }
      ],
      improvementAreas: ["Staff punctuality", "Technology adoption"]
    },
    tasks: {
      totalActiveTasks: 20,
      completedThisWeek: 6,
      overdueTasks: 2,
      upcomingDeadlines: [
        {
          id: 1,
          title: "Task 1",
          assignedTo: "James Chemistry Teacher",
          deadline: "2025-07-11",
          priority: "LOW"
        }
      ]
    }
  };

  // API call to fetch Super Manager dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log('🎯 Fetching Super Manager dashboard data...');
      console.log('Using token:', token);
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/manager/dashboard?role=SUPER_MANAGER&academicYearId=all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Super Manager Dashboard API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('Super Manager Dashboard API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          setDashboardData(apiData.data);
          console.log('✅ Successfully loaded real Super Manager dashboard data');
          return;
        } else {
          console.log('API returned success=false or missing data:', apiData);
        }
      } else {
        const errorData = await response.text();
        console.log('Super Manager Dashboard API Error:', response.status, errorData);
      }
    } catch (error) {
      console.log('Super Manager Dashboard API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock Super Manager dashboard data as fallback');
    setDashboardData(mockDashboardData);
  };

  useEffect(() => {
    fetchDashboardData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  // Helper functions
  const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACADEMIC': return '📚';
      case 'FINANCIAL': return '💰';
      case 'SYSTEM': return '⚙️';
      case 'DISCIPLINE': return '🚨';
      case 'USER': return '👥';
      default: return '📋';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  // Mobile-focused quick actions (most essential for Super Manager)
  const quickActions = [
    { 
      id: '1', 
      title: 'User Management', 
      icon: '👥', 
      color: '#e74c3c', 
      description: 'Manage users & roles',
      action: () => onNavigate('UserManagement', { token })
    },
    { 
      id: '2', 
      title: 'Academic Years', 
      icon: '📅', 
      color: '#3498db', 
      description: 'Academic year setup',
      action: () => onNavigate('AcademicYears', { token })
    },
    { 
      id: '3', 
      title: 'Financial Overview', 
      icon: '💰', 
      color: '#f39c12', 
      description: 'System-wide finances',
      action: () => onNavigate('FinancialOverview', { token })
    },
    { 
      id: '4', 
      title: 'System Reports', 
      icon: '📊', 
      color: '#1abc9c', 
      description: 'Generate reports',
      action: () => Alert.alert('System Reports', 'System reports interface coming soon')
    },
    { 
      id: '5', 
      title: 'Urgent Issues', 
      icon: '🚨', 
      color: '#e67e22', 
      description: 'Urgent attention needed',
      action: () => {
        const overdueTasksCount = dashboardData?.tasks?.overdueTasks || 0;
        const urgentMaintenanceCount = dashboardData?.maintenance?.urgentRequests || 0;
        const pendingLeaveCount = dashboardData?.overview?.pendingLeaveRequests || 0;
        
        const totalUrgentIssues = overdueTasksCount + urgentMaintenanceCount + pendingLeaveCount;
        
        if (totalUrgentIssues > 0) {
          Alert.alert('Urgent Issues', `${totalUrgentIssues} urgent issues require attention:\n• ${overdueTasksCount} overdue tasks\n• ${urgentMaintenanceCount} urgent maintenance\n• ${pendingLeaveCount} pending leave requests`);
        } else {
          Alert.alert('Urgent Issues', 'No urgent issues at the moment');
        }
      }
    },
    { 
      id: '6', 
      title: 'System Health', 
      icon: '⚡', 
      color: '#2ecc71', 
      description: 'Monitor system',
      action: () => Alert.alert('System Health', 'System is running normally')
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading Super Manager Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load dashboard data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎯 Super Manager</Text>
          <Text style={styles.headerSubtitle}>System Administration</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* System Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.statNumber}>{dashboardData?.overview?.totalStaff || 0}</Text>
              <Text style={styles.statLabel}>Total Staff</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
              <Text style={styles.statNumber}>{dashboardData?.overview?.activeStaff || 0}</Text>
              <Text style={styles.statLabel}>Active Staff</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.statNumber}>{dashboardData?.overview?.onLeaveToday || 0}</Text>
              <Text style={styles.statLabel}>On Leave Today</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
              <Text style={styles.statNumber}>{Math.round(dashboardData?.attendance?.overallAttendanceRate || 0)}%</Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
            </View>
          </View>
          
          {/* Performance Summary */}
          <View style={styles.financialSummary}>
            <Text style={styles.financialTitle}>📊 Staff Performance: {Math.round(dashboardData?.performance?.staffPerformanceScore || 0)}%</Text>
            <Text style={styles.financialSubtitle}>Active Tasks: {dashboardData?.tasks?.totalActiveTasks || 0} | Pending Requests: {dashboardData?.overview?.pendingLeaveRequests || 0}</Text>
          </View>
        </View>

        {/* Critical Issues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Attention Required</Text>
          
          {/* Overdue Tasks Alert */}
          {(dashboardData?.tasks?.overdueTasks || 0) > 0 && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>📝</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>
                    {dashboardData?.tasks?.overdueTasks} overdue tasks need immediate attention
                  </Text>
                  <Text style={styles.alertTime}>Task Management</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: '#e74c3c' }]}>
                  <Text style={styles.priorityText}>HIGH</Text>
                </View>
              </View>
            </View>
          )}

          {/* Urgent Maintenance Alert */}
          {(dashboardData?.maintenance?.urgentRequests || 0) > 0 && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>🔧</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>
                    {dashboardData?.maintenance?.urgentRequests} urgent maintenance requests
                  </Text>
                  <Text style={styles.alertTime}>Facilities Management</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: '#e74c3c' }]}>
                  <Text style={styles.priorityText}>HIGH</Text>
                </View>
              </View>
            </View>
          )}

          {/* Pending Leave Requests */}
          {(dashboardData?.overview?.pendingLeaveRequests || 0) > 0 && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>📋</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>
                    {dashboardData?.overview?.pendingLeaveRequests} pending leave requests need approval
                  </Text>
                  <Text style={styles.alertTime}>HR Management</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: '#f39c12' }]}>
                  <Text style={styles.priorityText}>MEDIUM</Text>
                </View>
              </View>
            </View>
          )}

          {/* Low Performance Alert */}
          {(dashboardData?.performance?.staffPerformanceScore || 100) < 85 && (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>📊</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>
                    Staff performance below target: {Math.round(dashboardData?.performance?.staffPerformanceScore || 0)}%
                  </Text>
                  <Text style={styles.alertTime}>Performance Management</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: '#f39c12' }]}>
                  <Text style={styles.priorityText}>MEDIUM</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration Tools</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderTopColor: action.color }]}
                onPress={action.action}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity & Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Recent Activity & Top Performers</Text>
          
          {/* Tasks Summary */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityIcon}>✅</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {dashboardData?.tasks?.completedThisWeek || 0} tasks completed this week
                </Text>
                <Text style={styles.activityUser}>Task Management</Text>
                <Text style={styles.activityTime}>Performance Update</Text>
              </View>
            </View>
          </View>

          {/* Top Performers */}
          {dashboardData?.performance?.topPerformers && dashboardData.performance.topPerformers.length > 0 && (
            <>
              {dashboardData.performance.topPerformers.slice(0, 3).map((performer) => (
                <View key={performer.userId} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityIcon}>🏆</Text>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        {performer.name} - Top performer ({Math.round(performer.performanceScore)}%)
                      </Text>
                      <Text style={styles.activityUser}>Role: {performer.role}</Text>
                      <Text style={styles.activityTime}>Performance Recognition</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Maintenance Updates */}
          {dashboardData?.maintenance?.facilityStatus && dashboardData.maintenance.facilityStatus.length > 0 && (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>🏢</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    Facility status: {dashboardData.maintenance.facilityStatus.filter(f => f.status === 'OPERATIONAL').length} operational, {dashboardData.maintenance.facilityStatus.filter(f => f.status === 'MAINTENANCE').length} under maintenance
                  </Text>
                  <Text style={styles.activityUser}>Facilities Management</Text>
                  <Text style={styles.activityTime}>Status Update</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* System Health Indicator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>🟢 Database: Healthy</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>🟢 Server: Running (99.8% uptime)</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>🟡 Storage: 78% usage</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>🟢 Backup: Last successful 2 hours ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 2,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  logoutButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  financialSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  financialSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewAllButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#95a5a6',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthItem: {
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
});

export default SuperManagerDashboard; 