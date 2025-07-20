import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';

interface Announcement {
  id: number;
  title: string;
  content: string;
  audience: 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'STAFF';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isActive: boolean;
  publishDate: string;
  expiryDate?: string;
  authorId: number;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  recipientCount?: number;
  readCount?: number;
}

interface CommunicationStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalReach: number;
  averageReadRate: number;
  recentActivity: number;
}

const VPCommunications: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'STAFF'>('ALL');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    loadCommunicationsData();
  }, []);

  const calculateStats = (announcements: Announcement[]): CommunicationStats => {
    const totalAnnouncements = announcements.length;
    const activeAnnouncements = announcements.filter(a => a.isActive).length;
    const totalReach = announcements.reduce((sum, a) => sum + (a.recipientCount || 0), 0);
    const readableAnnouncements = announcements.filter(a => a.recipientCount && a.readCount);
    const averageReadRate = readableAnnouncements.length > 0 
      ? readableAnnouncements.reduce((sum, a) => sum + ((a.readCount || 0) / (a.recipientCount || 1) * 100), 0) / readableAnnouncements.length
      : 0;
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = announcements.filter(a => new Date(a.createdAt) >= sevenDaysAgo).length;

    return {
      totalAnnouncements,
      activeAnnouncements,
      totalReach,
      averageReadRate: Math.round(averageReadRate),
      recentActivity,
    };
  };

  const loadCommunicationsData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Authentication Error', 'No authentication token found. Please log in again.');
        return;
      }
      
      // Load announcements
      const announcementsResponse = await fetch(`${API_BASE_URL}/communications/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (announcementsResponse.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        // Clear invalid token
        await AsyncStorage.removeItem('authToken');
        return;
      }

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        const announcementsList = announcementsData.data?.announcements || [];
        setAnnouncements(announcementsList);
        
        // Calculate stats from announcements data
        const calculatedStats = calculateStats(announcementsList);
        setStats(calculatedStats);
      } else {
        console.error('Failed to load announcements:', announcementsResponse.status);
        Alert.alert('Error', `Failed to load announcements (${announcementsResponse.status})`);
      }

    } catch (error) {
      console.error('Error loading communications data:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to load communications data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunicationsData();
    setRefreshing(false);
  };

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/communications/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          audience: selectedAudience,
          priority,
          isActive: true,
          expiryDate: expiryDate || null,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Announcement created successfully');
        setModalVisible(false);
        resetForm();
        loadCommunicationsData();
      } else {
        Alert.alert('Error', 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch(`${API_BASE_URL}/communications/announcements/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Announcement deleted successfully');
                loadCommunicationsData();
              } else {
                Alert.alert('Error', 'Failed to delete announcement');
              }
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedAudience('ALL');
    setPriority('MEDIUM');
    setIsScheduled(false);
    setExpiryDate('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#FF3B30';
      case 'HIGH': return '#FF9500';
      case 'MEDIUM': return '#007AFF';
      case 'LOW': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'STUDENTS': return 'school-outline';
      case 'PARENTS': return 'people-outline';
      case 'TEACHERS': return 'person-outline';
      case 'STAFF': return 'briefcase-outline';
      default: return 'globe-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalAnnouncements || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.activeAnnouncements || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalReach || 0}</Text>
          <Text style={styles.statLabel}>Reach</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.averageReadRate || 0}%</Text>
          <Text style={styles.statLabel}>Read Rate</Text>
        </View>
      </View>
    </View>
  );

  const renderAnnouncement = (announcement: Announcement) => (
    <View key={announcement.id} style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <View style={styles.announcementInfo}>
          <Text style={styles.announcementTitle}>{announcement.title}</Text>
          <View style={styles.announcementMeta}>
            <View style={styles.metaItem}>
              <Ionicons name={getAudienceIcon(announcement.audience)} size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{announcement.audience}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.priority) }]}>
              <Text style={styles.priorityText}>{announcement.priority}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAnnouncement(announcement.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.announcementContent} numberOfLines={3}>
        {announcement.content}
      </Text>
      
      <View style={styles.announcementFooter}>
        <Text style={styles.announcementDate}>
          Published: {formatDate(announcement.publishDate)}
        </Text>
        {announcement.expiryDate && (
          <Text style={styles.expiryDate}>
            Expires: {formatDate(announcement.expiryDate)}
          </Text>
        )}
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-outline" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter announcement title"
            />
            
            <Text style={styles.inputLabel}>Content *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Enter announcement content"
              multiline={true}
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Audience</Text>
            <View style={styles.audienceContainer}>
              {['ALL', 'STUDENTS', 'PARENTS', 'TEACHERS', 'STAFF'].map((audience) => (
                <TouchableOpacity
                  key={audience}
                  style={[
                    styles.audienceOption,
                    selectedAudience === audience && styles.selectedAudience,
                  ]}
                  onPress={() => setSelectedAudience(audience as any)}
                >
                  <Text style={[
                    styles.audienceText,
                    selectedAudience === audience && styles.selectedAudienceText,
                  ]}>
                    {audience}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.selectedPriority,
                    { borderColor: getPriorityColor(p) },
                  ]}
                  onPress={() => setPriority(p as any)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    priority === p && { color: getPriorityColor(p) },
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Set Expiry Date</Text>
              <Switch
                value={isScheduled}
                onValueChange={setIsScheduled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={isScheduled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            
            {isScheduled && (
              <>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
                />
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateAnnouncement}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading communications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Communications</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {renderStatsCard()}

        <View style={styles.announcementsContainer}>
          <Text style={styles.sectionTitle}>Recent Announcements</Text>
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No announcements yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first announcement to communicate with the school community
              </Text>
            </View>
          ) : (
            announcements.map(renderAnnouncement)
          )}
        </View>
      </ScrollView>

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  announcementsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  announcementContent: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  expiryDate: {
    fontSize: 12,
    color: '#FF9500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  audienceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  audienceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAudience: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  audienceText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  selectedAudienceText: {
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedPriority: {
    backgroundColor: '#F0F8FF',
  },
  priorityOptionText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
});

export default VPCommunications; 