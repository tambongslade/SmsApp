import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// --- Interfaces based on parent.workflow.md ---

interface ChildSummary {
  id: number;
  name: string;
  className?: string;
  subclassName?: string;
  photo?: string;
  attendanceRate: number; // Percentage
  latestAverage: number; // Assuming this is derived or provided
  pendingFees: number; // Individual child's pending fees
  disciplineIssues: number; // Child's discipline issues
}

interface RecentActivity {
  id: string;
  message: string;
}

interface DashboardData {
  totalChildren: number;
  childrenEnrolled: number;
  pendingFees: number; // Total fees owed in FCFA
  latestGrades: number; // Count of recent grades
  disciplineIssues: number; // Active discipline issues
  unreadMessages: number; // Unread messages count
  upcomingEvents: number; // Upcoming school events
  children: ChildSummary[];
}

type ParentDashboardProps = NativeStackScreenProps<RootStackParamList, 'ParentDashboard'> & {
  onLogout: () => void;
};

// --- Mock Data ---

const mockDashboardData: DashboardData = {
  totalChildren: 2,
  childrenEnrolled: 2,
  pendingFees: 50000,
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
      photo: 'https://via.placeholder.com/80',
      attendanceRate: 92,
      latestAverage: 15.2,
      pendingFees: 25000,
      disciplineIssues: 0,
    },
    {
      id: 2,
      name: 'Mary Doe',
      className: 'Form 3B',
      photo: 'https://via.placeholder.com/80',
      attendanceRate: 95,
      latestAverage: 14.8,
      pendingFees: 25000,
      disciplineIssues: 0,
    },
  ],
};

const mockRecentActivity: RecentActivity[] = [
  { id: '1', message: "New quiz result for John - Math (85%)" },
  { id: '2', message: "Fee payment recorded for Mary - 25,000 FCFA" },
  { id: '3', message: "New announcement: Parent-Teacher Meeting" },
];

const ParentDashboard: React.FC<ParentDashboardProps> = ({ navigation, onLogout }) => {
  const data = mockDashboardData;
  const parentName = 'Mr. Doe'; // This would come from user data

  const quickStats = [
    { title: 'Total Children', value: data.totalChildren, icon: '👨‍👩‍👧‍👦' },
    { title: 'Pending Fees', value: `${data.pendingFees.toLocaleString()} FCFA`, icon: '💰' },
    { title: 'Enrolled', value: data.childrenEnrolled, icon: '📚' },
    { title: 'Latest Grades', value: data.latestGrades, icon: '📊' },
    { title: 'Discipline Issues', value: data.disciplineIssues, icon: '⚠️' },
    { title: 'Unread Messages', value: data.unreadMessages, icon: '📧' },
    { title: 'Upcoming Events', value: data.upcomingEvents, icon: '📅' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>School Management</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('ParentAnnouncements')}>
              <Text style={styles.headerIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ParentMessages')}>
              <Text style={styles.headerIcon}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ParentSettings')}>
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout}>
              <Text style={styles.headerIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Welcome back, {parentName} | Academic Year: 2024-2025
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          {data.children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => navigation.navigate('ChildDetails', { studentId: child.id })}
            >
              <View style={styles.childRow}>
                <Image source={{ uri: child.photo }} style={styles.childPhoto} />
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childClass}>{child.className} - {child.subclassName}</Text>
                  <View style={styles.childDetailsColumn}>
                    <View style={styles.childDetailRow}>
                      <Text style={styles.childDetailIcon}>📊</Text>
                      <Text style={styles.childDetailLabel}>Attendance:</Text>
                      <Text style={styles.childDetailValue}>{child.attendanceRate}%</Text>
                    </View>
                    <View style={styles.childDetailRow}>
                      <Text style={styles.childDetailIcon}>📚</Text>
                      <Text style={styles.childDetailLabel}>Average:</Text>
                      <Text style={styles.childDetailValue}>{child.latestAverage}/20</Text>
                    </View>
                    <View style={styles.childDetailRow}>
                      <Text style={styles.childDetailIcon}>💰</Text>
                      <Text style={styles.childDetailLabel}>Pending Fees:</Text>
                      <Text style={styles.childDetailValue}>{child.pendingFees.toLocaleString()} FCFA</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {mockRecentActivity.map((activity) => (
              <Text key={activity.id} style={styles.activityText}>
                • {activity.message}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 22,
    marginLeft: 16,
  },
  headerSubtitle: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    width: '48%',
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  childClass: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  childDetailsColumn: {
    flexDirection: 'column',
    gap: 2,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  childDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  childDetailIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  childDetailLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
    fontWeight: '500',
  },
  childDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activityText: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 6,
  },
});

export default ParentDashboard; 