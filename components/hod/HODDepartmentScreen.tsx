import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useHOD } from '../HODContext';

const HODDepartmentScreen: React.FC = () => {
  const { departmentStats, teachers, sendTeacherMessage } = useHOD();
  const [refreshing, setRefreshing] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSendMessage = (teacherId: number, teacherName: string) => {
    setSelectedTeacher(teacherId);
    setMessageModal(true);
  };

  const submitMessage = () => {
    if (selectedTeacher && messageText.trim()) {
      sendTeacherMessage(selectedTeacher, messageText);
      setMessageModal(false);
      setMessageText('');
      setSelectedTeacher(null);
      Alert.alert('Success', 'Message sent to teacher');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#27ae60';
      case 'ON_LEAVE': return '#f39c12';
      case 'NEEDS_REVIEW': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 16) return '#27ae60';
    if (score >= 14) return '#f39c12';
    return '#e74c3c';
  };

  const selectedTeacherName = teachers.find(t => t.id === selectedTeacher)?.name || '';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Department Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 {departmentStats.departmentName} Department</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{departmentStats.totalTeachers}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{departmentStats.totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{departmentStats.departmentAverage.toFixed(1)}/20</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>#{departmentStats.schoolRanking}</Text>
              <Text style={styles.statLabel}>School Rank</Text>
            </View>
          </View>

          <View style={styles.trendCard}>
            <Text style={styles.trendText}>
              📈 {departmentStats.trend} {departmentStats.trendValue > 0 ? '+' : ''}{departmentStats.trendValue}% this term
            </Text>
          </View>
        </View>

        {/* Teachers Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Teacher Performance</Text>
          
          {teachers.map((teacher) => (
            <View key={teacher.id} style={styles.teacherCard}>
              <View style={styles.teacherHeader}>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{teacher.name}</Text>
                  <Text style={styles.teacherDetails}>
                    {teacher.classCount} classes • {teacher.studentCount} students
                  </Text>
                </View>
                <View style={styles.teacherMeta}>
                  <Text style={[styles.averageScore, { color: getPerformanceColor(teacher.averageScore) }]}>
                    {teacher.averageScore.toFixed(1)}/20
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.status) }]}>
                    <Text style={styles.statusText}>
                      {teacher.status === 'NEEDS_REVIEW' ? 'Review' : teacher.status.toLowerCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.teacherActions}>
                <Text style={styles.rankText}>Department Rank: #{teacher.departmentRank}</Text>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => handleSendMessage(teacher.id, teacher.name)}
                >
                  <Text style={styles.messageButtonText}>💬 Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>👨‍🏫</Text>
              <Text style={styles.actionLabel}>Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionLabel}>Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Message Modal */}
      <Modal visible={messageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Message {selectedTeacherName}</Text>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setMessageModal(false);
                  setMessageText('');
                  setSelectedTeacher(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={submitMessage}
              >
                <Text style={styles.sendButtonText}>Send</Text>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#27ae60',
  },
  trendText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  teacherCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  teacherDetails: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  teacherMeta: {
    alignItems: 'flex-end',
  },
  averageScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  teacherActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  messageButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#2c3e50',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 100,
    marginBottom: 16,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  sendButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HODDepartmentScreen; 