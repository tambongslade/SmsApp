import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useGuidanceCounselor } from '../GuidanceCounselorContext';

interface GuidanceCounselorCommunicationsScreenProps {
  user: any;
  token: string;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const GuidanceCounselorCommunicationsScreen: React.FC<GuidanceCounselorCommunicationsScreenProps> = ({
  user,
  token,
  onNavigateBack,
  onNavigate,
}) => {
  const { messagingSummary, sendMessage, fetchMessaging, isLoading, error } = useGuidanceCounselor();

  const [refreshing, setRefreshing] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  
  // New message form state
  const [newMessage, setNewMessage] = useState({
    recipientType: 'PARENT',
    specificUsers: [] as number[],
    subject: '',
    message: '',
    priority: 'MEDIUM' as any,
  });

  useEffect(() => {
    // Load messaging data when component mounts
    loadMessagingData();
  }, [token]);

  const loadMessagingData = async () => {
    try {
      await fetchMessaging(token);
    } catch (err) {
      console.error('Error loading messaging data:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessagingData();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'PARENT': return '👨‍👩‍👧‍👦';
      case 'TEACHER': return '👨‍🏫';
      case 'STAFF': return '👥';
      case 'ADMIN': return '👔';
      default: return '📧';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.message) {
      Alert.alert('Error', 'Please fill in subject and message');
      return;
    }

    try {
      const recipients = {
        roles: [newMessage.recipientType],
        specificUsers: newMessage.specificUsers,
        academicYearId: user?.selectedRole?.academicYearId || 1,
      };

      const messageData = {
        subject: newMessage.subject,
        content: newMessage.message,
        priority: newMessage.priority,
        type: 'COUNSELING_COMMUNICATION',
      };

      await sendMessage(token, recipients, messageData);
      
      setNewMessage({
        recipientType: 'PARENT',
        specificUsers: [],
        subject: '',
        message: '',
        priority: 'MEDIUM',
      });
      setShowComposeModal(false);
      Alert.alert('Success', 'Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const messageTemplates = [
    {
      title: 'Progress Update',
      subject: 'Student Progress Update',
      message: 'Following our recent counseling sessions with [Student Name], I wanted to share their progress and recommend some strategies for continued support...'
    },
    {
      title: 'Parent Meeting Request',
      subject: 'Request for Parent Conference',
      message: 'I would like to schedule a meeting to discuss [Student Name]\'s progress and develop a collaborative support plan...'
    },
    {
      title: 'Teacher Consultation',
      subject: 'Student Support Strategies',
      message: 'Based on my counseling sessions with [Student Name], here are some classroom strategies that may help...'
    },
    {
      title: 'Discipline Referral',
      subject: 'Counseling Referral Response',
      message: 'Thank you for referring [Student Name] for counseling support. I have scheduled an initial assessment...'
    }
  ];

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Communications</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>API Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMessagingData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Communications</Text>
      </View>

      {/* API Notice */}
      <View style={styles.apiNotice}>
        <Text style={styles.apiNoticeText}>
          📧 Using general messaging API - Basic communication features available
        </Text>
      </View>

      {/* Messaging Summary */}
      {messagingSummary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Message Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{messagingSummary.totalSent}</Text>
              <Text style={styles.summaryLabel}>Sent</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{messagingSummary.totalReceived}</Text>
              <Text style={styles.summaryLabel}>Received</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#e74c3c' }]}>
                {messagingSummary.unreadMessages}
              </Text>
              <Text style={styles.summaryLabel}>Unread</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => setShowComposeModal(true)}
        >
          <Text style={styles.composeButtonText}>✉️ Compose Message</Text>
        </TouchableOpacity>
      </View>

      {/* Message Templates */}
      <View style={styles.templatesSection}>
        <Text style={styles.sectionTitle}>Quick Message Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {messageTemplates.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={styles.templateCard}
              onPress={() => {
                setNewMessage({
                  ...newMessage,
                  subject: template.subject,
                  message: template.message,
                });
                setShowComposeModal(true);
              }}
            >
              <Text style={styles.templateTitle}>{template.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Communication Guidelines */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.guidelinesSection}>
          <Text style={styles.sectionTitle}>Communication Guidelines</Text>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>👨‍👩‍👧‍👦 Parent Communications</Text>
            <Text style={styles.guidelineText}>
              • Update parents on student progress regularly{'\n'}
              • Share positive achievements and improvements{'\n'}
              • Provide specific strategies for home support{'\n'}
              • Schedule face-to-face meetings when needed
            </Text>
          </View>

          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>👨‍🏫 Teacher Collaborations</Text>
            <Text style={styles.guidelineText}>
              • Share classroom management strategies{'\n'}
              • Provide behavioral intervention suggestions{'\n'}
              • Coordinate support for struggling students{'\n'}
              • Follow up on implementation of strategies
            </Text>
          </View>

          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>👔 Administrative Reports</Text>
            <Text style={styles.guidelineText}>
              • Report on serious behavioral incidents{'\n'}
              • Request additional resources when needed{'\n'}
              • Provide monthly counseling summaries{'\n'}
              • Coordinate with discipline and academic teams
            </Text>
          </View>
        </View>

        {/* API Limitations */}
        <View style={styles.limitationsSection}>
          <Text style={styles.limitationsTitle}>Current Communication Limitations</Text>
          <Text style={styles.limitationsText}>
            • No conversation history tracking{'\n'}
            • Limited message thread management{'\n'}
            • No real-time messaging features{'\n'}
            • Basic recipient selection available{'\n'}
            • Standard messaging API endpoints only
          </Text>
        </View>
      </ScrollView>

      {/* Compose Message Modal */}
      <Modal
        visible={showComposeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Compose Message</Text>
            
            <Text style={styles.inputLabel}>Recipient Type:</Text>
            <View style={styles.recipientTypeContainer}>
              {['PARENT', 'TEACHER', 'STAFF', 'ADMIN'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.recipientTypeButton,
                    newMessage.recipientType === type && styles.selectedRecipientType,
                  ]}
                  onPress={() => setNewMessage({ ...newMessage, recipientType: type })}
                >
                  <Text
                    style={[
                      styles.recipientTypeText,
                      newMessage.recipientType === type && styles.selectedRecipientTypeText,
                    ]}
                  >
                    {getRecipientIcon(type)} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={newMessage.subject}
              onChangeText={(text) => setNewMessage({ ...newMessage, subject: text })}
            />

            <Text style={styles.inputLabel}>Priority:</Text>
            <View style={styles.priorityContainer}>
              {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: getPriorityColor(priority) },
                    newMessage.priority === priority && styles.selectedPriority,
                  ]}
                  onPress={() => setNewMessage({ ...newMessage, priority: priority as any })}
                >
                  <Text style={styles.priorityOptionText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message here..."
              value={newMessage.message}
              onChangeText={(text) => setNewMessage({ ...newMessage, message: text })}
              multiline
              numberOfLines={5}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowComposeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={isLoading}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  apiNotice: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  apiNoticeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  summarySection: {
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  composeButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  composeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  templatesSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  templateCard: {
    backgroundColor: '#f8f9fa',
    marginLeft: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120,
  },
  templateTitle: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  guidelinesSection: {
    marginBottom: 16,
  },
  guidelineCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  limitationsSection: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
    marginBottom: 100, // Space for bottom navigation
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 8,
  },
  recipientTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  recipientTypeButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedRecipientType: {
    backgroundColor: '#9b59b6',
    borderColor: '#8e44ad',
  },
  recipientTypeText: {
    fontSize: 11,
    color: '#34495e',
    fontWeight: '500',
  },
  selectedRecipientTypeText: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    opacity: 0.7,
  },
  selectedPriority: {
    opacity: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  priorityOptionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default GuidanceCounselorCommunicationsScreen; 