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
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface Exam {
  id: number;
  name: string;
  examDate: string;
  duration: number;
  subjectId: number;
  // This would ideally come from a populated field in the API
  subjectName?: string; 
  className?: string;
  status: 'upcoming' | 'ongoing' | 'completed'; // This would be derived
}

interface SelectedRole {
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
}

interface TeacherExamsScreenProps {
  user: User;
  selectedRole: SelectedRole;
  token: string;
  navigation: any;
  onNavigate: (screen: string, params?: any) => void;
}

const TeacherExamsScreen: React.FC<TeacherExamsScreenProps> = ({
  user,
  selectedRole,
  token,
  navigation,
  onNavigate,
}) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('ongoing');

  const fetchExams = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        academicYearId: selectedRole.academicYearId.toString(),
      });
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/exams?${queryParams.toString()}`;
      console.log('Fetching exams from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Manually add mock status and details for demo purposes
          const processedExams = data.data.map((exam: Exam, index: number) => ({
            ...exam,
            status: index % 3 === 0 ? 'completed' : index % 2 === 0 ? 'ongoing' : 'upcoming',
            subjectName: `Subject ${exam.subjectId}`,
            className: `Class ${index + 1}`
          }));
          setExams(processedExams);
          console.log('✅ Successfully fetched exams');
        } else {
          setExams(mockExams);
        }
      } else {
        setExams(mockExams);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      Alert.alert('Error', 'Could not fetch exams.');
      setExams(mockExams);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedRole]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExams();
  };

  const filteredExams = exams.filter(exam => exam.status === activeTab);

  const renderSkeletonLoader = () => (
    [...Array(4)].map((_, i) => <View key={i} style={styles.skeletonCard} />)
  );
  
  const getStatusStyle = (status: Exam['status']) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
      case 'ongoing': return { bg: '#ffedd5', text: '#f97316' };
      case 'upcoming': return { bg: '#dbeafe', text: '#2563eb' };
    }
  };

  const renderExamCard = (exam: Exam) => (
    <TouchableOpacity 
      key={exam.id} 
      style={styles.examCard}
      activeOpacity={0.8}
      onPress={() => onNavigate('TeacherMarks', { examId: exam.id, subjectId: exam.subjectId, token })}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(exam.status).bg }]}>
        <Text style={[styles.statusText, { color: getStatusStyle(exam.status).text }]}>{exam.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.examTitle}>{exam.name}</Text>
      <Text style={styles.examSubtitle}>{exam.subjectName} • {exam.className}</Text>
      
      <View style={styles.separator} />

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>📅 {new Date(exam.examDate).toLocaleDateString()}</Text>
        <Text style={styles.detailText}>⏱️ {exam.duration} mins</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exams & Quizzes</Text>
      </View>

      <View style={styles.tabContainer}>
        {(['ongoing', 'upcoming', 'completed'] as const).map(tab => (
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
          renderSkeletonLoader()
        ) : filteredExams.length > 0 ? (
          filteredExams.map(renderExamCard)
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No {activeTab} exams found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockExams: Exam[] = [
    { id: 1, name: 'Mid-term Mathematics', examDate: '2024-03-15T10:00:00Z', duration: 120, subjectId: 1, status: 'ongoing', subjectName: 'Mathematics', className: 'Form 5A' },
    { id: 2, name: 'Physics Practical', examDate: '2024-03-20T14:00:00Z', duration: 90, subjectId: 2, status: 'upcoming', subjectName: 'Physics', className: 'Form 5A' },
    { id: 3, name: 'Final English Paper', examDate: '2024-03-10T09:00:00Z', duration: 180, subjectId: 3, status: 'completed', subjectName: 'English', className: 'Form 4B' },
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: { backgroundColor: '#667eea' },
  tabText: { color: '#334155', fontWeight: '600' },
  activeTabText: { color: '#ffffff' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  skeletonCard: { height: 150, backgroundColor: '#e2e8f0', borderRadius: 24, marginBottom: 16 },
  examCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  examTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  examSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  detailsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  detailText: { fontSize: 14, color: '#334155' },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: { fontSize: 16, color: '#64748b' },
});

export default TeacherExamsScreen; 