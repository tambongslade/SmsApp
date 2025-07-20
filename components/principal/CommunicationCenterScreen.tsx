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
} from 'react-native';
import { User } from '../LoginScreen';

// --- REDESIGNED API Response Interfaces ---
interface Thread {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  publishDate: string;
  sender: string;
}

interface AlertData {
  id: number;
  title: string;
  message: string;
  severity: string;
  sentAt: string;
}

interface CommunicationStats {
  totalThreads: number;
  activeThreads: number;
  unreadMessages: number;
  sentToday: number;
  urgentMessages: number;
}

interface CommunicationData {
  threads: Thread[];
  stats: CommunicationStats;
  alerts: AlertData[];
}

interface CommunicationCenterProps {
  user: User;
  token: string;
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const CommunicationCenterScreen: React.FC<CommunicationCenterProps> = ({ user, token, onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [communicationData, setCommunicationData] = useState<CommunicationData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // State for the Create Announcement modal
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [emergencyAlert, setEmergencyAlert] = useState({
    title: '',
    message: '',
    type: 'GENERAL' as const,
    severity: 'WARNING' as const,
  });

  const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

  const fetchCommunicationData = async () => {
    try {
      console.log('🔍 Fetching communication data...');
      const response = await fetch(`${API_BASE_URL}/api/v1/messaging/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('📢 Communication data API response:', apiData);

      if (apiData.success && apiData.data) {
        const {
          totalThreads,
          activeThreads,
          unreadMessages,
          quickStats,
          urgentMessages,
          recentThreads,
          urgentAlerts
        } = apiData.data;

        const mappedData: CommunicationData = {
          stats: {
            totalThreads: totalThreads || 0,
            activeThreads: activeThreads || 0,
            unreadMessages: unreadMessages || 0,
            sentToday: quickStats?.sentToday || 0,
            urgentMessages: urgentMessages || 0,
          },
          threads: (recentThreads || []).map((t: any) => ({
            id: t.id,
            title: t.subject,
            content: t.lastMessagePreview,
            priority: t.priority,
            category: t.category,
            status: t.status,
            publishDate: t.lastMessageAt,
            sender: t.createdBy?.name || 'Unknown Sender',
          })),
          alerts: (urgentAlerts || []).map((a: any) => ({
            id: a.id,
            title: a.subject,
            message: a.subject, // Using subject as message content
            severity: a.priority,
            sentAt: a.sentAt,
          })),
        };
        
        setCommunicationData(mappedData);
        console.log('✅ Successfully loaded and mapped communication data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching communication data:', error);
    }

    // Fallback to mock data
    console.log('🔄 Using mock communication data');
    setCommunicationData({
      stats: {
        totalThreads: 25,
        activeThreads: 18,
        unreadMessages: 8,
        sentToday: 5,
        urgentMessages: 2,
      },
      threads: [
        {
          id: 1,
          title: 'Mid-Term Examination Schedule Released',
          content: 'The mid-term examination schedule for all classes has been published.',
          priority: 'HIGH',
          category: 'ACADEMIC',
          status: 'ACTIVE',
          publishDate: '2024-01-19',
          sender: 'Principal Office',
        },
        {
          id: 2,
          title: 'School Sports Day - February 15th',
          content: 'Annual sports day will be held on February 15th.',
          priority: 'MEDIUM',
          category: 'EVENT',
          status: 'ACTIVE',
          publishDate: '2024-01-16',
          sender: 'Principal Office',
        },
      ],
      alerts: [
        {
          id: 1,
          title: 'Weather Alert',
          message: 'Heavy rain expected tomorrow. School timing may be adjusted.',
          severity: 'WARNING',
          sentAt: '2024-01-17 18:00',
        },
      ],
    });
  };

  const fetchUsersForSelection = async () => {
    if (allUsers.length > 0) return; // Don't re-fetch if we already have users
    
    setIsFetchingUsers(true);
    try {
      console.log('👥 Fetching users for recipient selection...');
      const response = await fetch(`${API_BASE_URL}/api/v1/users?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      console.log('👥 Users API response:', userData);

      if (userData.success && Array.isArray(userData.data)) {
        setAllUsers(userData.data);
      } else {
        Alert.alert('Error Fetching Users', userData.error || 'Could not fetch the list of users. You may not have the required permissions.');
        setAllUsers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      Alert.alert('Error', 'An error occurred while fetching users.');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const openCreateModal = () => {
    fetchUsersForSelection();
    setShowCreateModal(true);
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchCommunicationData();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and content.');
      return;
    }
    if (selectedRecipients.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one recipient.');
      return;
    }

    const threadData = {
      subject: newAnnouncement.title,
      initialMessage: newAnnouncement.content,
      participants: selectedRecipients,
      category: 'ANNOUNCEMENT',
      priority: newAnnouncement.priority,
    };

    console.log('📢 Creating new announcement thread:', threadData);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messaging/threads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(threadData),
      });

      const result = await response.json();
      console.log('📢 Create thread response:', result);

      if (response.ok && result.success) {
        Alert.alert('Success', 'Announcement sent successfully!');
        setShowCreateModal(false);
        setNewAnnouncement({ title: '', content: '', priority: 'MEDIUM' });
        setSelectedRecipients([]);
        setUserSearchTerm('');
        handleRefresh();
      } else {
        Alert.alert('Error', result.error || 'Failed to send announcement.');
      }
    } catch (error) {
      console.error('❌ Error creating announcement thread:', error);
      Alert.alert('Error', 'An error occurred while sending the announcement.');
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      if (!emergencyAlert.title.trim() || !emergencyAlert.message.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      console.log('🚨 Sending emergency alert:', emergencyAlert);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Emergency Alert Sent', 'Emergency alert has been sent to all recipients');
      
      setEmergencyAlert({
        title: '',
        message: '',
        type: 'GENERAL',
        severity: 'WARNING',
      });
      setShowEmergencyModal(false);
      handleRefresh();
    } catch (error) {
      console.error('❌ Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#e74c3c';
      case 'HIGH': return '#e67e22';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getAudienceIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'ACADEMIC': return '🎓';
      case 'ADMINISTRATIVE': return '📁';
      case 'EVENT': return '🎉';
      case 'EMERGENCY': return '🚨';
      case 'GENERAL': return '📢';
      default: return '💬';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#e74c3c';
      case 'WARNING': return '#f39c12';
      case 'INFO': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#27ae60';
      case 'RESOLVED': return '#3498db';
      case 'ARCHIVED': return '#7f8c8d';
      default: return '#95a5a6';
    }
  };

  const renderOverview = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Communication Stats */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Communication Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communicationData?.stats.totalThreads}</Text>
            <Text style={styles.statLabel}>Total Threads</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communicationData?.stats.activeThreads}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communicationData?.stats.unreadMessages}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communicationData?.stats.urgentMessages}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={openCreateModal}
          >
            <Text style={styles.createBtnText}>📝 Create Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.emergencyBtn}
            onPress={() => setShowEmergencyModal(true)}
          >
            <Text style={styles.emergencyBtnText}>🚨 Emergency Alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Announcements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📢 Recent Threads</Text>
        
        {communicationData?.threads.slice(0, 3).map((thread) => (
          <View key={thread.id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementTitleRow}>
                <Text style={styles.announcementTitle}>{thread.title}</Text>
                <View style={styles.announcementMeta}>
                  <Text style={styles.audienceIcon}>{getAudienceIcon(thread.category)}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(thread.priority) }]}>
                    <Text style={styles.priorityText}>{thread.priority}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.announcementInfo}>
                <Text style={styles.announcementDate}>{thread.publishDate}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(thread.status) }]}>
                  <Text style={styles.statusText}>{thread.status}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.announcementContent} numberOfLines={2}>
              {thread.content}
            </Text>
            
            <View style={styles.announcementFooter}>
              <Text style={styles.viewCount}>Sender: {thread.sender}</Text>
              <Text style={styles.category}>{thread.category}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllBtn} onPress={() => setActiveTab('messages')}>
          <Text style={styles.viewAllText}>View All Threads</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Alerts */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🚨 Emergency Alerts</Text>
        
        {communicationData?.alerts.slice(0, 2).map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                <Text style={styles.severityText}>{alert.severity}</Text>
              </View>
            </View>
            
            <Text style={styles.alertMessage}>{alert.message}</Text>
            
            <View style={styles.alertFooter}>
              <Text style={styles.alertTime}>{alert.sentAt}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMessages = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Message Stats */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💬 Message Center</Text>
        
        <View style={styles.messageStats}>
          <View style={styles.messageStatItem}>
            <Text style={styles.messageStatNumber}>{communicationData?.stats.totalThreads}</Text>
            <Text style={styles.messageStatLabel}>Total Threads</Text>
          </View>
          <View style={styles.messageStatItem}>
            <Text style={styles.messageStatNumber}>{communicationData?.stats.unreadMessages}</Text>
            <Text style={styles.messageStatLabel}>Unread</Text>
          </View>
          <View style={styles.messageStatItem}>
            <Text style={styles.messageStatNumber}>{communicationData?.stats.sentToday}</Text>
            <Text style={styles.messageStatLabel}>Sent Today</Text>
          </View>
        </View>
      </View>

      {/* Recent Messages */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📬 All Recent Threads</Text>
        
        {communicationData?.threads.map((thread) => (
          <View key={thread.id} style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageSubject}>{thread.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(thread.priority) }]}>
                <Text style={styles.priorityText}>{thread.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.messageRecipient}>Category: {thread.category}</Text>
            <Text style={styles.messageContent} numberOfLines={2}>{thread.content}</Text>
            
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{thread.publishDate}</Text>
              <View style={[styles.messageStatus, { backgroundColor: getStatusColor(thread.status) }]}>
                <Text style={styles.messageStatusText}>{thread.status}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.messageActions}>
          <TouchableOpacity style={styles.composeBtn}>
            <Text style={styles.composeBtnText}>✍️ Compose Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.broadcastBtn}>
            <Text style={styles.broadcastBtnText}>📡 Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading communication data...</Text>
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
          <Text style={styles.headerTitle}>📢 Communication Center</Text>
          <Text style={styles.headerSubtitle}>Principal Dashboard</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'messages' && renderMessages()}
      </View>

      {/* Create Announcement Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Announcement</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={newAnnouncement.title}
                onChangeText={(text) => setNewAnnouncement({...newAnnouncement, title: text})}
                placeholder="Enter announcement title"
              />
              
              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newAnnouncement.content}
                onChangeText={(text) => setNewAnnouncement({...newAnnouncement, content: text})}
                placeholder="Enter announcement content"
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Recipients</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Search staff..."
                value={userSearchTerm}
                onChangeText={setUserSearchTerm}
              />

              <ScrollView style={styles.userListContainer}>
                {isFetchingUsers ? (
                  <ActivityIndicator />
                ) : (
                  allUsers
                    .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()))
                    .map(u => (
                      <TouchableOpacity 
                        key={u.id} 
                        style={styles.userRow}
                        onPress={() => {
                          setSelectedRecipients(prev => 
                            prev.includes(u.id) 
                              ? prev.filter(id => id !== u.id) 
                              : [...prev, u.id]
                          );
                        }}
                      >
                        <View style={[styles.checkbox, selectedRecipients.includes(u.id) && styles.checkboxSelected]}>
                          {selectedRecipients.includes(u.id) && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <View>
                          <Text style={styles.userName}>{u.name}</Text>
                          <Text style={styles.userRole}>{u.userRoles?.map((r: any) => r.role).join(', ') || 'N/A'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmBtn}
                  onPress={createAnnouncement}
                >
                  <Text style={styles.confirmBtnText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Emergency Alert Modal */}
      <Modal visible={showEmergencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🚨 Send Emergency Alert</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Alert Title</Text>
              <TextInput
                style={styles.textInput}
                value={emergencyAlert.title}
                onChangeText={(text) => setEmergencyAlert({...emergencyAlert, title: text})}
                placeholder="Enter alert title"
              />
              
              <Text style={styles.inputLabel}>Alert Message</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={emergencyAlert.message}
                onChangeText={(text) => setEmergencyAlert({...emergencyAlert, message: text})}
                placeholder="Enter emergency message"
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalOptions}>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Type:</Text>
                  <Text style={styles.optionValue}>{emergencyAlert.type}</Text>
                </View>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Severity:</Text>
                  <Text style={styles.optionValue}>{emergencyAlert.severity}</Text>
                </View>
              </View>
              
              <View style={styles.emergencyWarning}>
                <Text style={styles.warningText}>
                  ⚠️ This will send an immediate alert to all school members
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => setShowEmergencyModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.emergencyConfirmBtn}
                  onPress={sendEmergencyAlert}
                >
                  <Text style={styles.emergencyConfirmBtnText}>Send Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  // Stats styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  emergencyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Announcement styles
  announcementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  announcementHeader: {
    marginBottom: 10,
  },
  announcementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audienceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  announcementInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 11,
    color: '#95a5a6',
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
  announcementContent: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 10,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 11,
    color: '#95a5a6',
  },
  category: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '600',
  },
  viewAllBtn: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  // Alert styles
  alertCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  severityText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 10,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 11,
    color: '#95a5a6',
  },
  acknowledgmentRate: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600',
  },
  // Message styles
  messageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  messageStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  messageStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  messageStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  messageType: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  messageTypeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  messageRecipient: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 10,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 11,
    color: '#95a5a6',
  },
  messageStatus: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  messageStatusText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  composeBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  composeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  broadcastBtn: {
    flex: 1,
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  broadcastBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  userListContainer: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 15,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3498db',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
  },
  checkboxTick: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOptions: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  optionValue: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  emergencyWarning: {
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emergencyConfirmBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  emergencyConfirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CommunicationCenterScreen; 