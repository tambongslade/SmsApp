import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';

interface Message {
  id: string;
  sender: string;
  senderRole: 'teacher' | 'admin' | 'parent';
  recipient: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'high' | 'urgent';
  attachments?: string[];
}

interface MessagesScreenProps {
  onBack: () => void;
  childName: string;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onBack, childName }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'teacher' | 'admin'>('all');
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    message: '',
  });

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Mrs. Elizabeth Thompson',
      senderRole: 'teacher',
      recipient: 'Johnson Family',
      subject: 'Mathematics Test Results',
      message: 'Sarah performed excellently in the recent mathematics test. She scored 92/100 and showed great problem-solving skills.',
      timestamp: '2024-12-06 10:30 AM',
      isRead: false,
      priority: 'normal',
    },
    {
      id: '2',
      sender: 'School Administrator',
      senderRole: 'admin',
      recipient: 'All Parents',
      subject: 'Parent-Teacher Meeting Schedule',
      message: 'Dear parents, we have scheduled parent-teacher meetings for next Friday, December 13th. Please check the attached schedule.',
      timestamp: '2024-12-05 2:15 PM',
      isRead: true,
      priority: 'high',
      attachments: ['meeting_schedule.pdf'],
    },
    {
      id: '3',
      sender: 'Mr. David Wilson',
      senderRole: 'teacher',
      recipient: 'Johnson Family',
      subject: 'Science Project Reminder',
      message: 'This is a reminder that Sarah\'s science project on renewable energy is due next Monday. Please ensure all materials are ready.',
      timestamp: '2024-12-04 4:45 PM',
      isRead: true,
      priority: 'normal',
    },
    {
      id: '4',
      sender: 'School Nurse',
      senderRole: 'admin',
      recipient: 'Johnson Family',
      subject: 'Health Check Reminder',
      message: 'Dear parents, please ensure Sarah completes her annual health check before the end of this term.',
      timestamp: '2024-12-03 11:20 AM',
      isRead: true,
      priority: 'normal',
    },
    {
      id: '5',
      sender: 'Principal Office',
      senderRole: 'admin',
      recipient: 'All Parents',
      subject: 'URGENT: School Closure Notice',
      message: 'Due to severe weather conditions, the school will be closed tomorrow, December 7th. All classes and activities are cancelled.',
      timestamp: '2024-12-02 6:00 PM',
      isRead: true,
      priority: 'urgent',
    },
  ];

  const sentMessages: Message[] = [
    {
      id: 's1',
      sender: 'Johnson Family',
      senderRole: 'parent',
      recipient: 'Mrs. Elizabeth Thompson',
      subject: 'Request for Extra Math Practice',
      message: 'Hello Mrs. Thompson, could you please recommend some additional math practice materials for Sarah? She enjoys the subject and wants to improve further.',
      timestamp: '2024-12-01 7:30 PM',
      isRead: true,
      priority: 'normal',
    },
    {
      id: 's2',
      sender: 'Johnson Family',
      senderRole: 'parent',
      recipient: 'School Administrator',
      subject: 'Transportation Inquiry',
      message: 'We would like to inquire about the school bus route and pickup times for our area. Please provide the schedule.',
      timestamp: '2024-11-28 9:15 AM',
      isRead: true,
      priority: 'normal',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#e74c3c';
      case 'high': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      default: return '📧';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return '👩‍🏫';
      case 'admin': return '🏢';
      case 'parent': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  const filterMessages = (messageList: Message[]) => {
    if (selectedFilter === 'all') return messageList;
    return messageList.filter(msg => msg.senderRole === selectedFilter);
  };

  const handleSendMessage = () => {
    if (!composeData.recipient || !composeData.subject || !composeData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert('Success', 'Message sent successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setComposeData({ recipient: '', subject: '', message: '' });
          setActiveTab('sent');
        },
      },
    ]);
  };

  const renderInbox = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
            All ({messages.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'teacher' && styles.activeFilter]}
          onPress={() => setSelectedFilter('teacher')}
        >
          <Text style={[styles.filterText, selectedFilter === 'teacher' && styles.activeFilterText]}>
            Teachers ({messages.filter(m => m.senderRole === 'teacher').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'admin' && styles.activeFilter]}
          onPress={() => setSelectedFilter('admin')}
        >
          <Text style={[styles.filterText, selectedFilter === 'admin' && styles.activeFilterText]}>
            Admin ({messages.filter(m => m.senderRole === 'admin').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {filterMessages(messages).map((message) => (
        <TouchableOpacity key={message.id} style={[styles.messageCard, !message.isRead && styles.unreadMessage]}>
          <View style={styles.messageHeader}>
            <View style={styles.senderInfo}>
              <Text style={styles.senderIcon}>{getRoleIcon(message.senderRole)}</Text>
              <View style={styles.senderDetails}>
                <Text style={styles.senderName}>{message.sender}</Text>
                <Text style={styles.messageTime}>{message.timestamp}</Text>
              </View>
            </View>
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityIcon}>{getPriorityIcon(message.priority)}</Text>
              {!message.isRead && <View style={styles.unreadDot} />}
            </View>
          </View>
          
          <Text style={styles.messageSubject}>{message.subject}</Text>
          <Text style={styles.messagePreview} numberOfLines={2}>
            {message.message}
          </Text>
          
          {message.attachments && (
            <View style={styles.attachmentContainer}>
              <Text style={styles.attachmentIcon}>📎</Text>
              <Text style={styles.attachmentText}>
                {message.attachments.length} attachment(s)
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSent = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sent Messages</Text>
        <Text style={styles.messageCount}>{sentMessages.length} messages</Text>
      </View>

      {sentMessages.map((message) => (
        <View key={message.id} style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <View style={styles.senderInfo}>
              <Text style={styles.senderIcon}>📤</Text>
              <View style={styles.senderDetails}>
                <Text style={styles.senderName}>To: {message.recipient}</Text>
                <Text style={styles.messageTime}>{message.timestamp}</Text>
              </View>
            </View>
            <Text style={styles.sentStatus}>✓ Delivered</Text>
          </View>
          
          <Text style={styles.messageSubject}>{message.subject}</Text>
          <Text style={styles.messagePreview} numberOfLines={2}>
            {message.message}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderCompose = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.composeContainer}>
        <Text style={styles.composeTitle}>Compose New Message</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>To:</Text>
          <View style={styles.recipientOptions}>
            <TouchableOpacity
              style={[styles.recipientButton, composeData.recipient === 'teacher' && styles.selectedRecipient]}
              onPress={() => setComposeData({...composeData, recipient: 'teacher'})}
            >
              <Text style={styles.recipientIcon}>👩‍🏫</Text>
              <Text style={styles.recipientText}>Class Teacher</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.recipientButton, composeData.recipient === 'admin' && styles.selectedRecipient]}
              onPress={() => setComposeData({...composeData, recipient: 'admin'})}
            >
              <Text style={styles.recipientIcon}>🏢</Text>
              <Text style={styles.recipientText}>School Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Subject:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter message subject"
            value={composeData.subject}
            onChangeText={(text) => setComposeData({...composeData, subject: text})}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Message:</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            placeholder="Type your message here..."
            multiline
            numberOfLines={6}
            value={composeData.message}
            onChangeText={(text) => setComposeData({...composeData, message: text})}
          />
        </View>

        <View style={styles.composeActions}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachButtonText}>📎 Attach File</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>📤 Send Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickTemplates}>
          <Text style={styles.templatesTitle}>Quick Templates:</Text>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => setComposeData({
              ...composeData,
              subject: 'Absence Request',
              message: 'Dear teacher, I am writing to inform you that my child will be absent from school on [DATE] due to [REASON]. Please let me know if any assignments need to be completed during this absence. Thank you.'
            })}
          >
            <Text style={styles.templateText}>📝 Absence Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => setComposeData({
              ...composeData,
              subject: 'Meeting Request',
              message: 'Dear teacher, I would like to schedule a meeting to discuss my child\'s academic progress. Please let me know your available times. Thank you.'
            })}
          >
            <Text style={styles.templateText}>🤝 Meeting Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'inbox' && styles.activeTab]}
          onPress={() => setActiveTab('inbox')}
        >
          <Text style={[styles.tabText, activeTab === 'inbox' && styles.activeTabText]}>
            Inbox ({messages.filter(m => !m.isRead).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'compose' && styles.activeTab]}
          onPress={() => setActiveTab('compose')}
        >
          <Text style={[styles.tabText, activeTab === 'compose' && styles.activeTabText]}>
            Compose
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'inbox' && renderInbox()}
        {activeTab === 'sent' && renderSent()}
        {activeTab === 'compose' && renderCompose()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
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
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  activeFilter: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  senderIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
  },
  sentStatus: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '600',
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  messagePreview: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  attachmentIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  attachmentText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  messageCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  composeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  composeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  recipientOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipientButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRecipient: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  recipientIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  recipientText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attachButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  attachButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    flex: 2,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickTemplates: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 20,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  templateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  templateText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
});

export default MessagesScreen; 