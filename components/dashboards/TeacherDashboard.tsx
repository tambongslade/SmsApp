import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
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

  const teachingStats = {
    totalStudents: 145,
    classes: 6,
    subjects: 3,
    pendingMarks: 28,
    attendance: 92,
    upcomingExams: 2,
  };

  const myClasses = [
    { id: '1', name: 'Grade 10-A', subject: 'Mathematics', students: 25, time: '08:00 AM' },
    { id: '2', name: 'Grade 10-B', subject: 'Mathematics', students: 28, time: '09:00 AM' },
    { id: '3', name: 'Grade 11-A', subject: 'Physics', students: 22, time: '11:00 AM' },
    { id: '4', name: 'Grade 11-B', subject: 'Physics', students: 24, time: '02:00 PM' },
    { id: '5', name: 'Grade 9-A', subject: 'Science', students: 26, time: '03:00 PM' },
    { id: '6', name: 'Grade 9-B', subject: 'Science', students: 20, time: '04:00 PM' },
  ];

  const quickActions = [
    { id: '1', title: 'Take Attendance', icon: '📋', color: '#2ecc71', description: 'Mark student attendance' },
    { id: '2', title: 'Enter Marks', icon: '📝', color: '#3498db', description: 'Record student grades' },
    { id: '3', title: 'Create Questions', icon: '❓', color: '#9b59b6', description: 'Exam question bank' },
    { id: '4', title: 'View Students', icon: '👥', color: '#f39c12', description: 'Student information' },
    { id: '5', title: 'Assignments', icon: '📚', color: '#e67e22', description: 'Homework & projects' },
    { id: '6', title: 'Messages', icon: '📧', color: '#1abc9c', description: 'Parent communication' },
  ];

  const todaySchedule = [
    { time: '08:00 AM', class: 'Grade 10-A', subject: 'Mathematics', room: 'Room 205' },
    { time: '09:00 AM', class: 'Grade 10-B', subject: 'Mathematics', room: 'Room 205' },
    { time: '11:00 AM', class: 'Grade 11-A', subject: 'Physics', room: 'Lab 301' },
    { time: '02:00 PM', class: 'Grade 11-B', subject: 'Physics', room: 'Lab 301' },
  ];

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Teaching Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
              <Text style={styles.statNumber}>{teachingStats.totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.statNumber}>{teachingStats.classes}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.statNumber}>{teachingStats.pendingMarks}</Text>
              <Text style={styles.statLabel}>Pending Marks</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
              <Text style={styles.statNumber}>{teachingStats.attendance}%</Text>
              <Text style={styles.statLabel}>Avg Attendance</Text>
            </View>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {todaySchedule.map((schedule, index) => (
            <TouchableOpacity key={index} style={styles.scheduleCard}>
              <View style={styles.scheduleTime}>
                <Text style={styles.timeText}>{schedule.time}</Text>
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleClass}>{schedule.class}</Text>
                <Text style={styles.scheduleSubject}>{schedule.subject}</Text>
                <Text style={styles.scheduleRoom}>📍 {schedule.room}</Text>
              </View>
              <View style={styles.scheduleActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>📋</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderTopColor: action.color }]}
                onPress={() => Alert.alert(action.title, action.description)}
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
          {myClasses.map((classItem) => (
            <TouchableOpacity key={classItem.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classTime}>{classItem.time}</Text>
              </View>
              <Text style={styles.classSubject}>{classItem.subject}</Text>
              <Text style={styles.classStudents}>👥 {classItem.students} Students</Text>
            </TouchableOpacity>
          ))}
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
});

export default TeacherDashboard; 