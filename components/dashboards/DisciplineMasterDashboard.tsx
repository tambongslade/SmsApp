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
  Dimensions,
} from 'react-native';
import { User } from '../LoginScreen';
import { useDisciplineMaster } from '../DisciplineMasterContext';

const { width } = Dimensions.get('window');

// API Response Interfaces
interface DMOverview {
  totalActiveIssues: number;
  resolvedThisWeek: number;
  pendingResolution: number;
  studentsWithMultipleIssues: number;
  averageResolutionTime: number;
  attendanceRate: number;
  latenessIncidents: number;
  absenteeismCases: number;
  interventionSuccess: number;
  criticalCases: number;
}

interface BehavioralTrends {
  thisMonth: number;
  lastMonth: number;
  trend: "IMPROVING" | "DECLINING" | "STABLE";
}

interface UrgentIntervention {
  studentId: number;
  studentName: string;
  issueCount: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  lastIncident: string;
  recommendedAction: string;
}

interface IssueByType {
  type: string;
  count: number;
  trend: "INCREASING" | "DECREASING" | "STABLE";
  resolutionRate: number;
}

interface TodaysIncident {
  id: number;
  studentName: string;
  type: string;
  time: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "RESOLVED" | "ESCALATED";
}

interface DMDashboardData {
  overview: DMOverview;
  behavioralTrends: BehavioralTrends;
  urgentInterventions: UrgentIntervention[];
  issuesByType: IssueByType[];
  todaysIncidents: TodaysIncident[];
}

interface DisciplineMasterDashboardProps {
  user: User;
  selectedRole: any;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const DisciplineMasterDashboard: React.FC<DisciplineMasterDashboardProps> = ({ 
  user, 
  selectedRole, 
  token, 
  onLogout, 
  onNavigate 
}) => {
  const [dashboardData, setDashboardData] = useState<DMDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockDashboardData: DMDashboardData = {
    overview: {
      totalActiveIssues: 12,
      resolvedThisWeek: 18,
      pendingResolution: 5,
      studentsWithMultipleIssues: 8,
      averageResolutionTime: 3.2,
      attendanceRate: 95.3,
      latenessIncidents: 8,
      absenteeismCases: 15,
      interventionSuccess: 87,
      criticalCases: 2
    },
    behavioralTrends: {
      thisMonth: 156,
      lastMonth: 142,
      trend: "DECLINING"
    },
    urgentInterventions: [
      {
        studentId: 1,
        studentName: "Alice Brown",
        issueCount: 5,
        riskLevel: "HIGH",
        lastIncident: "2024-01-22",
        recommendedAction: "Parent meeting required"
      },
      {
        studentId: 2,
        studentName: "David Jones",
        issueCount: 4,
        riskLevel: "HIGH",
        lastIncident: "2024-01-20",
        recommendedAction: "Behavioral intervention plan"
      }
    ],
    issuesByType: [
      {
        type: "Morning Lateness",
        count: 23,
        trend: "DECREASING",
        resolutionRate: 92
      },
      {
        type: "Class Absence",
        count: 15,
        trend: "STABLE",
        resolutionRate: 88
      },
      {
        type: "Misconduct",
        count: 8,
        trend: "INCREASING",
        resolutionRate: 75
      }
    ],
    todaysIncidents: [
      {
        id: 1,
        studentName: "John Doe",
        type: "Lateness",
        time: "08:15",
        severity: "LOW",
        status: "PENDING"
      },
      {
        id: 2,
        studentName: "Mary Smith",
        type: "Misconduct",
        time: "10:30",
        severity: "HIGH",
        status: "ESCALATED"
      },
      {
        id: 3,
        studentName: "Peter Johnson",
        type: "Absence",
        time: "All Day",
        severity: "MEDIUM",
        status: "PENDING"
      }
    ]
  };

  // API call to fetch DM dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log('🎯 Fetching Discipline Master dashboard data...');
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/discipline-master/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('DM Dashboard API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('DM Dashboard API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          // Data transformation to match component's expected structure
          const {
            behavioralTrends,
            urgentInterventions,
            issuesByType,
            todaysIncidents,
            ...overviewData
          } = apiData.data;

          const transformedData: DMDashboardData = {
            overview: overviewData as DMOverview,
            behavioralTrends,
            urgentInterventions,
            issuesByType,
            todaysIncidents: todaysIncidents || [],
          };

          setDashboardData(transformedData);
          console.log('✅ Successfully loaded and transformed real DM dashboard data');
          return;
        }
      } else {
        const errorData = await response.text();
        console.log('DM Dashboard API Error:', response.status, errorData);
      }
    } catch (error) {
      console.log('DM Dashboard API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock DM dashboard data as fallback');
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
  const getSeverityColor = (severity: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (severity) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return '📈';
      case 'DECREASING': return '📉';
      case 'IMPROVING': return '📈';
      case 'DECLINING': return '📉';
      default: return '➡️';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lateness': return '⏰';
      case 'misconduct': return '⚠️';
      case 'absence': return '❌';
      default: return '📝';
    }
  };

  // Mobile-focused quick actions for DM
  // const quickActions = [
  //   { 
  //     id: '1', 
  //     title: 'Record Lateness', 
  //     icon: '⏰', 
  //     color: '#e74c3c', 
  //     count: dashboardData?.overview?.latenessIncidents || 0,
  //     description: 'Quick lateness entry',
  //     action: () => onNavigate('RecordLateness', { token, user })
  //   },
  //   { 
  //     id: '2', 
  //     title: 'New Incident', 
  //     icon: '⚠️', 
  //     color: '#f39c12', 
  //     count: dashboardData?.overview?.totalActiveIssues || 0,
  //     description: 'Report discipline issue',
  //     action: () => onNavigate('NewIncident', { token, user })
  //   },
  //   { 
  //     id: '3', 
  //     title: 'Attendance', 
  //     icon: '📅', 
  //     color: '#3498db', 
  //     count: dashboardData?.overview?.absenteeismCases || 0,
  //     description: 'Manage daily attendance',
  //     action: () => onNavigate('AttendanceManagement', { token, user })
  //   },
  //   { 
  //     id: '4', 
  //     title: 'High Risk', 
  //     icon: '🚨', 
  //     color: '#e67e22', 
  //     count: dashboardData?.overview?.criticalCases || 0,
  //     description: 'Critical cases review',
  //     action: () => onNavigate('HighRiskStudents', { token, user })
  //   }
  // ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c0392b" />
          <Text style={styles.loadingText}>Loading Discipline Master Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
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
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>⚖️ Discipline Master</Text>
          <Text style={styles.headerSubtitle}>Behavioral Management</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Mobile Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={[styles.tabText, activeTab === 'trends' && styles.activeTabText]}>Trends</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Daily Discipline Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Discipline Overview</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#e74c3c' }]}>
                  <Text style={styles.statNumber}>{dashboardData?.overview?.totalActiveIssues || 0}</Text>
                  <Text style={styles.statLabel}>Active Issues</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
                  <Text style={styles.statNumber}>{dashboardData?.overview?.latenessIncidents || 0}</Text>
                  <Text style={styles.statLabel}>Late Arrivals</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
                  <Text style={styles.statNumber}>{dashboardData?.overview?.absenteeismCases || 0}</Text>
                  <Text style={styles.statLabel}>Absences</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
                  <Text style={styles.statNumber}>{Math.round(dashboardData?.overview?.attendanceRate || 0)}%</Text>
                  <Text style={styles.statLabel}>Attendance Rate</Text>
                </View>
              </View>
              
              {/* Performance Summary */}
              <View style={styles.performanceSummary}>
                <View style={styles.performanceRow}>
                  <Text style={styles.performanceLabel}>📊 Resolution Rate:</Text>
                  <Text style={styles.performanceValue}>{dashboardData?.overview?.interventionSuccess || 0}%</Text>
                </View>
                <View style={styles.performanceRow}>
                  <Text style={styles.performanceLabel}>⏱️ Avg Resolution Time:</Text>
                  <Text style={styles.performanceValue}>{dashboardData?.overview?.averageResolutionTime || 0} days</Text>
                </View>
                <View style={styles.performanceRow}>
                  <Text style={styles.performanceLabel}>🚨 Critical Cases:</Text>
                  <Text style={styles.performanceValue}>{dashboardData?.overview?.criticalCases || 0}</Text>
                </View>
              </View>
            </View>

            {/* Urgent Interventions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚨 Urgent Interventions</Text>
              
              {dashboardData?.urgentInterventions?.map((intervention) => (
                <View key={intervention.studentId} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertIcon}>👤</Text>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertMessage}>{intervention.studentName}</Text>
                      <Text style={styles.alertTime}>{intervention.issueCount} issues - {intervention.recommendedAction}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getSeverityColor(intervention.riskLevel) }]}>
                      <Text style={styles.priorityText}>{intervention.riskLevel}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {(!dashboardData?.urgentInterventions || dashboardData.urgentInterventions.length === 0) && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✅</Text>
                  <Text style={styles.emptyText}>No urgent interventions</Text>
                  <Text style={styles.emptySubtext}>All critical cases are under control</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              {/* <Text style={styles.sectionTitle}>Quick Actions</Text> */}
              {/* <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.actionCard, { borderTopColor: action.color }]}
                    onPress={action.action}
                  >
                    <View style={styles.actionHeader}>
                      <Text style={styles.actionIcon}>{action.icon}</Text>
                      {action.count > 0 && (
                        <View style={[styles.badge, { backgroundColor: action.color }]}>
                          <Text style={styles.badgeText}>{action.count}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </TouchableOpacity>
                ))}
              </View> */}
            </View>
          </>
        )}

        {activeTab === 'today' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Today's Incidents</Text>
            
            {dashboardData?.todaysIncidents?.length > 0 ? (
              dashboardData.todaysIncidents.map((incident) => (
                <View key={incident.id} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <View style={styles.incidentIcon}>
                      <Text style={styles.incidentTypeIcon}>{getTypeIcon(incident.type)}</Text>
                    </View>
                    <View style={styles.incidentContent}>
                      <Text style={styles.incidentStudent}>{incident.studentName}</Text>
                      <Text style={styles.incidentType}>{incident.type} • {incident.time}</Text>
                    </View>
                    <View style={[
                      styles.severityBadge, 
                      { backgroundColor: getSeverityColor(incident.severity) }
                    ]}>
                      <Text style={styles.severityText}>{incident.severity}</Text>
                    </View>
                  </View>
                  <View style={styles.incidentActions}>
                    <TouchableOpacity style={styles.incidentActionButton}>
                      <Text style={styles.incidentActionText}>Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.incidentActionButton}>
                      <Text style={styles.incidentActionText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No incidents today</Text>
                <Text style={styles.emptySubtext}>Great! No discipline issues reported yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'trends' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Behavioral Trends</Text>
            
            {/* Monthly Comparison */}
            <View style={styles.trendsCard}>
              <Text style={styles.trendsTitle}>📊 Monthly Comparison</Text>
              <View style={styles.trendsRow}>
                <Text style={styles.trendsLabel}>This Month:</Text>
                <Text style={styles.trendsValue}>{dashboardData?.behavioralTrends?.thisMonth || 0} incidents</Text>
              </View>
              <View style={styles.trendsRow}>
                <Text style={styles.trendsLabel}>Last Month:</Text>
                <Text style={styles.trendsValue}>{dashboardData?.behavioralTrends?.lastMonth || 0} incidents</Text>
              </View>
              <View style={styles.trendsRow}>
                <Text style={styles.trendsLabel}>Trend:</Text>
                <Text style={[
                  styles.trendsValue,
                  { color: dashboardData?.behavioralTrends?.trend === 'IMPROVING' ? '#27ae60' : '#e74c3c' }
                ]}>
                  {getTrendIcon(dashboardData?.behavioralTrends?.trend || 'STABLE')} {dashboardData?.behavioralTrends?.trend || 'STABLE'}
                </Text>
              </View>
            </View>

            {/* Issues by Type */}
            <View style={styles.trendsCard}>
              <Text style={styles.trendsTitle}>📋 Issues by Type</Text>
              {dashboardData?.issuesByType?.map((issue, index) => (
                <View key={index} style={styles.issueTypeRow}>
                  <View style={styles.issueTypeHeader}>
                    <Text style={styles.issueTypeName}>{issue.type}</Text>
                    <Text style={styles.issueTypeCount}>{issue.count}</Text>
                  </View>
                  <View style={styles.issueTypeDetails}>
                    <Text style={styles.issueTypeDetail}>
                      {getTrendIcon(issue.trend)} {issue.trend}
                    </Text>
                    <Text style={styles.issueTypeDetail}>
                      ✅ {issue.resolutionRate}% resolved
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Add extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#c0392b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#c0392b',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 24,
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c0392b',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#c0392b',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  performanceSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  alertTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentIcon: {
    marginRight: 12,
  },
  incidentTypeIcon: {
    fontSize: 24,
  },
  incidentContent: {
    flex: 1,
  },
  incidentStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  incidentType: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  incidentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  incidentActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  incidentActionText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  trendsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  trendsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  trendsLabel: {
    fontSize: 14,
    color: '#495057',
  },
  trendsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  issueTypeRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  issueTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  issueTypeCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  issueTypeDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  issueTypeDetail: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80, // Space for bottom navigation
  },
});

export default DisciplineMasterDashboard; 