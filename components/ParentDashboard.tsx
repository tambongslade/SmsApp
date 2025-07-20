import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { formatCurrency, formatNumber, safeNumber } from '../constants';

// --- Enhanced Interfaces based on parent.workflow.md ---

interface LatestMark {
  subjectName: string;
  latestMark: number;
  sequence: string;
  date: string;
}

interface ChildSummary {
  id: number;
  name: string;
  className?: string;
  subclassName?: string;
  enrollmentStatus: string;
  photo?: string;
  attendanceRate: number;
  latestMarks: LatestMark[];
  pendingFees: number;
  disciplineIssues: number;
  recentAbsences: number;
}

interface DashboardData {
  totalChildren: number;
  childrenEnrolled: number;
  pendingFees: number;
  totalFeesOwed: number;
  latestGrades: number;
  disciplineIssues: number;
  unreadMessages: number;
  upcomingEvents: number;
  children: ChildSummary[];
}

interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'grade' | 'payment' | 'announcement' | 'discipline';
}

const { width } = Dimensions.get('window');

type ParentDashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'> & {
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
};

const ParentDashboard: React.FC<ParentDashboardProps> = ({ route, navigation, onLogout, onNavigate }) => {
  const { user, selectedRole, token } = route.params;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // API call to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Add academic year parameter if available
      const queryParams = new URLSearchParams();
      if (selectedRole.academicYearId) {
        queryParams.append('academicYearId', selectedRole.academicYearId.toString());
      }
      
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/parents/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('Fetching dashboard data from:', url);
      console.log('Using token:', token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard API Response Status:', response.status);
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('Dashboard API Response Data:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          setDashboardData(apiData.data);
          
          // Generate recent activity from API data
          const activities: RecentActivity[] = [];
          
          // Add null/undefined checks to prevent map/forEach errors
          if (apiData.data.children && Array.isArray(apiData.data.children)) {
            apiData.data.children.forEach((child: ChildSummary) => {
              if (child.latestMarks && Array.isArray(child.latestMarks)) {
                child.latestMarks.forEach((mark: LatestMark) => {
                  activities.push({
                    id: `grade-${child.id}-${mark.subjectName}`,
                    message: `New ${mark.subjectName} result for ${child.name} - ${mark.latestMark}/20 (${mark.sequence})`,
                    timestamp: mark.date,
                    type: 'grade'
                  });
                });
              }
            });
          }
          
          setRecentActivity(activities.slice(0, 5)); // Show latest 5
          console.log('✅ Successfully loaded real parent dashboard data');
          return;
        } else {
          console.log('API returned success=false or missing data:', apiData);
        }
      } else {
        const errorData = await response.text();
        console.log('Dashboard API Error Response:', response.status, errorData);
      }
    } catch (error) {
      console.log('Dashboard API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock dashboard data as fallback');
    setDashboardData(mockDashboardData);
    setRecentActivity(mockRecentActivity);
  };

  useEffect(() => {
    fetchDashboardData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Mock data for fallback
  const mockDashboardData: DashboardData = {
    totalChildren: 2,
    childrenEnrolled: 2,
    pendingFees: 50000,
    totalFeesOwed: 50000,
    latestGrades: 5,
    disciplineIssues: 0,
    unreadMessages: 3,
    upcomingEvents: 2,
    children: [
      {
        id: 1,
        name: 'John Doe',
        className: 'Form 5A',
        subclassName: 'Science Stream',
        enrollmentStatus: 'ENROLLED',
        photo: 'https://via.placeholder.com/80',
        attendanceRate: 92,
        latestMarks: [
          { subjectName: 'Mathematics', latestMark: 16, sequence: 'Sequence 1', date: '2024-01-20' },
          { subjectName: 'Physics', latestMark: 18, sequence: 'Sequence 1', date: '2024-01-18' }
        ],
        pendingFees: 25000,
        disciplineIssues: 0,
        recentAbsences: 2,
      },
      {
        id: 2,
        name: 'Mary Doe',
        className: 'Form 3B',
        subclassName: 'Arts Stream',
        enrollmentStatus: 'ENROLLED',
        photo: 'https://via.placeholder.com/80',
        attendanceRate: 95,
        latestMarks: [
          { subjectName: 'English', latestMark: 17, sequence: 'Sequence 1', date: '2024-01-19' },
          { subjectName: 'History', latestMark: 15, sequence: 'Sequence 1', date: '2024-01-17' }
        ],
        pendingFees: 25000,
        disciplineIssues: 0,
        recentAbsences: 1,
      },
    ],
  };

  const mockRecentActivity: RecentActivity[] = [
    { id: '1', message: "New Mathematics result for John - 16/20 (Sequence 1)", timestamp: '2 hours ago', type: 'grade' },
    { id: '2', message: "Fee payment recorded for Mary - 25,000 FCFA", timestamp: '1 day ago', type: 'payment' },
    { id: '3', message: "New announcement: Parent-Teacher Meeting scheduled", timestamp: '2 days ago', type: 'announcement' },
    { id: '4', message: "Physics result for John - 18/20 (Sequence 1)", timestamp: '3 days ago', type: 'grade' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade': return '📊';
      case 'payment': return '💰';
      case 'announcement': return '📢';
      case 'discipline': return '⚠️';
      default: return '📋';
    }
  };

  const getLatestAverage = (marks: LatestMark[]): number => {
    if (marks.length === 0) return 0;
    return marks.reduce((sum, mark) => sum + mark.latestMark, 0) / marks.length;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorText}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubtext}>We couldn't load your dashboard data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const quickStats = [
    { 
      title: 'Children', 
      value: dashboardData.totalChildren.toString(), 
      icon: '👨‍👩‍👧‍👦',
      color: '#667eea',
      bgColor: '#667eea15'
    },
    { 
      title: 'Pending Fees', 
      value: formatCurrency(dashboardData.totalFeesOwed), 
      icon: '💰',
      color: '#f093fb',
      bgColor: '#f093fb15'
    },
    { 
      title: 'Enrolled', 
      value: dashboardData.childrenEnrolled.toString(), 
      icon: '🎓',
      color: '#4facfe',
      bgColor: '#4facfe15'
    },
    { 
      title: 'New Grades', 
      value: dashboardData.latestGrades.toString(), 
      icon: '📊',
      color: '#43e97b',
      bgColor: '#43e97b15'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modern Header with Gradient */}
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>Welcome back! 👋</Text>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.academicYear}>
                {selectedRole.academicYearName || '2024-2025'} Academic Year
            </Text>
          </View>
            <View style={styles.headerActions}>
            <TouchableOpacity 
                style={styles.notificationButton}
              onPress={() => onNavigate('ParentAnnouncements', { token })}
            >
                <Text style={styles.notificationIcon}>🔔</Text>
              {dashboardData.unreadMessages > 0 && (
                  <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{dashboardData.unreadMessages}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.profileButton}
              onPress={() => onNavigate('ParentSettings', { token })}
            >
                <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {/* Quick Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Quick Overview</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Children - Show only first 2 */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Featured Children</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => onNavigate('ParentChildren', { user, selectedRole, token })}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.children.slice(0, 2).map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.featuredChildCard}
              onPress={() => onNavigate('ChildDetails', { studentId: child.id, token })}
              activeOpacity={0.8}
            >
              <View style={styles.childInfo}>
                <View style={styles.childPhotoContainer}>
                  <Image source={{ uri: child.photo }} style={styles.childPhoto} />
                  <View style={[styles.statusIndicator, { 
                    backgroundColor: child.enrollmentStatus === 'ASSIGNED_TO_CLASS' ? '#43e97b' : '#ff6b6b' 
                  }]} />
                </View>
                <View style={styles.childDetails}>
                    <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childClass}>{child.className} • {child.subclassName}</Text>
                </View>
              </View>
              
              <View style={styles.childQuickStats}>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatLabel}>Attendance</Text>
                  <Text style={[styles.quickStatValue, { 
                    color: child.attendanceRate >= 90 ? '#43e97b' : '#f093fb' 
                  }]}>
                      {child.attendanceRate}%
                    </Text>
                  </View>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatLabel}>Average</Text>
                  <Text style={[styles.quickStatValue, { color: '#4facfe' }]}>
                      {getLatestAverage(child.latestMarks).toFixed(1)}/20
                    </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity - Simplified */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔔 Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityContainer}>
            {recentActivity.slice(0, 3).map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Highlights */}
        <View style={styles.highlightsSection}>
          <Text style={styles.sectionTitle}>✨ Today's Highlights</Text>
          <View style={styles.highlightsGrid}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>📚</Text>
              <Text style={styles.highlightTitle}>Classes Today</Text>
              <Text style={styles.highlightValue}>5 Classes</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>📋</Text>
              <Text style={styles.highlightTitle}>Assignments Due</Text>
              <Text style={styles.highlightValue}>2 Pending</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>📅</Text>
              <Text style={styles.highlightTitle}>Events</Text>
              <Text style={styles.highlightValue}>Parent Meeting</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightIcon}>⭐</Text>
              <Text style={styles.highlightTitle}>Achievements</Text>
              <Text style={styles.highlightValue}>3 New</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  academicYear: {
    fontSize: 14,
    color: '#cbd5e1',
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
  },
  profileIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: (width - 50) / 2,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredChildCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childPhotoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  childPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  childClass: {
    fontSize: 14,
    color: '#64748b',
  },
  childQuickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  highlightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: (width - 50) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ParentDashboard; 