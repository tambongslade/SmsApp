import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';
import GuidanceCounselorBottomNavigation from '../GuidanceCounselorBottomNavigation';
import { useGuidanceCounselor } from '../GuidanceCounselorContext';
import {
  GuidanceCounselorStudentsScreen,
  GuidanceCounselorCommunicationsScreen,
} from '../guidanceCounselor';

interface GuidanceCounselorDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

const GuidanceCounselorDashboard: React.FC<GuidanceCounselorDashboardProps> = ({
  user,
  onLogout,
  onNavigate,
}) => {
  const {
    overview,
    students,
    messagingSummary,
    isLoading,
    error,
    fetchDashboard,
    fetchStudents,
    fetchMessaging,
  } = useGuidanceCounselor();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Get academic year from user or default
  const academicYearId = user?.selectedRole?.academicYearId || 1;
  const token = 'dummy-token'; // In real app, get from props or context

  useEffect(() => {
    // Load initial data when component mounts
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        fetchDashboard(token, academicYearId),
        fetchStudents(token, academicYearId),
        fetchMessaging(token),
      ]);
    } catch (err) {
      console.error('Error loading guidance counselor data:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleFABPress = () => {
    Alert.alert(
      'Quick Contact',
      'Choose contact method:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Emergency Hotline', 
          onPress: () => Alert.alert('Emergency', 'Calling emergency counseling hotline...') 
        },
        { 
          text: 'Contact Principal', 
          onPress: () => Alert.alert('Contact', 'Opening communication with Principal...') 
        },
      ]
    );
  };

  const getStudentsNeedingAttention = () => {
    return students.filter(student => 
      student.academicInfo?.teacherConcerns > 0 || 
      student.disciplineHistory?.totalIssues > 0 ||
      student.academicInfo?.attendanceRate < 85
    );
  };

  const renderDashboardContent = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* API Status Notice */}
      <View style={styles.apiStatusSection}>
        <Text style={styles.apiStatusTitle}>📊 API Status</Text>
        {error ? (
          <Text style={styles.apiStatusError}>
            ⚠️ {error}
          </Text>
        ) : (
          <Text style={styles.apiStatusSuccess}>
            ✅ Connected to available student and messaging APIs
          </Text>
        )}
        <Text style={styles.apiStatusNote}>
          Note: Limited counseling-specific endpoints available
        </Text>
      </View>

      {/* Student Overview */}
      {overview && (
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Student Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{students.length}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {getStudentsNeedingAttention().length}
              </Text>
              <Text style={styles.statLabel}>Need Attention</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#f39c12' }]}>
                {students.filter(s => 
                  s.disciplineHistory?.totalIssues >= 3 || 
                  s.academicInfo?.attendanceRate < 70
                ).length}
              </Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#3498db' }]}>
                {messagingSummary?.unreadMessages || 0}
              </Text>
              <Text style={styles.statLabel}>Unread Messages</Text>
            </View>
          </View>
        </View>
      )}

      {/* Students Requiring Attention */}
      <View style={styles.studentsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Students Requiring Attention</Text>
          <TouchableOpacity onPress={() => setActiveTab('students')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading && !refreshing ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading student data...</Text>
          </View>
        ) : getStudentsNeedingAttention().length === 0 ? (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataText}>
              No students currently require immediate attention
            </Text>
          </View>
        ) : (
          getStudentsNeedingAttention().slice(0, 3).map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentClass}>{student.class}</Text>
                </View>
                <View style={styles.concernsContainer}>
                  {student.academicInfo?.teacherConcerns > 0 && (
                    <View style={styles.concernBadge}>
                      <Text style={styles.concernText}>📚 Academic</Text>
                    </View>
                  )}
                  {student.disciplineHistory?.totalIssues > 0 && (
                    <View style={styles.concernBadge}>
                      <Text style={styles.concernText}>⚠️ Discipline</Text>
                    </View>
                  )}
                  {student.academicInfo?.attendanceRate < 85 && (
                    <View style={styles.concernBadge}>
                      <Text style={styles.concernText}>📅 Attendance</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveTab('students')}
          >
            <Text style={styles.actionIcon}>👨‍🎓</Text>
            <Text style={styles.actionLabel}>View Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveTab('communications')}
          >
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={styles.actionLabel}>Send Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Parent Contact', 'Select a student to contact their parent...')}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionLabel}>Contact Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Reports', 'Generate counseling reports (requires additional API endpoints)...')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messaging Summary */}
      {messagingSummary && (
        <View style={styles.messagingSection}>
          <Text style={styles.sectionTitle}>Communication Summary</Text>
          <View style={styles.messagingGrid}>
            <View style={styles.messagingCard}>
              <Text style={styles.messagingNumber}>{messagingSummary.totalSent}</Text>
              <Text style={styles.messagingLabel}>Messages Sent</Text>
            </View>
            <View style={styles.messagingCard}>
              <Text style={styles.messagingNumber}>{messagingSummary.totalReceived}</Text>
              <Text style={styles.messagingLabel}>Messages Received</Text>
            </View>
            <View style={styles.messagingCard}>
              <Text style={[styles.messagingNumber, { color: '#e74c3c' }]}>
                {messagingSummary.unreadMessages}
              </Text>
              <Text style={styles.messagingLabel}>Unread</Text>
            </View>
          </View>
        </View>
      )}

      {/* API Limitations Notice */}
      <View style={styles.limitationsSection}>
        <Text style={styles.limitationsTitle}>Current API Limitations</Text>
        <Text style={styles.limitationsText}>
          • No dedicated counseling session management endpoints{'\n'}
          • Limited counseling-specific data structures{'\n'}
          • No support program management APIs{'\n'}
          • Using general student and messaging endpoints{'\n'}
          • Manual case tracking recommended for detailed counseling records
        </Text>
        <TouchableOpacity 
          style={styles.contactAdminButton}
          onPress={() => Alert.alert('Contact Administrator', 'Request additional counseling API endpoints...')}
        >
          <Text style={styles.contactAdminText}>Contact Administrator for Full Features</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <GuidanceCounselorStudentsScreen 
            user={user}
            token={token}
            onNavigateBack={() => setActiveTab('dashboard')}
          />
        );
      case 'communications':
        return (
          <GuidanceCounselorCommunicationsScreen 
            user={user}
            token={token}
            onNavigateBack={() => setActiveTab('dashboard')}
          />
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9b59b6" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🧭 Guidance Counselor</Text>
          <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation */}
      <GuidanceCounselorBottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onFABPress={handleFABPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#9b59b6',
    padding: 20,
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
  tabContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 120, // Space for bottom navigation + FAB
  },
  apiStatusSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  apiStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  apiStatusSuccess: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 4,
  },
  apiStatusError: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 4,
  },
  apiStatusNote: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  overviewSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  studentsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: '#9b59b6',
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  noDataCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noDataText: {
    color: '#27ae60',
    fontSize: 14,
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  concernsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  concernBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  concernText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#f8f9fa',
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  messagingSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messagingGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  messagingCard: {
    backgroundColor: '#f8f9fa',
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messagingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  messagingLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  limitationsSection: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  limitationsText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
    marginBottom: 12,
  },
  contactAdminButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  contactAdminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default GuidanceCounselorDashboard; 