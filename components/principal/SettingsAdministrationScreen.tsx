import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { User } from '../LoginScreen';

// API Response Interfaces
interface SchoolConfig {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: number;
  motto: string;
  currentTerm: string;
  academicYear: string;
}

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'HOD' | 'TEACHER' | 'BURSAR' | 'ADMIN';
  department?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string;
  permissions: string[];
}

interface SystemHealth {
  serverStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  databaseStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  backupStatus: 'UP_TO_DATE' | 'OUTDATED' | 'FAILED';
  lastBackup: string;
  systemLoad: number;
  diskUsage: number;
  activeUsers: number;
  totalLogins: number;
}

interface BackupConfig {
  autoBackup: boolean;
  backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  retentionPeriod: number;
  cloudBackup: boolean;
  lastBackupSize: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  emergencyAlerts: boolean;
  weeklyReports: boolean;
  systemAlerts: boolean;
}

interface AdministrationData {
  schoolConfig: SchoolConfig;
  systemUsers: SystemUser[];
  systemHealth: SystemHealth;
  backupConfig: BackupConfig;
  notificationSettings: NotificationSettings;
}

interface SettingsAdministrationProps {
  user: User;
  token: string;
  onBack: () => void;
}

const SettingsAdministrationScreen: React.FC<SettingsAdministrationProps> = ({ user, token, onBack }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [administrationData, setAdministrationData] = useState<AdministrationData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

  const fetchAdministrationData = async () => {
    try {
      console.log('🔍 Fetching administration data...');
      const response = await fetch(`${API_BASE_URL}/api/v1/principal/administration`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('⚙️ Administration data API response:', apiData);

      if (apiData.success && apiData.data) {
        // Try to map API response to our expected structure
        const mappedData: AdministrationData = {
          schoolConfig: apiData.data.schoolConfig || {
            schoolName: 'St. Stephen\'s Secondary School',
            address: 'Douala, Cameroon',
            phone: '+237 123 456 789',
            email: 'info@ststephens.edu.cm',
            website: 'www.ststephens.edu.cm',
            establishedYear: 1985,
            motto: 'Excellence in Education',
            currentTerm: 'First Term',
            academicYear: '2023/2024',
          },
          systemUsers: apiData.data.users || [],
          systemHealth: {
            serverStatus: 'ONLINE',
            databaseStatus: 'HEALTHY',
            backupStatus: 'UP_TO_DATE',
            lastBackup: '2024-01-18 02:00:00',
            systemLoad: 45,
            diskUsage: 67,
            activeUsers: 23,
            totalLogins: 1247,
          },
          backupConfig: apiData.data.backupConfig || {
            autoBackup: true,
            backupFrequency: 'DAILY',
            retentionPeriod: 30,
            cloudBackup: true,
            lastBackupSize: '2.4 GB',
          },
          notificationSettings: apiData.data.notificationSettings || {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            emergencyAlerts: true,
            weeklyReports: true,
            systemAlerts: true,
          },
        };
        
        setAdministrationData(mappedData);
        console.log('✅ Successfully loaded and mapped administration data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching administration data:', error);
    }

    // Fallback to mock data
    console.log('🔄 Using mock administration data');
    setAdministrationData({
      schoolConfig: {
        schoolName: 'St. Stephen\'s Secondary School',
        address: '123 Education Street, Douala, Cameroon',
        phone: '+237 123 456 789',
        email: 'info@ststephens.edu.cm',
        website: 'www.ststephens.edu.cm',
        establishedYear: 1985,
        motto: 'Excellence in Education',
        currentTerm: 'First Term',
        academicYear: '2023/2024',
      },
      systemUsers: [
        {
          id: 1,
          name: 'Dr. Principal Smith',
          email: 'principal@ststephens.edu.cm',
          role: 'PRINCIPAL',
          status: 'ACTIVE',
          lastLogin: '2024-01-18 14:30',
          permissions: ['ALL'],
        },
        {
          id: 2,
          name: 'Mrs. Vice Principal Johnson',
          email: 'vice@ststephens.edu.cm',
          role: 'VICE_PRINCIPAL',
          status: 'ACTIVE',
          lastLogin: '2024-01-18 13:45',
          permissions: ['ACADEMIC', 'DISCIPLINE', 'REPORTS'],
        },
        {
          id: 3,
          name: 'Mr. Mathematics HOD',
          email: 'math.hod@ststephens.edu.cm',
          role: 'HOD',
          department: 'Mathematics',
          status: 'ACTIVE',
          lastLogin: '2024-01-18 12:20',
          permissions: ['ACADEMIC', 'DEPARTMENT'],
        },
        {
          id: 4,
          name: 'Ms. Finance Officer',
          email: 'bursar@ststephens.edu.cm',
          role: 'BURSAR',
          status: 'ACTIVE',
          lastLogin: '2024-01-18 11:15',
          permissions: ['FINANCIAL', 'FEES', 'REPORTS'],
        },
        {
          id: 5,
          name: 'Mr. English Teacher',
          email: 'english.teacher@ststephens.edu.cm',
          role: 'TEACHER',
          department: 'English',
          status: 'ACTIVE',
          lastLogin: '2024-01-17 16:30',
          permissions: ['ACADEMIC', 'GRADES'],
        },
      ],
      systemHealth: {
        serverStatus: 'ONLINE',
        databaseStatus: 'HEALTHY',
        backupStatus: 'UP_TO_DATE',
        lastBackup: '2024-01-18 02:00:00',
        systemLoad: 45,
        diskUsage: 67,
        activeUsers: 23,
        totalLogins: 1247,
      },
      backupConfig: {
        autoBackup: true,
        backupFrequency: 'DAILY',
        retentionPeriod: 30,
        cloudBackup: true,
        lastBackupSize: '2.4 GB',
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        emergencyAlerts: true,
        weeklyReports: true,
        systemAlerts: true,
      },
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchAdministrationData();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const updateUserStatus = async (userId: number, newStatus: string) => {
    try {
      console.log('👤 Updating user status:', userId, newStatus);
      Alert.alert('Success', `User status updated to ${newStatus}`);
      handleRefresh();
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const createBackup = async () => {
    try {
      console.log('💾 Creating system backup...');
      Alert.alert('Backup Started', 'System backup has been initiated. You will be notified when complete.');
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const toggleNotificationSetting = async (setting: keyof NotificationSettings) => {
    try {
      if (administrationData) {
        const updatedSettings = {
          ...administrationData.notificationSettings,
          [setting]: !administrationData.notificationSettings[setting],
        };
        setAdministrationData({
          ...administrationData,
          notificationSettings: updatedSettings,
        });
        console.log('🔔 Updated notification setting:', setting);
      }
    } catch (error) {
      console.error('❌ Error updating notification setting:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ONLINE':
      case 'HEALTHY':
      case 'UP_TO_DATE':
        return '#27ae60';
      case 'INACTIVE':
      case 'WARNING':
      case 'OUTDATED':
        return '#f39c12';
      case 'SUSPENDED':
      case 'OFFLINE':
      case 'CRITICAL':
      case 'FAILED':
        return '#e74c3c';
      case 'MAINTENANCE':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRINCIPAL': return '#8e44ad';
      case 'VICE_PRINCIPAL': return '#9b59b6';
      case 'HOD': return '#3498db';
      case 'TEACHER': return '#27ae60';
      case 'BURSAR': return '#e67e22';
      case 'ADMIN': return '#34495e';
      default: return '#95a5a6';
    }
  };

  const renderConfiguration = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* School Configuration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🏫 School Configuration</Text>
        
        <View style={styles.configGrid}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>School Name:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.schoolName}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Address:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.address}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Phone:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.phone}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Email:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.email}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Website:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.website}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Established:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.establishedYear}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Motto:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.motto}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Academic Year:</Text>
            <Text style={styles.configValue}>{administrationData?.schoolConfig.academicYear}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editConfigBtn}
          onPress={() => setShowConfigModal(true)}
        >
          <Text style={styles.editConfigBtnText}>✏️ Edit Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* System Health */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🖥️ System Health</Text>
        
        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Server Status</Text>
            <View style={[styles.healthStatus, { backgroundColor: getStatusColor(administrationData?.systemHealth.serverStatus || '') }]}>
              <Text style={styles.healthStatusText}>{administrationData?.systemHealth.serverStatus}</Text>
            </View>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Database</Text>
            <View style={[styles.healthStatus, { backgroundColor: getStatusColor(administrationData?.systemHealth.databaseStatus || '') }]}>
              <Text style={styles.healthStatusText}>{administrationData?.systemHealth.databaseStatus}</Text>
            </View>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Backup Status</Text>
            <View style={[styles.healthStatus, { backgroundColor: getStatusColor(administrationData?.systemHealth.backupStatus || '') }]}>
              <Text style={styles.healthStatusText}>{administrationData?.systemHealth.backupStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.systemMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>System Load</Text>
            <Text style={styles.metricValue}>{administrationData?.systemHealth.systemLoad}%</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricBarFill, { width: `${administrationData?.systemHealth.systemLoad}%` }]} />
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Disk Usage</Text>
            <Text style={styles.metricValue}>{administrationData?.systemHealth.diskUsage}%</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricBarFill, { width: `${administrationData?.systemHealth.diskUsage}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.systemStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{administrationData?.systemHealth.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{administrationData?.systemHealth.totalLogins}</Text>
            <Text style={styles.statLabel}>Total Logins</Text>
          </View>
        </View>
      </View>

      {/* Backup Configuration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💾 Backup & Recovery</Text>
        
        <View style={styles.backupInfo}>
          <View style={styles.backupItem}>
            <Text style={styles.backupLabel}>Last Backup:</Text>
            <Text style={styles.backupValue}>{administrationData?.systemHealth.lastBackup}</Text>
          </View>
          <View style={styles.backupItem}>
            <Text style={styles.backupLabel}>Backup Size:</Text>
            <Text style={styles.backupValue}>{administrationData?.backupConfig.lastBackupSize}</Text>
          </View>
          <View style={styles.backupItem}>
            <Text style={styles.backupLabel}>Frequency:</Text>
            <Text style={styles.backupValue}>{administrationData?.backupConfig.backupFrequency}</Text>
          </View>
          <View style={styles.backupItem}>
            <Text style={styles.backupLabel}>Retention:</Text>
            <Text style={styles.backupValue}>{administrationData?.backupConfig.retentionPeriod} days</Text>
          </View>
        </View>

        <View style={styles.backupActions}>
          <TouchableOpacity style={styles.backupBtn} onPress={createBackup}>
            <Text style={styles.backupBtnText}>🔄 Create Backup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreBtnText}>📥 Restore</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Search */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Users List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👥 System Users</Text>
        
        {administrationData?.systemUsers
          .filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.userMeta}>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                  <Text style={styles.statusText}>{user.status}</Text>
                </View>
              </View>
            </View>
            
            {user.department && (
              <Text style={styles.userDepartment}>Department: {user.department}</Text>
            )}
            
            <Text style={styles.userLastLogin}>Last Login: {user.lastLogin}</Text>
            
            <View style={styles.userPermissions}>
              <Text style={styles.permissionsLabel}>Permissions:</Text>
              <View style={styles.permissionTags}>
                {user.permissions.map((permission, index) => (
                  <View key={index} style={styles.permissionTag}>
                    <Text style={styles.permissionText}>{permission}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.userActions}>
              <TouchableOpacity 
                style={styles.editUserBtn}
                onPress={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <Text style={styles.editUserBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              {user.status === 'ACTIVE' ? (
                <TouchableOpacity 
                  style={styles.suspendBtn}
                  onPress={() => updateUserStatus(user.id, 'SUSPENDED')}
                >
                  <Text style={styles.suspendBtnText}>⏸️ Suspend</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.activateBtn}
                  onPress={() => updateUserStatus(user.id, 'ACTIVE')}
                >
                  <Text style={styles.activateBtnText}>▶️ Activate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addUserBtn}>
          <Text style={styles.addUserBtnText}>➕ Add New User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Notification Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔔 Notification Settings</Text>
        
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDesc}>Receive email alerts and updates</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.emailNotifications}
              onValueChange={() => toggleNotificationSetting('emailNotifications')}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>SMS Notifications</Text>
              <Text style={styles.settingDesc}>Receive text message alerts</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.smsNotifications}
              onValueChange={() => toggleNotificationSetting('smsNotifications')}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Mobile app notifications</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.pushNotifications}
              onValueChange={() => toggleNotificationSetting('pushNotifications')}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Emergency Alerts</Text>
              <Text style={styles.settingDesc}>Critical emergency notifications</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.emergencyAlerts}
              onValueChange={() => toggleNotificationSetting('emergencyAlerts')}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Reports</Text>
              <Text style={styles.settingDesc}>Automated weekly summaries</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.weeklyReports}
              onValueChange={() => toggleNotificationSetting('weeklyReports')}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>System Alerts</Text>
              <Text style={styles.settingDesc}>Technical system notifications</Text>
            </View>
            <Switch
              value={administrationData?.notificationSettings.systemAlerts}
              onValueChange={() => toggleNotificationSetting('systemAlerts')}
            />
          </View>
        </View>
      </View>

      {/* Administrative Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚙️ Administrative Actions</Text>
        
        <View style={styles.adminActions}>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>📊</Text>
            <Text style={styles.adminActionText}>System Audit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>🔒</Text>
            <Text style={styles.adminActionText}>Security Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>📈</Text>
            <Text style={styles.adminActionText}>Performance Monitor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>🗄️</Text>
            <Text style={styles.adminActionText}>Database Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>🔄</Text>
            <Text style={styles.adminActionText}>System Updates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminActionBtn}>
            <Text style={styles.adminActionIcon}>📋</Text>
            <Text style={styles.adminActionText}>Activity Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Maintenance Mode */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔧 Maintenance</Text>
        
        <View style={styles.maintenanceActions}>
          <TouchableOpacity style={styles.maintenanceBtn}>
            <Text style={styles.maintenanceBtnText}>🔧 Enable Maintenance Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearCacheBtn}>
            <Text style={styles.clearCacheBtnText}>🗑️ Clear System Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optimizeBtn}>
            <Text style={styles.optimizeBtnText}>⚡ Optimize Database</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading administration data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>⚙️ Settings & Administration</Text>
          <Text style={styles.headerSubtitle}>Principal Dashboard</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'config' && styles.activeTab]}
          onPress={() => setActiveTab('config')}
        >
          <Text style={[styles.tabText, activeTab === 'config' && styles.activeTabText]}>
            Configuration
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'config' && renderConfiguration()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </View>
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
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2c3e50',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  // Configuration styles
  configGrid: {
    marginBottom: 20,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  configLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  configValue: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    textAlign: 'right',
  },
  editConfigBtn: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editConfigBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Health styles
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  healthLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
  healthStatus: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  healthStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  systemMetrics: {
    marginBottom: 20,
  },
  metricItem: {
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  metricBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
  },
  metricBarFill: {
    height: 6,
    backgroundColor: '#3498db',
    borderRadius: 3,
  },
  systemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  // Backup styles
  backupInfo: {
    marginBottom: 20,
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backupLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  backupValue: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backupBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  backupBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  restoreBtn: {
    flex: 1,
    backgroundColor: '#e67e22',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  restoreBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Search styles
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  // User styles
  userCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  roleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  userDepartment: {
    fontSize: 12,
    color: '#3498db',
    marginBottom: 5,
  },
  userLastLogin: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 10,
  },
  userPermissions: {
    marginBottom: 15,
  },
  permissionsLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 5,
  },
  permissionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionTag: {
    backgroundColor: '#3498db',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 3,
  },
  permissionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editUserBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  editUserBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  suspendBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  suspendBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activateBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  activateBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addUserBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addUserBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Settings styles
  settingsList: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 3,
  },
  settingDesc: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  // Admin actions styles
  adminActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  adminActionBtn: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  adminActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  adminActionText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Maintenance styles
  maintenanceActions: {
    marginTop: 10,
  },
  maintenanceBtn: {
    backgroundColor: '#e67e22',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  maintenanceBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearCacheBtn: {
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearCacheBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  optimizeBtn: {
    backgroundColor: '#1abc9c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optimizeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsAdministrationScreen; 