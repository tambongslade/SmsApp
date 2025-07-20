import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface Participant {
  userId: number;
  userName: string;
  userRole: string;
}

interface MessageThread {
  id: number;
  subject: string;
  participants: Participant[];
  lastMessagePreview: string;
  lastMessageAt: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface SelectedRole {
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
}

interface TeacherMessagesScreenProps {
  user: User;
  selectedRole: SelectedRole;
  token: string;
  navigation: any;
  onNavigate: (screen: string, params?: any) => void;
}

const TeacherMessagesScreen: React.FC<TeacherMessagesScreenProps> = ({
  user,
  selectedRole,
  token,
  navigation,
  onNavigate,
}) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const fetchThreads = useCallback(async () => {
    try {
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/messaging/threads`;
      console.log('Fetching message threads from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setThreads(data.data.map((t: any) => ({...t, isRead: Math.random() > 0.5}))); // mock isRead
          console.log('✅ Successfully fetched message threads');
        } else {
          setThreads(mockThreads);
        }
      } else {
        setThreads(mockThreads);
      }
    } catch (error) {
      console.error('Failed to fetch message threads:', error);
      Alert.alert('Error', 'Could not fetch messages.');
      setThreads(mockThreads);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchThreads();
  };

  const filteredThreads = activeTab === 'unread' ? threads.filter(t => !t.isRead) : threads;
  
  const getPriorityStyle = (priority: MessageThread['priority']) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH': return { bg: '#fee2e2', text: '#ef4444' };
      case 'MEDIUM': return { bg: '#ffedd5', text: '#f97316' };
      default: return { bg: '#e0e7ff', text: '#4f46e5' };
    }
  };

  const renderThreadCard = (thread: MessageThread) => (
    <TouchableOpacity 
      key={thread.id} 
      style={styles.threadCard}
      activeOpacity={0.8}
      // onPress={() => onNavigate('ChatMessage', { threadId: thread.id, token })}
    >
      {!thread.isRead && <View style={styles.unreadIndicator} />}
      <View style={styles.cardHeader}>
        <View style={styles.participants}>
          {thread.participants.slice(0,2).map(p => (
            <Image 
              key={p.userId}
              source={{ uri: `https://ui-avatars.com/api/?name=${p.userName.replace(' ', '+')}`}} 
              style={styles.avatar} 
            />
          ))}
          {thread.participants.length > 2 && <View style={styles.avatarMore}><Text style={styles.avatarMoreText}>+{thread.participants.length - 2}</Text></View>}
        </View>
        <Text style={styles.time}>{new Date(thread.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
      </View>
      <Text style={styles.subject}>{thread.subject}</Text>
      <Text style={styles.preview} numberOfLines={2}>{thread.lastMessagePreview}</Text>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityStyle(thread.priority).bg }]}>
        <Text style={[styles.priorityText, { color: getPriorityStyle(thread.priority).text }]}>{thread.priority}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.tabContainer}>
        {(['all', 'unread'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{marginTop: 50}}/>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map(renderThreadCard)
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No {activeTab} messages.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockThreads: MessageThread[] = [
  { id: 1, subject: 'Question about John Doe\'s performance', participants: [{userId: 1, userName: 'Parent Name', userRole: 'PARENT'}], lastMessagePreview: 'Yes, I can provide more details on his recent test scores...', lastMessageAt: '2024-03-15T10:30:00Z', isRead: false, priority: 'HIGH' },
  { id: 2, subject: 'Parent-Teacher meeting request', participants: [{userId: 2, userName: 'Another Parent', userRole: 'PARENT'}], lastMessagePreview: 'Thank you for your availability. Let\'s schedule for next week.', lastMessageAt: '2024-03-14T15:00:00Z', isRead: true, priority: 'MEDIUM' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: { backgroundColor: '#667eea' },
  tabText: { color: '#334155', fontWeight: '600', textTransform: 'capitalize' },
  activeTabText: { color: '#ffffff' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  threadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderColor: 'transparent',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participants: { flexDirection: 'row' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginLeft: -8,
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarMoreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  time: { fontSize: 12, color: '#64748b' },
  subject: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  preview: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  priorityBadge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  priorityText: { fontSize: 12, fontWeight: '600' },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: { fontSize: 16, color: '#64748b' },
});

export default TeacherMessagesScreen; 