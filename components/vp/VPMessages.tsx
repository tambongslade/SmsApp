import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';

interface MessageThread {
  id: number;
  subject: string;
  participants: Array<{
    userId: number;
    userName: string;
    userRole: string;
  }>;
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    senderName: string;
    sentAt: string;
  };
  unreadCount: number;
  category: 'ACADEMIC' | 'DISCIPLINARY' | 'ADMINISTRATIVE' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  threadId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

interface MessagingDashboard {
  totalThreads: number;
  activeThreads: number;
  unreadMessages: number;
  totalParticipants: number;
  averageResponseTime: number;
  recentActivity: number;
  urgentMessages: number;
  activeThreads: number;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

const VPMessages: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [dashboard, setDashboard] = useState<MessagingDashboard | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  
  const [newThreadData, setNewThreadData] = useState({
    subject: '',
    initialMessage: '',
    participants: [] as number[],
    priority: 'MEDIUM' as MessageThread['priority'],
    category: 'GENERAL' as MessageThread['category'],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'INBOX' | 'SENT' | 'ARCHIVED'>('INBOX');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadThreads(),
        loadDashboard(),
        loadStaffMembers(),
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to load initial messaging data.");
    } finally {
      setLoading(false);
    }
  };

  const loadThreads = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/messaging/threads`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load threads');
      const data = await response.json();
      console.log('API Response - loadThreads:', JSON.stringify(data, null, 2));
      setThreads(data.data || []);
    } catch (e) {
      console.error("Failed to load threads:", e);
    }
  };

  const loadDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/messaging/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load dashboard');
      const data = await response.json();
      console.log('API Response - loadDashboard:', JSON.stringify(data, null, 2));
      setDashboard(data.data);
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/users?limit=1000`, { // Fetch all users
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      console.log('API Response - loadStaffMembers:', JSON.stringify(data, null, 2));
      const staff = (data.data?.users || data.data || []).filter((u: any) => 
        u.userRoles.some((r: any) => r.role !== 'PARENT' && r.role !== 'STUDENT')
      );
      setStaffMembers(staff.map((u: any) => ({ id: u.id, name: u.name, role: u.userRoles[0]?.role || 'Staff', email: u.email })));
    } catch (e) {
      console.error("Failed to load staff:", e);
    }
  };

  const loadThreadMessages = async (threadId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/messaging/threads/${threadId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      console.log('API Response - loadThreadMessages:', JSON.stringify(data, null, 2));
      setMessages(data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages.');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleCreateThread = async () => {
    if (!newThreadData.subject.trim() || !newThreadData.initialMessage.trim() || newThreadData.participants.length === 0) {
      Alert.alert('Validation Error', 'Please fill all fields and select at least one participant.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/messaging/threads`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newThreadData),
      });
      const responseData = await response.json();
      console.log('API Response - handleCreateThread:', JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        const err = responseData;
        throw new Error(err.error || 'Failed to create thread');
      }
      setShowNewThreadModal(false);
      setNewThreadData({ subject: '', initialMessage: '', participants: [], priority: 'MEDIUM', category: 'GENERAL' });
      handleRefresh();
      Alert.alert('Success', 'Message thread created.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    setIsSending(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/messaging/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      const newMsgData = await response.json();
      console.log('API Response - handleSendMessage:', JSON.stringify(newMsgData, null, 2));
      if (!response.ok) throw new Error('Failed to send message');
      
      setMessages(prev => [newMsgData.data, ...prev]);
      setNewMessage('');
    } catch (e) {
      Alert.alert('Error', 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const openThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    loadThreadMessages(thread.id);
  };
  
  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = thread.subject.toLowerCase().includes(query) ||
        thread.participants.some(p => p.userName.toLowerCase().includes(query));

      const matchesTab = activeTab === 'ARCHIVED' ? thread.status === 'ARCHIVED' : thread.status !== 'ARCHIVED';

      return matchesSearch && matchesTab;
    });
  }, [threads, searchQuery, activeTab]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ACADEMIC': return '#007AFF';
      case 'DISCIPLINARY': return '#FF3B30';
      case 'ADMINISTRATIVE': return '#8E8E93';
      case 'GENERAL': return '#34C759';
      default: return '#8E8E93';
    }
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dashboard?.totalThreads || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dashboard?.activeThreads || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dashboard?.unreadMessages || 0}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dashboard?.totalParticipants || 0}</Text>
          <Text style={styles.statLabel}>Contacts</Text>
        </View>
      </View>
    </View>
  );

  const renderThreadItem = ({ item }: { item: MessageThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount > 0 && styles.unreadThread]}
      onPress={() => openThread(item)}
    >
      <View style={styles.threadHeader}>
        <View style={styles.threadInfo}>
          <Text style={styles.threadSubject} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={styles.threadParticipants} numberOfLines={1}>
            {item.participants.map(p => p.userName).join(', ')}
          </Text>
        </View>
        <View style={styles.threadMeta}>
          <Text style={styles.threadTime}>
            {formatTimestamp(item.lastMessage.sentAt)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.lastMessage} numberOfLines={2}>
        {item.lastMessage.content}
      </Text>
      
      <View style={styles.threadFooter}>
        <View style={styles.threadBadges}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
          <View style={[styles.priorityBadge, { borderColor: getPriorityColor(item.priority) }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority}
            </Text>
          </View>
        </View>
        <Text style={styles.threadStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === dashboard?.userId; // Assuming we have userId on dashboard
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageSender}>{isMyMessage ? 'You' : item.senderName}</Text>
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTimestamp}>{new Date(item.sentAt).toLocaleTimeString()}</Text>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterButton, activeTab === 'INBOX' && styles.activeFilter]}
          onPress={() => setActiveTab('INBOX')}
        >
          <Text style={[styles.filterText, activeTab === 'INBOX' && styles.activeFilterText]}>
            Inbox
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeTab === 'SENT' && styles.activeFilter]}
          onPress={() => setActiveTab('SENT')}
        >
          <Text style={[styles.filterText, activeTab === 'SENT' && styles.activeFilterText]}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeTab === 'ARCHIVED' && styles.activeFilter]}
          onPress={() => setActiveTab('ARCHIVED')}
        >
          <Text style={[styles.filterText, activeTab === 'ARCHIVED' && styles.activeFilterText]}>
            Archived
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderNewThreadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showNewThreadModal}
      onRequestClose={() => setShowNewThreadModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Message Thread</Text>
            <TouchableOpacity onPress={() => setShowNewThreadModal(false)}>
              <Ionicons name="close-outline" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              value={newThreadData.subject}
              onChangeText={text => setNewThreadData(prev => ({ ...prev, subject: text }))}
              placeholder="Enter message subject"
            />
            
            <Text style={styles.inputLabel}>Participants *</Text>
            <View style={styles.participantsContainer}>
              {staffMembers.map((staff) => (
                <TouchableOpacity
                  key={staff.id}
                  style={[
                    styles.participantOption,
                    newThreadData.participants.includes(staff.id) && styles.selectedParticipant,
                  ]}
                  onPress={() => {
                    if (newThreadData.participants.includes(staff.id)) {
                      setNewThreadData(prev => ({ ...prev, participants: prev.participants.filter(id => id !== staff.id) }));
                    } else {
                      setNewThreadData(prev => ({ ...prev, participants: [...prev.participants, staff.id] }));
                    }
                  }}
                >
                  <Text style={[
                    styles.participantText,
                    newThreadData.participants.includes(staff.id) && styles.selectedParticipantText,
                  ]}>
                    {staff.name} ({staff.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {['ACADEMIC', 'DISCIPLINARY', 'ADMINISTRATIVE', 'GENERAL'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    newThreadData.category === category && styles.selectedCategory,
                  ]}
                  onPress={() => setNewThreadData(prev => ({ ...prev, category: category as any }))}
                >
                  <Text style={[
                    styles.categoryText,
                    newThreadData.category === category && styles.selectedCategoryText,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newThreadData.priority === priority && styles.selectedPriority,
                    { borderColor: getPriorityColor(priority) },
                  ]}
                  onPress={() => setNewThreadData(prev => ({ ...prev, priority: priority as any }))}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    newThreadData.priority === priority && { color: getPriorityColor(priority) },
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Initial Message *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newThreadData.initialMessage}
              onChangeText={text => setNewThreadData(prev => ({ ...prev, initialMessage: text }))}
              placeholder="Enter your message"
              multiline={true}
              numberOfLines={4}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowNewThreadModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateThread}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (selectedThread) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => setSelectedThread(null)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.threadTitle}>{selectedThread.subject}</Text>
          <View style={{width: 24}} />
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessageBubble}
          keyExtractor={item => item.id.toString()}
          style={styles.messagesList}
          inverted
        />
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isSending}>
            {isSending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newThreadButton} onPress={() => setShowNewThreadModal(true)}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {renderDashboard()}

      <View style={styles.searchAndTabs}>
        <TextInput style={styles.searchInput} placeholder="Search messages..." onChangeText={setSearchQuery} />
        {renderFilters()}
      </View>

      <FlatList
        data={filteredThreads}
        renderItem={renderThreadItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyListText}>No messages found.</Text>}
      />
      {renderNewThreadModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newThreadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newThreadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  threadsContainer: {
    padding: 16,
  },
  threadCard: {
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
  unreadThread: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  threadInfo: {
    flex: 1,
  },
  threadSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  threadParticipants: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  threadMeta: {
    alignItems: 'flex-end',
  },
  threadTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  unreadCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 12,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadBadges: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  threadStatus: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
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
  participantsContainer: {
    maxHeight: 150,
  },
  participantOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  selectedParticipant: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  participantText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  selectedParticipantText: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  selectedCategoryText: {
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
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  threadModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  threadModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  threadModalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  threadModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  threadModalParticipants: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  messageTime: {
    fontSize: 10,
    color: '#8E8E93',
  },
  messageContent: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  messageInputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
  },
  dashboardContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  threadItem: {
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
  searchAndTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  emptyListText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 48,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    backgroundColor: '#FFF',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
});

export default VPMessages; 