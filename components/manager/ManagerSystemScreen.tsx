import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useManager } from '../ManagerContext';

const ManagerSystemScreen: React.FC = () => {
  const { systemHealth } = useManager();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 95) return '#27ae60';
    if (percentage >= 85) return '#f39c12';
    return '#e74c3c';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return '#27ae60';
      case 'WARNING': return '#f39c12';
      case 'ERROR': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const mockSystemActivities = [
    { id: 1, type: 'BACKUP', message: 'Database backup completed successfully', time: '03:00 AM' },
    { id: 2, type: 'MAINTENANCE', message: 'System maintenance performed', time: 'Yesterday' },
    { id: 3, type: 'UPDATE', message: '12 new user accounts created this week', time: '2 hours ago' },
    { id: 4, type: 'SECURITY', message: '3 user permission issues resolved', time: '5 hours ago' },
  ];

  const mockDataStats = {
    totalStudents: 1245,
    totalUsers: 298,
    academicData: 15670,
    financialRecords: 3456,
    dataIntegrity: 99.8
  };

  const handleSystemAction = (action: string) => {
    switch (action) {
      case 'backup':
        Alert.alert('System Backup', 'Are you sure you want to start a manual backup?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Backup', onPress: () => Alert.alert('Success', 'Backup started successfully') }
        ]);
        break;
      case 'maintenance':
        Alert.alert('System Maintenance', 'Schedule system maintenance for this weekend?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Schedule', onPress: () => Alert.alert('Scheduled', 'Maintenance scheduled for this weekend') }
        ]);
        break;
      case 'diagnostics':
        Alert.alert('System Diagnostics', 'Running comprehensive system diagnostics...', [
          { text: 'OK', onPress: () => Alert.alert('Complete', 'All systems running normally') }
        ]);
        break;
      default:
        Alert.alert('Action', `${action} feature coming soon`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* System Health Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖥️ System Health</Text>
          
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Text style={styles.healthTitle}>Overall Health</Text>
              <Text style={[styles.healthScore, { color: getHealthColor(systemHealth.overallHealth) }]}>
                {systemHealth.overallHealth}%
              </Text>
            </View>
            
            <View style={styles.healthProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${systemHealth.overallHealth}%`, 
                      backgroundColor: getHealthColor(systemHealth.overallHealth) 
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.healthDetails}>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Database</Text>
                <View style={styles.healthStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(systemHealth.databaseStatus) }]} />
                  <Text style={[styles.healthValue, { color: getStatusColor(systemHealth.databaseStatus) }]}>
                    {systemHealth.databaseStatus}
                  </Text>
                </View>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Response Time</Text>
                <Text style={[styles.healthValue, { color: systemHealth.apiResponseTime < 300 ? '#27ae60' : '#f39c12' }]}>
                  {systemHealth.apiResponseTime}ms
                </Text>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>Server Load</Text>
                <Text style={[styles.healthValue, { color: systemHealth.serverLoad < 50 ? '#27ae60' : '#f39c12' }]}>
                  {systemHealth.serverLoad}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 System Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{systemHealth.activeSessions}</Text>
              <Text style={styles.metricLabel}>Active Sessions</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{systemHealth.storageUsed}%</Text>
              <Text style={styles.metricLabel}>Storage Used</Text>
            </View>
          </View>

          <View style={styles.backupCard}>
            <View style={styles.backupInfo}>
              <Text style={styles.backupTitle}>Last Backup</Text>
              <Text style={styles.backupTime}>{formatDate(systemHealth.lastBackup)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.backupButton}
              onPress={() => handleSystemAction('backup')}
            >
              <Text style={styles.backupButtonText}>Manual Backup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>
          
          <View style={styles.dataCard}>
            <Text style={styles.dataTitle}>Database Records</Text>
            
            <View style={styles.dataStats}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Students</Text>
                <Text style={styles.dataValue}>{mockDataStats.totalStudents.toLocaleString()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Users</Text>
                <Text style={styles.dataValue}>{mockDataStats.totalUsers.toLocaleString()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Academic Data</Text>
                <Text style={styles.dataValue}>{mockDataStats.academicData.toLocaleString()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Financial Records</Text>
                <Text style={styles.dataValue}>{mockDataStats.financialRecords.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.integrityCard}>
              <Text style={styles.integrityLabel}>Data Integrity</Text>
              <Text style={[styles.integrityValue, { color: '#27ae60' }]}>
                {mockDataStats.dataIntegrity}% ✅
              </Text>
            </View>
          </View>
        </View>

        {/* System Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Recent Activities</Text>
          
          {mockSystemActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <View style={[styles.activityType, { backgroundColor: getActivityColor(activity.type) }]}>
                <Text style={styles.activityTypeText}>{getActivityIcon(activity.type)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* System Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ System Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.systemActionCard}
              onPress={() => handleSystemAction('diagnostics')}
            >
              <Text style={styles.systemActionIcon}>🔍</Text>
              <Text style={styles.systemActionLabel}>Run Diagnostics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.systemActionCard}
              onPress={() => handleSystemAction('maintenance')}
            >
              <Text style={styles.systemActionIcon}>🔧</Text>
              <Text style={styles.systemActionLabel}>Schedule Maintenance</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.systemActionCard}
              onPress={() => handleSystemAction('cleanup')}
            >
              <Text style={styles.systemActionIcon}>🧹</Text>
              <Text style={styles.systemActionLabel}>Data Cleanup</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.systemActionCard}
              onPress={() => handleSystemAction('performance')}
            >
              <Text style={styles.systemActionIcon}>📈</Text>
              <Text style={styles.systemActionLabel}>Performance Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );

  function getActivityColor(type: string) {
    switch (type) {
      case 'BACKUP': return '#27ae60';
      case 'MAINTENANCE': return '#3498db';
      case 'UPDATE': return '#f39c12';
      case 'SECURITY': return '#e74c3c';
      default: return '#7f8c8d';
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'BACKUP': return '💾';
      case 'MAINTENANCE': return '🔧';
      case 'UPDATE': return '🔄';
      case 'SECURITY': return '🔒';
      default: return '📝';
    }
  }
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  healthCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  healthScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  healthProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthDetails: {
    gap: 8,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  healthLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  backupCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backupInfo: {
    flex: 1,
  },
  backupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  backupTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  backupButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  dataStats: {
    gap: 8,
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  integrityCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  integrityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  integrityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
    marginRight: 12,
  },
  activityMessage: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  activityType: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTypeText: {
    fontSize: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  systemActionCard: {
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
  systemActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  systemActionLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ManagerSystemScreen; 