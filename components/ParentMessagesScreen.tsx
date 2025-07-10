import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// --- Interfaces based on parent.workflow.md ---

interface MessageThread {
  id: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
}

interface StaffRecipient {
  id: number;
  name: string;
}

type ParentMessagesScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentMessages'>;

// --- Mock Data ---

const mockMessageThreads: MessageThread[] = [
  {
    id: '1',
    recipientName: 'Mr. Johnson',
    recipientRole: 'Math Teacher',
    subject: "Re: John's Math Performance",
    lastMessage: 'Thank you for the update, we will monitor his progress.',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    recipientName: 'Mrs. Smith',
    recipientRole: 'Class Master',
    subject: "Mary's Attendance Query",
    lastMessage: "I'll check the records and get back to you shortly.",
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '3',
    recipientName: 'Principal',
    recipientRole: 'School Administration',
    subject: 'Parent-Teacher Meeting Notice',
    lastMessage: 'Dear parents, we are pleased to invite you to the...',
    timestamp: '3 days ago',
    isRead: true,
  },
];

const mockStaff: StaffRecipient[] = [
  { id: 101, name: 'Mr. Johnson (Math)' },
  { id: 102, name: 'Mrs. Smith (Class Master)' },
  { id: 103, name: 'Principal' },
  { id: 104, name: 'Bursar' },
];

const ParentMessagesScreen: React.FC<ParentMessagesScreenProps> = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messaging Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Quick Message Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Quick Message to Staff</Text>
          <Text style={styles.label}>To:</Text>
          <View style={styles.staffSelectBox}>
            <Text style={styles.staffSelectText}>Select Staff ▼</Text>
          </View>
          <Text style={styles.label}>Subject:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Question about homework"
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={styles.label}>Message:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your message here..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Conversations */}
        <View>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          <View style={styles.conversationList}>
            {mockMessageThreads.map((thread) => (
              <TouchableOpacity key={thread.id} style={[styles.conversationCard, !thread.isRead && styles.unreadConversation]}> 
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{thread.recipientName} ({thread.recipientRole})</Text>
                  <Text style={styles.conversationTime}>{thread.timestamp}</Text>
                </View>
                <Text style={styles.conversationSubject}>{thread.subject}</Text>
                <Text style={styles.conversationMessage} numberOfLines={1}>{thread.lastMessage}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  staffSelectBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  staffSelectText: {
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  conversationList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  conversationCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  unreadConversation: {
    backgroundColor: '#dbeafe',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  conversationSubject: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  conversationMessage: {
    color: '#6b7280',
    fontSize: 14,
  },
});

export default ParentMessagesScreen; 