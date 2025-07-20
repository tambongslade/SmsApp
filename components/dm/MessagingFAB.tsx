import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../../constants';

interface MessagingFABProps {
  token: string;
  user: any;
  onNavigate?: (screen: string, params?: any) => void;
}

interface QuickMessage {
  id: string;
  title: string;
  icon: string;
  description: string;
  recipients: string;
  template: string;
}

const MessagingFAB: React.FC<MessagingFABProps> = ({ token, user, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<QuickMessage | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [expandAnimation] = useState(new Animated.Value(0));

  const quickMessages: QuickMessage[] = [
    {
      id: 'parent-alert',
      title: 'Alert Parents',
      icon: '👨‍👩‍👧‍👦',
      description: 'Send urgent behavioral alert to parents',
      recipients: 'Parents',
      template: 'Your child has been involved in a behavioral incident today. Please contact the school for more details.'
    },
    {
      id: 'teacher-update',
      title: 'Teacher Update',
      icon: '👨‍🏫',
      description: 'Send disciplinary updates to teachers',
      recipients: 'Teachers',
      template: 'Disciplinary update: Please monitor student behavior and report any concerns.'
    },
    {
      id: 'admin-report',
      title: 'Admin Report',
      icon: '📊',
      description: 'Send report to administration',
      recipients: 'Administration',
      template: 'Daily discipline report: Summary of incidents and actions taken.'
    },
    {
      id: 'emergency-alert',
      title: 'Emergency Alert',
      icon: '🚨',
      description: 'Send emergency notification',
      recipients: 'All Staff',
      template: 'URGENT: Immediate attention required for disciplinary matter.'
    }
  ];

  const toggleFAB = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(expandAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleQuickMessage = (message: QuickMessage) => {
    setSelectedMessage(message);
    setMessageText(message.template);
    setShowMessageModal(true);
    toggleFAB();
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedMessage) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSending(true);
    
    try {
      console.log('📤 [MessagingFAB] Sending message:', {
        type: selectedMessage.id,
        recipients: selectedMessage.recipients,
        message: messageText
      });

      const response = await fetch(`${API_BASE_URL}/discipline-master/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedMessage.id,
          recipients: selectedMessage.recipients,
          message: messageText,
          priority: selectedMessage.id === 'emergency-alert' ? 'HIGH' : 'NORMAL',
          senderId: user.id,
          senderName: user.name,
        }),
      });

      console.log('📊 [MessagingFAB] Message response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [MessagingFAB] Message sent successfully:', data);
        
        Alert.alert(
          'Message Sent',
          `Your message has been sent to ${selectedMessage.recipients}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowMessageModal(false);
                setSelectedMessage(null);
                setMessageText('');
              }
            }
          ]
        );
      } else {
        const errorData = await response.json();
        console.error('❌ [MessagingFAB] Message failed:', errorData);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('❌ [MessagingFAB] Error sending message:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewMessages = () => {
    toggleFAB();
    if (onNavigate) {
      onNavigate('MessagesScreen', { token, user });
    } else {
      Alert.alert('Coming Soon', 'Message viewing functionality will be available soon.');
    }
  };

  return (
    <>
      {/* FAB Options */}
      {isExpanded && (
        <View style={styles.fabOptionsContainer}>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={handleViewMessages}
          >
            <View style={styles.fabOptionContent}>
              <Text style={styles.fabOptionIcon}>💬</Text>
              <Text style={styles.fabOptionLabel}>View Messages</Text>
            </View>
          </TouchableOpacity>

          {quickMessages.map((message, index) => (
            <Animated.View
              key={message.id}
              style={[
                styles.fabOption,
                {
                  transform: [
                    {
                      translateY: expandAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -(index + 2) * 60],
                      }),
                    },
                  ],
                  opacity: expandAnimation,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.fabOptionContent}
                onPress={() => handleQuickMessage(message)}
              >
                <Text style={styles.fabOptionIcon}>{message.icon}</Text>
                <Text style={styles.fabOptionLabel}>{message.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[styles.fab, isExpanded && styles.fabExpanded]}
        onPress={toggleFAB}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: expandAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}
        >
          <Text style={styles.fabIcon}>💬</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Message Compose Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMessage && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedMessage.icon} {selectedMessage.title}
                </Text>
                <Text style={styles.modalSubtitle}>
                  To: {selectedMessage.recipients}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedMessage.description}
                </Text>

                <View style={styles.messageInputContainer}>
                  <Text style={styles.inputLabel}>Message:</Text>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Enter your message..."
                    multiline
                    numberOfLines={6}
                    value={messageText}
                    onChangeText={setMessageText}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowMessageModal(false);
                      setSelectedMessage(null);
                      setMessageText('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.sendButtonText}>Send Message</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabExpanded: {
    backgroundColor: '#a93226',
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  fabOptionsContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  fabOption: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  fabOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 140,
  },
  fabOptionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fabOptionLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#495057',
    minHeight: 120,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e74c3c',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessagingFAB; 