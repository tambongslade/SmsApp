import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { User } from './LoginScreen';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  isFromMe: boolean;
}

interface MessageThread {
  id: number;
  subject: string;
  participants: Array<{
    userId: number;
    userName: string;
    userRole: string;
  }>;
  lastMessageAt: string;
  lastMessagePreview: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'GENERAL' | 'ACADEMIC' | 'DISCIPLINARY' | 'FINANCIAL' | 'ADMINISTRATIVE' | 'EMERGENCY';
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  messageCount: number;
  isRead: boolean;
  messages?: ChatMessage[];
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  department?: string;
}

interface Child {
  id: number;
  name: string;
  className: string;
}

interface ComposeMessage {
  recipientId: number | null;
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  studentId: number | null;
}

type ParentMessagesScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentMessages'>;

const ParentMessagesScreen: React.FC<ParentMessagesScreenProps> = ({ navigation, route }) => {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isComposeModalVisible, setIsComposeModalVisible] = useState(false);
  const [composeMessage, setComposeMessage] = useState<ComposeMessage>({
    recipientId: null,
    subject: '',
    message: '',
    priority: 'MEDIUM',
    studentId: null,
  });
  const [isSending, setIsSending] = useState(false);

  // Dropdown states
  const [openRecipientPicker, setOpenRecipientPicker] = useState(false);
  const [openChildPicker, setOpenChildPicker] = useState(false);
  
  const { token, user } = route.params;

  const staffItems = useMemo(() => staffMembers.map(s => ({ label: `${s.name} (${s.role})`, value: s.id })), [staffMembers]);
  const childItems = useMemo(() => children.map(c => ({ label: `${c.name} (${c.className})`, value: c.id })), [children]);
  const priorityItems = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const messagesUrl = 'https://sms.sniperbuisnesscenter.com/api/v1/messaging/threads';
      const staffUrl = 'https://sms.sniperbuisnesscenter.com/api/v1/staff'; // Assuming endpoint
      const childrenUrl = 'https://sms.sniperbuisnesscenter.com/api/v1/parents/me/children'; // Assuming endpoint
      
      const headers = { Authorization: `Bearer ${token}` };

      const [messagesResponse, staffResponse, childrenResponse] = await Promise.all([
        fetch(messagesUrl, { headers }),
        fetch(staffUrl, { headers }),
        fetch(childrenUrl, { headers }),
      ]);

      // Process Messages
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        if (messagesData.success && Array.isArray(messagesData.data)) {
          const threads: MessageThread[] = messagesData.data.map((thread: any) => ({
            id: thread.id,
            subject: thread.subject,
            participants: thread.participants,
            lastMessageAt: thread.lastMessageAt,
            lastMessagePreview: thread.lastMessagePreview,
            priority: thread.priority,
            category: thread.category,
            status: thread.status,
            messageCount: thread.messageCount,
            isRead: !thread.participants.some((p: any) => p.userId === user.id && !p.lastReadAt),
          }));
          setMessageThreads(threads);
        } else {
          setMessageThreads([]);
        }
      } else {
        setMessageThreads([]);
      }

      // Process Staff
      if(staffResponse.ok) {
        const staffData = await staffResponse.json();
        if(staffData.success && Array.isArray(staffData.data)) {
          setStaffMembers(staffData.data);
        }
      }

      // Process Children
      if(childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        if(childrenData.success && Array.isArray(childrenData.data)) {
            const childrenList = childrenData.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                className: c.enrollments?.[0]?.subClass?.name ? `${c.enrollments[0].subClass.class.name} ${c.enrollments[0].subClass.name}` : 'N/A'
            }));
            setChildren(childrenList);
        }
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load necessary data. Please pull down to refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleSendMessage = async () => {
    if (!composeMessage.recipientId || !composeMessage.subject.trim() || !composeMessage.message.trim()) {
      Alert.alert('Validation Error', 'Please select a recipient and fill in the subject and message.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/parents/message-staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeMessage),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        Alert.alert('Success', 'Your message has been sent.');
        setIsComposeModalVisible(false);
        setComposeMessage({ recipientId: null, subject: '', message: '', priority: 'MEDIUM', studentId: null });
        onRefresh(); // Refresh the inbox
      } else {
        throw new Error(responseData.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectThread = (thread: MessageThread) => {
    // Navigate to a new screen for chat details, this will be implemented later
    // For now, just log it.
    console.log("Selected thread: ", thread.id)
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return '#e74c3c'; // red
      case 'MEDIUM':
        return '#f39c12'; // orange
      case 'LOW':
      default:
        return '#2ecc71'; // green
    }
  };

  const renderComposeModal = () => (
    <Modal
      visible={isComposeModalVisible}
      animationType="slide"
      onRequestClose={() => setIsComposeModalVisible(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{flex: 1}}
        >
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Compose Message</Text>
                <TouchableOpacity onPress={() => setIsComposeModalVisible(false)}>
                    <Text style={styles.closeButton}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ zIndex: 3000, marginBottom: 16 }}>
                    <Text style={styles.label}>Recipient</Text>
                    <DropDownPicker
                        open={openRecipientPicker}
                        value={composeMessage.recipientId}
                        items={staffItems}
                        setOpen={setOpenRecipientPicker}
                        setValue={(callback) => setComposeMessage(prev => ({...prev, recipientId: callback()}))}
                        listMode="MODAL"
                        placeholder="Select a staff member"
                    />
                </View>

                <View style={{ zIndex: 2000, marginBottom: 16 }}>
                    <Text style={styles.label}>Regarding Child (Optional)</Text>
                    <DropDownPicker
                        open={openChildPicker}
                        value={composeMessage.studentId}
                        items={childItems}
                        setOpen={setOpenChildPicker}
                        setValue={(callback) => setComposeMessage(prev => ({...prev, studentId: callback()}))}
                        listMode="MODAL"
                        placeholder="Select a child"
                    />
                </View>

                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Subject</Text>
                    <TextInput
                        style={styles.input}
                        value={composeMessage.subject}
                        onChangeText={text => setComposeMessage(prev => ({ ...prev, subject: text }))}
                        placeholder="e.g., Question about homework"
                    />
                </View>

                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Priority</Text>
                     <View style={styles.priorityContainer}>
                        {priorityItems.map(p => (
                            <TouchableOpacity 
                                key={p.value} 
                                style={[
                                    styles.priorityButton, 
                                    composeMessage.priority === p.value && styles.priorityButtonActive
                                ]}
                                onPress={() => setComposeMessage(prev => ({ ...prev, priority: p.value as any }))}
                            >
                                <Text style={[
                                    styles.priorityButtonText,
                                    composeMessage.priority === p.value && styles.priorityButtonTextActive
                                ]}>{p.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={composeMessage.message}
                        onChangeText={text => setComposeMessage(prev => ({ ...prev, message: text }))}
                        placeholder="Type your message here..."
                        multiline
                    />
                </View>
                
                <TouchableOpacity 
                    style={[styles.sendButton, isSending && styles.disabledButton]} 
                    onPress={handleSendMessage}
                    disabled={isSending}
                >
                    {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Send Message</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const renderInbox = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text>Loading messages...</Text>
        </View>
      );
    }

    if (messageThreads.length === 0) {
        return (
             <View style={styles.centered}>
                <Text>No messages found.</Text>
            </View>
        )
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {messageThreads.map(thread => {
          const participant = thread.participants?.find(p => p.userId !== user.id);
          const recipientName = participant?.userName || 'Unknown';
          return (
            <TouchableOpacity key={thread.id} style={styles.threadItem} onPress={() => handleSelectThread(thread)}>
                <View style={styles.threadContent}>
                    <Text style={styles.recipientName}>{recipientName}</Text>
                    <Text style={styles.threadSubject}>{thread.subject}</Text>
                    <Text numberOfLines={1}>{thread.lastMessagePreview}</Text>
                </View>
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(thread.priority) }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderInbox()}
      <TouchableOpacity style={styles.fab} onPress={() => setIsComposeModalVisible(true)}>
          <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      {renderComposeModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    threadItem: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#ffffff',
     borderRadius: 10,
     padding: 16,
     marginVertical: 8,
     marginHorizontal: 16,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 8,
     elevation: 3,
   },
   threadContent: {
     flex: 1,
   },
   recipientName: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#1e293b',
   },
   threadSubject: {
     fontSize: 14,
     fontWeight: '600',
     color: '#1e293b',
     marginVertical: 4,
   },
   priorityIndicator: {
     width: 10,
     height: 10,
     borderRadius: 5,
     marginLeft: 12,
   },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#3498db',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { height: 2, width: 0 },
    },
    fabIcon: {
        fontSize: 30,
        color: 'white',
        lineHeight: 30, 
    },
    // Modal Styles
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 16,
        color: '#3498db',
    },
    modalContainer: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1e293b',
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: '#3498db',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#95a5a6',
    },
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        padding: 4,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    priorityButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    priorityButtonText: {
        fontWeight: '600',
        color: '#64748b'
    },
    priorityButtonTextActive: {
        color: '#1e293b'
    }
});

export default ParentMessagesScreen; 