import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { User } from '../LoginScreen';
import { ManagerProvider, useManager } from '../ManagerContext';
import ManagerBottomNavigation from '../ManagerBottomNavigation';
import { ManagerUsersScreen, ManagerSystemScreen, ManagerTasksScreen } from '../manager';

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const ManagerDashboardContent: React.FC<ManagerDashboardProps> = ({ user, onLogout, onNavigate }) => {
  const { operationalMetrics, systemHealth, taskSummary } = useManager();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFABPress = () => {
    onNavigate('ParentMessagesScreen');
  };

  const renderDashboard = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏢 School Manager</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
          <Text style={styles.roleText}>Administrative Operations & Support</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Operational Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Operations Overview</Text>
        
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{operationalMetrics.totalStaff}</Text>
              <Text style={styles.overviewLabel}>Staff</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{operationalMetrics.totalClasses}</Text>
              <Text style={styles.overviewLabel}>Classes</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{operationalMetrics.totalStudents.toLocaleString()}</Text>
              <Text style={styles.overviewLabel}>Students</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{operationalMetrics.systemHealth}%</Text>
              <Text style={styles.overviewLabel}>System Health</Text>
            </View>
          </View>
          
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNumber, { color: '#f39c12' }]}>{operationalMetrics.pendingTasks}</Text>
              <Text style={styles.overviewLabel}>Pending Tasks</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNumber, { color: '#e74c3c' }]}>{operationalMetrics.issuesRequiring}</Text>
              <Text style={styles.overviewLabel}>Issues</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNumber, { color: '#27ae60' }]}>{operationalMetrics.operationalEfficiency}%</Text>
              <Text style={styles.overviewLabel}>Efficiency</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNumber, { color: '#3498db' }]}>{systemHealth.activeSessions}</Text>
              <Text style={styles.overviewLabel}>Active Users</Text>
            </View>
          </View>
        </View>
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖥️ System Status</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Database</Text>
              <Text style={[styles.statusValue, { color: getSystemColor(systemHealth.databaseStatus) }]}>
                {systemHealth.databaseStatus}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: getSystemColor(systemHealth.databaseStatus) }]} />
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Response Time</Text>
              <Text style={[styles.statusValue, { color: systemHealth.apiResponseTime < 300 ? '#27ae60' : '#f39c12' }]}>
                {systemHealth.apiResponseTime}ms
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: systemHealth.apiResponseTime < 300 ? '#27ae60' : '#f39c12' }]} />
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Storage Used</Text>
              <Text style={[styles.statusValue, { color: systemHealth.storageUsed > 80 ? '#e74c3c' : '#27ae60' }]}>
                {systemHealth.storageUsed}%
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: systemHealth.storageUsed > 80 ? '#e74c3c' : '#27ae60' }]} />
          </View>
        </View>
      </View>

      {/* Task Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Task Summary</Text>
        
        <View style={styles.taskSummaryCard}>
          <View style={styles.taskSummaryHeader}>
            <Text style={styles.taskSummaryTitle}>Administrative Tasks</Text>
            <Text style={styles.taskProgress}>{taskSummary.overallProgress}% Complete</Text>
          </View>
          
          <View style={styles.taskCounts}>
            <View style={styles.taskCount}>
              <Text style={[styles.taskCountNumber, { color: '#e74c3c' }]}>{taskSummary.myTasks.overdue}</Text>
              <Text style={styles.taskCountLabel}>Overdue</Text>
            </View>
            <View style={styles.taskCount}>
              <Text style={[styles.taskCountNumber, { color: '#f39c12' }]}>{taskSummary.myTasks.dueToday}</Text>
              <Text style={styles.taskCountLabel}>Due Today</Text>
            </View>
            <View style={styles.taskCount}>
              <Text style={[styles.taskCountNumber, { color: '#3498db' }]}>{taskSummary.teamTasks.active}</Text>
              <Text style={styles.taskCountLabel}>Team Tasks</Text>
            </View>
            <View style={styles.taskCount}>
              <Text style={[styles.taskCountNumber, { color: '#27ae60' }]}>{taskSummary.teamTasks.completedThisMonth}</Text>
              <Text style={styles.taskCountLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('users')}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionLabel}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('system')}>
            <Text style={styles.actionIcon}>🖥️</Text>
            <Text style={styles.actionLabel}>System Health</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('tasks')}>
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={styles.actionLabel}>Task Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => handleFABPress()}>
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={styles.actionLabel}>Send Announcement</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Recent Activities</Text>
        
        <View style={styles.activitiesCard}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>👤</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New teacher account created</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🔄</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>System backup completed</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Monthly report generated</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>👥</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Staff meeting scheduled</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const getSystemColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return '#27ae60';
      case 'WARNING': return '#f39c12';
      case 'ERROR': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return <ManagerUsersScreen />;
      case 'system':
        return <ManagerSystemScreen />;
      case 'tasks':
        return <ManagerTasksScreen />;
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {renderContent()}
      
      <ManagerBottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onFABPress={handleFABPress}
      />
    </SafeAreaView>
  );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = (props) => {
  return (
    <ManagerProvider>
      <ManagerDashboardContent {...props} />
    </ManagerProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    marginHorizontal: -16,
    marginTop: -16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  roleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  overviewCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  overviewLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskSummaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  taskProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  taskCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskCount: {
    alignItems: 'center',
  },
  taskCountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCountLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  activitiesCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
});

export default ManagerDashboard; 