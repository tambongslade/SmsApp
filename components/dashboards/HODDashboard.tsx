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
import { HODProvider, useHOD } from '../HODContext';
import HODBottomNavigation from '../HODBottomNavigation';
import { HODDepartmentScreen, HODResourcesScreen, HODReportsScreen } from '../hod';

interface HODDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const HODDashboardContent: React.FC<HODDashboardProps> = ({ user, onLogout, onNavigate }) => {
  const { departmentStats } = useHOD();
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
          <Text style={styles.headerTitle}>🎓 Head of Department</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
          <Text style={styles.departmentText}>{departmentStats.departmentName} Department</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Teaching Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 My Teaching</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>My Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>85</Text>
            <Text style={styles.statLabel}>My Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Marks to Enter</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Periods Today</Text>
          </View>
        </View>
      </View>

      {/* Department Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏢 Department Overview</Text>
        <View style={styles.departmentCard}>
          <View style={styles.departmentHeader}>
            <Text style={styles.departmentName}>{departmentStats.departmentName} Department</Text>
            <Text style={styles.departmentRank}>#{departmentStats.schoolRanking} in School</Text>
          </View>
          
          <View style={styles.departmentStats}>
            <View style={styles.departmentStat}>
              <Text style={styles.departmentStatNumber}>{departmentStats.totalTeachers}</Text>
              <Text style={styles.departmentStatLabel}>Teachers</Text>
            </View>
            <View style={styles.departmentStat}>
              <Text style={styles.departmentStatNumber}>{departmentStats.totalStudents}</Text>
              <Text style={styles.departmentStatLabel}>Students</Text>
            </View>
            <View style={styles.departmentStat}>
              <Text style={styles.departmentStatNumber}>{departmentStats.departmentAverage.toFixed(1)}/20</Text>
              <Text style={styles.departmentStatLabel}>Avg Score</Text>
            </View>
            <View style={styles.departmentStat}>
              <Text style={styles.departmentStatNumber}>{departmentStats.attendanceRate}%</Text>
              <Text style={styles.departmentStatLabel}>Attendance</Text>
            </View>
          </View>

          <View style={styles.trendCard}>
            <Text style={styles.trendText}>
              📈 {departmentStats.trend} {departmentStats.trendValue > 0 ? '+' : ''}{departmentStats.trendValue}% this term
            </Text>
          </View>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>8:00 - 9:00</Text>
            <Text style={styles.scheduleSubject}>Mathematics - Form 5A</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>10:00 - 11:00</Text>
            <Text style={styles.scheduleSubject}>Mathematics - Form 4B</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>2:00 - 3:00</Text>
            <Text style={styles.scheduleSubject}>Mathematics - Form 4A</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>3:00 - 4:00</Text>
            <Text style={styles.scheduleSubject}>Department Meeting</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('department')}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionLabel}>Manage Teachers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('resources')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionLabel}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('reports')}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('MessagesScreen')}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'department':
        return <HODDepartmentScreen />;
      case 'resources':
        return <HODResourcesScreen />;
      case 'reports':
        return <HODReportsScreen />;
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2ecc71" />
      
      {renderContent()}
      
      <HODBottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onFABPress={handleFABPress}
      />
    </SafeAreaView>
  );
};

const HODDashboard: React.FC<HODDashboardProps> = (props) => {
  return (
    <HODProvider>
      <HODDashboardContent {...props} />
    </HODProvider>
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
    backgroundColor: '#2ecc71',
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
  departmentText: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  departmentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  departmentRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
  departmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  departmentStat: {
    alignItems: 'center',
  },
  departmentStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  departmentStatLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  trendText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    width: 80,
  },
  scheduleSubject: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
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
  },
});

export default HODDashboard; 