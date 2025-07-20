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
} from 'react-native';
import { User } from '../LoginScreen';
import { BASE_URL } from '../../constants';

interface TeacherDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface TeacherDashboardStats {
  assignedSubjects: number;
  totalStudents: number;
  totalClasses: number;
  weeklyPeriods: number;
  marksToEnter: number;
  upcomingPeriods: number;
}

interface MyClass {
  id: string;
  name: string;
  subject: string;
  students: number;
}

interface SubjectWithSubclasses {
  id: number;
  name: string;
  subclasses: {
    id: number;
    name: string;
    className: string;
    studentCount: number;
  }[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, token, onLogout, onNavigate }) => {
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsResponse = await fetch(`${BASE_URL}/api/v1/teachers/me/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();
        setStats(statsData.data);
        
        const subjectsResponse = await fetch(`${BASE_URL}/api/v1/teachers/me/subjects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!subjectsResponse.ok) {
          throw new Error(`Failed to fetch subjects: ${subjectsResponse.status}`);
        }

        const subjectsData = await subjectsResponse.json();
        if (subjectsData.success && Array.isArray(subjectsData.data)) {
            const formattedClasses: MyClass[] = [];
            subjectsData.data.forEach((subject: SubjectWithSubclasses) => {
              if (subject.subclasses && Array.isArray(subject.subclasses)) {
                subject.subclasses.forEach(subclass => {
                  formattedClasses.push({
                    id: subclass.id.toString(),
                    name: `${subclass.className} ${subclass.name}`,
                    subject: subject.name,
                    students: subclass.studentCount
                  });
                });
              }
            });
            setMyClasses(formattedClasses);
        } else {
            setMyClasses([]);
        }

      } catch (e: any) {
        setError(e.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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

  const quickActions = [
    { id: '1', title: 'My Classes', icon: '🏫', color: '#2ecc71', description: 'View and manage classes', screen: 'TeacherClasses' },
    { id: '2', title: 'Exams & Marks', icon: '📝', color: '#3498db', description: 'Submit marks and grades', screen: 'TeacherExams' },
    { id: '4', title: 'Settings', icon: '⚙️', color: '#f39c12', description: 'Profile and preferences', screen: 'TeacherSettings' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👨‍🏫 Teacher Portal</Text>
          <Text style={styles.headerSubtitle}>Classroom Management</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teaching Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
              <Text style={styles.statNumber}>{stats?.totalStudents ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.statNumber}>{stats?.totalClasses ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.statNumber}>{stats?.marksToEnter ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Pending Marks</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
              <Text style={styles.statNumber}>{stats?.weeklyPeriods ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Weekly Periods</Text>
            </View>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>📅</Text>
            <Text style={styles.emptyStateMessage}>Today's schedule is not available at the moment.</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderTopColor: action.color }]}
                onPress={() => onNavigate(action.screen, { user, token })}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Classes</Text>
          {myClasses.length > 0 ? (
            myClasses.map((classItem) => (
              <TouchableOpacity key={classItem.id} style={styles.classCard}>
                <View style={styles.classHeader}>
                  <Text style={styles.className}>{classItem.name}</Text>
                </View>
                <Text style={styles.classSubject}>{classItem.subject}</Text>
                <Text style={styles.classStudents}>👥 {classItem.students} Students</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>📚</Text>
              <Text style={styles.emptyStateMessage}>You are not assigned to any classes.</Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>10 minutes ago</Text>
            <Text style={styles.activityText}>📝 Marks entered for Grade 10-A Mathematics Quiz</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>1 hour ago</Text>
            <Text style={styles.activityText}>📋 Attendance recorded for Grade 11-B Physics</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>2 hours ago</Text>
            <Text style={styles.activityText}>📧 Message sent to parent about homework completion</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#3498db',
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
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleTime: {
    width: 80,
    alignItems: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#ecf0f1',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  scheduleDetails: {
    flex: 1,
    paddingLeft: 15,
  },
  scheduleClass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scheduleSubject: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  scheduleRoom: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  scheduleActions: {
    paddingLeft: 15,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
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
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classTime: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  classSubject: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  classStudents: {
    fontSize: 12,
    color: '#95a5a6',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default TeacherDashboard; 