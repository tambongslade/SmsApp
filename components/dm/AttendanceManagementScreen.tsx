import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';


interface AttendanceManagementScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface LateStudent {
  id: number;
  name: string;
  class: string;
  arrivalTime: string;
  reason?: string;
  status: 'PENDING' | 'RECORDED';
}

interface AbsentStudent {
  id: number;
  name: string;
  class: string;
  type: 'EXCUSED' | 'UNEXCUSED';
  lastContact?: string;
  status: 'PENDING' | 'CONTACTED';
}

const AttendanceManagementScreen: React.FC<AttendanceManagementScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState('lateness');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [reason, setReason] = useState('');

  // Mock data
  const lateStudents: LateStudent[] = [
    { id: 1, name: 'John Doe', class: 'Form 5A', arrivalTime: '07:45', reason: 'Transport delay', status: 'PENDING' },
    { id: 2, name: 'Mary Smith', class: 'Form 3B', arrivalTime: '08:00', reason: 'Family emergency', status: 'PENDING' },
    { id: 3, name: 'Peter Johnson', class: 'Form 4A', arrivalTime: '08:15', reason: 'Traffic jam', status: 'PENDING' },
    { id: 4, name: 'Sarah Williams', class: 'Form 2C', arrivalTime: '07:50', reason: 'Medical appointment', status: 'RECORDED' },
  ];

  const absentStudents: AbsentStudent[] = [
    { id: 5, name: 'Michael Brown', class: 'Form 1B', type: 'UNEXCUSED', lastContact: 'Never', status: 'PENDING' },
    { id: 6, name: 'Lisa Davis', class: 'Form 6A', type: 'EXCUSED', lastContact: 'Today', status: 'CONTACTED' },
    { id: 7, name: 'James Wilson', class: 'Form 4C', type: 'UNEXCUSED', lastContact: 'Yesterday', status: 'PENDING' },
    { id: 8, name: 'Emma Johnson', class: 'Form 3A', type: 'EXCUSED', lastContact: 'Today', status: 'CONTACTED' },
  ];

  const attendanceStats = {
    totalStudents: 1245,
    present: 1187,
    lateArrivals: lateStudents.filter(s => s.status === 'PENDING').length,
    absent: absentStudents.length,
    excusedAbsences: absentStudents.filter(s => s.type === 'EXCUSED').length,
    unexcusedAbsences: absentStudents.filter(s => s.type === 'UNEXCUSED').length,
  };

  const reasonOptions = [
    'Transport delay',
    'Family emergency', 
    'Traffic jam',
    'Medical appointment',
    'Overslept',
    'Other'
  ];

  const handleRecordLateness = (studentId: number) => {
    Alert.alert(
      'Record Lateness',
      'Lateness has been recorded successfully',
      [{ text: 'OK' }]
    );
  };

  const handleContactParent = (studentId: number, studentName: string) => {
    Alert.alert(
      'Contact Parent',
      `Contact parent of ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'Parent contact initiated') },
        { text: 'SMS', onPress: () => Alert.alert('SMS Sent', 'Absence notification sent to parent') },
      ]
    );
  };

  const handleQuickRecord = () => {
    if (!selectedStudent || !arrivalTime) {
      Alert.alert('Error', 'Please enter student name and arrival time');
      return;
    }
    
    Alert.alert('Success', 'Lateness recorded successfully');
    setShowRecordModal(false);
    setSelectedStudent('');
    setArrivalTime('');
    setReason('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📅 Attendance Management</Text>
          <Text style={styles.headerSubtitle}>Record Daily Attendance</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowRecordModal(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Attendance Status</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: '#27ae60' }]}>
            <Text style={styles.statNumber}>{attendanceStats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#f39c12' }]}>
            <Text style={styles.statNumber}>{attendanceStats.lateArrivals}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.statNumber}>{attendanceStats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>
        <Text style={styles.attendanceRate}>
          📊 Attendance Rate: {Math.round((attendanceStats.present / attendanceStats.totalStudents) * 100)}%
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'lateness' && styles.activeTab]}
          onPress={() => setActiveTab('lateness')}
        >
          <Text style={[styles.tabText, activeTab === 'lateness' && styles.activeTabText]}>
            Late Arrivals ({attendanceStats.lateArrivals})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'absences' && styles.activeTab]}
          onPress={() => setActiveTab('absences')}
        >
          <Text style={[styles.tabText, activeTab === 'absences' && styles.activeTabText]}>
            Absent ({attendanceStats.absent})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'lateness' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Late Arrivals Today</Text>
            
            {lateStudents.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentClass}>{student.class}</Text>
                  </View>
                  <View style={styles.timeInfo}>
                    <Text style={styles.arrivalTime}>{student.arrivalTime}</Text>
                    <Text style={[
                      styles.status,
                      { color: student.status === 'RECORDED' ? '#27ae60' : '#f39c12' }
                    ]}>
                      {student.status}
                    </Text>
                  </View>
                </View>
                
                {student.reason && (
                  <Text style={styles.reason}>💭 {student.reason}</Text>
                )}
                
                <View style={styles.studentActions}>
                  {student.status === 'PENDING' && (
                    <>
                      <TouchableOpacity 
                        style={styles.recordButton}
                        onPress={() => handleRecordLateness(student.id)}
                      >
                        <Text style={styles.recordButtonText}>Record</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {student.status === 'RECORDED' && (
                    <View style={styles.recordedBadge}>
                      <Text style={styles.recordedText}>✅ Recorded</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'absences' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ Absent Students</Text>
            
            <View style={styles.absenceStats}>
              <Text style={styles.absenceStatsText}>
                📊 Excused: {attendanceStats.excusedAbsences} | Unexcused: {attendanceStats.unexcusedAbsences}
              </Text>
            </View>
            
            {absentStudents.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentClass}>{student.class}</Text>
                  </View>
                  <View style={styles.absenceInfo}>
                    <Text style={[
                      styles.absenceType,
                      { color: student.type === 'EXCUSED' ? '#27ae60' : '#e74c3c' }
                    ]}>
                      {student.type}
                    </Text>
                    <Text style={styles.lastContact}>Last: {student.lastContact}</Text>
                  </View>
                </View>
                
                <View style={styles.studentActions}>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleContactParent(student.id, student.name)}
                  >
                    <Text style={styles.contactButtonText}>Contact Parent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.markButton}>
                    <Text style={styles.markButtonText}>Mark Present</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Quick Record Modal */}
      <Modal
        visible={showRecordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏰ Record Lateness</Text>
            
            <Text style={styles.inputLabel}>Student Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Type student name..."
              value={selectedStudent}
              onChangeText={setSelectedStudent}
            />
            
            <Text style={styles.inputLabel}>Arrival Time</Text>
            <TextInput
              style={styles.textInput}
              placeholder="08:15"
              value={arrivalTime}
              onChangeText={setArrivalTime}
            />
            
            <Text style={styles.inputLabel}>Reason (Optional)</Text>
            <View style={styles.reasonGrid}>
              {reasonOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.reasonOption,
                    reason === option && styles.selectedReason
                  ]}
                  onPress={() => setReason(option)}
                >
                  <Text style={[
                    styles.reasonText,
                    reason === option && styles.selectedReasonText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRecordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleQuickRecord}
              >
                <Text style={styles.saveButtonText}>Record</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: '#c0392b',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  attendanceRate: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c0392b',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#c0392b',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  absenceStats: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  absenceStatsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c0392b',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  absenceInfo: {
    alignItems: 'flex-end',
  },
  absenceType: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastContact: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  reason: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  recordButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  editButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  markButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  markButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recordedBadge: {
    flex: 1,
    backgroundColor: '#d4edda',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordedText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
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
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  reasonOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  selectedReason: {
    backgroundColor: '#c0392b',
    borderColor: '#c0392b',
  },
  reasonText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  selectedReasonText: {
    color: 'white',
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
  saveButton: {
    flex: 1,
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
});

export default AttendanceManagementScreen; 