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
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface StudentMark {
  id: number;
  name: string;
  matricule: string;
  photo?: string;
  mark?: {
    id: number;
    score: number;
  };
}

interface ExamSequence {
  id: number;
  name: string;
  term: string;
}

interface TeacherMarksScreenProps {
  route: any;
  navigation: any;
}

const TeacherMarksScreen: React.FC<TeacherMarksScreenProps> = ({
  route,
  navigation,
}) => {
  const { subclassId, subjectId, token, user, selectedRole } = route.params as { subclassId: number, subjectId: number, token: string, user: User, selectedRole: any };
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [examSequences, setExamSequences] = useState<ExamSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<ExamSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentMark | null>(null);
  const [currentScore, setCurrentScore] = useState('');

  // Fetch sequences and students
  const fetchData = useCallback(async () => {
    try {
      // TODO: Fetch real sequences
      const mockSequences: ExamSequence[] = [
        { id: 1, name: 'Sequence 1', term: 'First Term' },
        { id: 2, name: 'Sequence 2', term: 'First Term' },
        { id: 3, name: 'Sequence 3', term: 'Second Term' },
      ];
      setExamSequences(mockSequences);
      if (mockSequences.length > 0) {
        setSelectedSequence(mockSequences[0]);
      }
      
      // Fetch students
      const studentUrl = `https://sms.sniperbuisnesscenter.com/api/v1/teachers/me/students?subClassId=${subclassId}&subjectId=${subjectId}`;
      const studentResponse = await fetch(studentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentData = await studentResponse.json();
      if (studentData.success) {
        setStudents(studentData.data);
      } else {
        setStudents(mockStudents); // fallback
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Could not fetch data.');
      setStudents(mockStudents); // fallback
    } finally {
      setLoading(false);
    }
  }, [subclassId, subjectId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveMark = async () => {
    if (!selectedStudent || !selectedSequence) return;
    const score = parseFloat(currentScore);
    if (isNaN(score) || score < 0 || score > 20) {
      Alert.alert('Invalid Score', 'Please enter a number between 0 and 20.');
      return;
    }

    // TODO: Implement API call to save the mark
    console.log('Saving mark:', {
      studentId: selectedStudent.id,
      sequenceId: selectedSequence.id,
      subjectId,
      score,
    });
    
    // Optimistic update
    setStudents(students.map(s => s.id === selectedStudent.id ? {...s, mark: {id: Date.now(), score}} : s));
    setModalVisible(false);
    Alert.alert('Success', 'Mark saved successfully!');
  };
  
  const openModal = (student: StudentMark) => {
    setSelectedStudent(student);
    setCurrentScore(student.mark?.score.toString() || '');
    setModalVisible(true);
  };
  
  const getStats = () => {
    const entered = students.filter(s => s.mark).length;
    return {
      total: students.length,
      entered,
      remaining: students.length - entered,
    };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marks Entry</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Sequence:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {examSequences.map(seq => (
            <TouchableOpacity 
              key={seq.id}
              style={[styles.sequenceChip, selectedSequence?.id === seq.id && styles.selectedSequenceChip]}
              onPress={() => setSelectedSequence(seq)}
            >
              <Text style={[styles.sequenceChipText, selectedSequence?.id === seq.id && styles.selectedSequenceChipText]}>{seq.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
          <Text style={styles.statItem}>Total: {stats.total}</Text>
          <Text style={styles.statItem}>Entered: {stats.entered}</Text>
          <Text style={styles.statItem}>Remaining: {stats.remaining}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#667eea" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.scrollView}>
          {students.map(student => (
            <View key={student.id} style={styles.studentRow}>
              <Image source={{ uri: student.photo || `https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}` }} style={styles.avatar} />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMatricule}>{student.matricule}</Text>
              </View>
              <TouchableOpacity style={styles.markButton} onPress={() => openModal(student)}>
                <Text style={styles.markText}>{student.mark ? student.mark.score.toString() : '-'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Mark for {selectedStudent?.name}</Text>
            <TextInput
              style={styles.modalInput}
              value={currentScore}
              onChangeText={setCurrentScore}
              keyboardType="numeric"
              placeholder="Score /20"
              maxLength={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveMark}>
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockStudents: StudentMark[] = [
    { id: 1, name: 'John Doe', matricule: 'S001', photo: 'https://via.placeholder.com/80' },
    { id: 2, name: 'Mary Smith', matricule: 'S002', photo: 'https://via.placeholder.com/80', mark: { id: 1, score: 18 } },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#667eea',
  },
  backButton: { padding: 8 },
  backButtonText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  selectorContainer: { padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' },
  selectorLabel: { fontSize: 16, fontWeight: '600', color: '#334155', marginRight: 10 },
  sequenceChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  selectedSequenceChip: { backgroundColor: '#667eea' },
  sequenceChipText: { color: '#334155', fontWeight: '600' },
  selectedSequenceChipText: { color: '#ffffff' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: { fontSize: 14, color: '#64748b' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 16 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  studentMatricule: { fontSize: 12, color: '#64748b', marginTop: 2 },
  markButton: {
    width: 60,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  markText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  modalInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', marginHorizontal: 8 },
  saveButton: { backgroundColor: '#667eea' },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  saveButtonText: { color: '#ffffff' },
});

export default TeacherMarksScreen; 