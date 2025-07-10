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

interface SuperManagerDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const SuperManagerDashboard: React.FC<SuperManagerDashboardProps> = ({ user, onLogout }) => {
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

  const systemStats = {
    totalUsers: 245,
    activeStudents: 1850,
    totalTeachers: 65,
    totalStaff: 89,
    pendingApprovals: 12,
    systemAlerts: 3,
  };

  const quickActions = [
    { id: '1', title: 'User Management', icon: '👥', color: '#e74c3c', description: 'Create, edit, delete users' },
    { id: '2', title: 'Academic Structure', icon: '🏫', color: '#3498db', description: 'Manage classes, subjects' },
    { id: '3', title: 'Student Management', icon: '🎓', color: '#2ecc71', description: 'Full student operations' },
    { id: '4', title: 'Financial Operations', icon: '💰', color: '#f39c12', description: 'Fee structure, payments' },
    { id: '5', title: 'Examination System', icon: '📝', color: '#9b59b6', description: 'Exam sequences, marks' },
    { id: '6', title: 'Reports & Analytics', icon: '📊', color: '#1abc9c', description: 'Comprehensive reports' },
    { id: '7', title: 'Communication Hub', icon: '📢', color: '#e67e22', description: 'System announcements' },
    { id: '8', title: 'System Settings', icon: '⚙️', color: '#34495e', description: 'Configuration & settings' },
  ];

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.statNumber}>{systemStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#2ecc71' }]}>
              <Text style={styles.statNumber}>{systemStats.activeStudents}</Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.statNumber}>{systemStats.totalTeachers}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
              <Text style={styles.statNumber}>{systemStats.totalStaff}</Text>
              <Text style={styles.statLabel}>Staff Members</Text>
            </View>
          </View>
        </View>

        {/* Critical Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertTitle}>Pending Approvals</Text>
              <Text style={styles.alertCount}>{systemStats.pendingApprovals}</Text>
            </View>
            <Text style={styles.alertDescription}>Role assignments and system changes require approval</Text>
          </View>
          
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>🚨</Text>
              <Text style={styles.alertTitle}>System Alerts</Text>
              <Text style={styles.alertCount}>{systemStats.systemAlerts}</Text>
            </View>
            <Text style={styles.alertDescription}>Critical system notifications require attention</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration Tools</Text>
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent System Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>2 minutes ago</Text>
            <Text style={styles.activityText}>👤 New teacher account created: Ms. Jennifer Adams</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>15 minutes ago</Text>
            <Text style={styles.activityText}>🏫 Class structure updated: Grade 10 sections modified</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityTime}>1 hour ago</Text>
            <Text style={styles.activityText}>💰 Fee structure approved for Academic Year 2024-25</Text>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Database Performance</Text>
              <View style={styles.healthBar}>
                <View style={[styles.healthFill, { width: '92%', backgroundColor: '#2ecc71' }]} />
              </View>
              <Text style={styles.healthValue}>92%</Text>
            </View>
            
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Server Load</Text>
              <View style={styles.healthBar}>
                <View style={[styles.healthFill, { width: '68%', backgroundColor: '#f39c12' }]} />
              </View>
              <Text style={styles.healthValue}>68%</Text>
            </View>
            
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Storage Usage</Text>
              <View style={styles.healthBar}>
                <View style={[styles.healthFill, { width: '45%', backgroundColor: '#3498db' }]} />
              </View>
              <Text style={styles.healthValue}>45%</Text>
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
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  alertCount: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  alertDescription: {
    fontSize: 14,
    color: '#7f8c8d',
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
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
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
    marginBottom: 15,
  },
  healthLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  healthBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 5,
  },
  healthFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthValue: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
  },
});

export default SuperManagerDashboard; 