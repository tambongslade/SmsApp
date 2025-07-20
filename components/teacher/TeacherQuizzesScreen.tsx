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

interface Quiz {
  id: number;
  title: string;
  subject: { name: string };
  classIds: string; // JSON string of numbers
  totalMarks: number;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'published' | 'completed'; // Mocked status
  submissionCount?: number; // Mocked
  totalStudents?: number; // Mocked
}

interface TeacherQuizzesScreenProps {
  route: any;
  navigation: any;
}

const TeacherQuizzesScreen: React.FC<TeacherQuizzesScreenProps> = ({
  route,
  navigation,
}) => {
  const { token, user, selectedRole } = route.params as { token: string, user: User, selectedRole: any };
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'published' | 'draft' | 'completed'>('published');

  const fetchQuizzes = useCallback(async () => {
    try {
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/quiz`; // Assuming this fetches teacher's quizzes
      console.log('Fetching quizzes from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Mock status and counts for demo
          const processedQuizzes = data.data.map((q: any) => ({
            ...q,
            status: 'published',
            submissionCount: Math.floor(Math.random() * 30),
            totalStudents: 30,
          }));
          setQuizzes(processedQuizzes);
          console.log('✅ Successfully fetched quizzes');
        } else {
          setQuizzes(mockQuizzes);
        }
      } else {
        setQuizzes(mockQuizzes);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      Alert.alert('Error', 'Could not fetch quizzes.');
      setQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuizzes();
  };

  const filteredQuizzes = quizzes.filter(q => q.status === activeTab);
  
  const getStatusStyle = (status: Quiz['status']) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
      case 'published': return { bg: '#ffedd5', text: '#f97316' };
      case 'draft': return { bg: '#dbeafe', text: '#2563eb' };
    }
  };

  const renderQuizCard = (quiz: Quiz) => (
    <TouchableOpacity 
      key={quiz.id} 
      style={styles.quizCard}
      activeOpacity={0.8}
      // onPress={() => onNavigate('QuizStatistics', { quizId: quiz.id, token })}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(quiz.status).bg }]}>
        <Text style={[styles.statusText, { color: getStatusStyle(quiz.status).text }]}>{quiz.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      <Text style={styles.quizSubtitle}>{quiz.subject.name}</Text>
      
      <View style={styles.separator} />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{quiz.submissionCount || 0}/{quiz.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>Completions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{quiz.totalMarks}</Text>
          <Text style={styles.statLabel}>Total Marks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'N/A'}</Text>
          <Text style={styles.statLabel}>End Date</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quizzes</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['published', 'draft', 'completed'] as const).map(tab => (
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{marginTop: 50}}/>
        ) : filteredQuizzes.length > 0 ? (
          filteredQuizzes.map(renderQuizCard)
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No {activeTab} quizzes.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockQuizzes: Quiz[] = [
  { id: 1, title: 'Algebra Basics', subject: { name: 'Mathematics' }, classIds: '[1,2]', totalMarks: 20, endDate: '2024-03-20', status: 'published', submissionCount: 15, totalStudents: 60 },
  { id: 2, title: 'Cellular Biology', subject: { name: 'Biology' }, classIds: '[3]', totalMarks: 15, endDate: '2024-03-22', status: 'published', submissionCount: 20, totalStudents: 30 },
  { id: 3, title: 'Intro to Physics (Draft)', subject: { name: 'Physics' }, classIds: '[1]', totalMarks: 25, status: 'draft' },
  { id: 4, title: 'History of Rome', subject: { name: 'History' }, classIds: '[4]', totalMarks: 50, endDate: '2024-03-01', status: 'completed', submissionCount: 28, totalStudents: 28 },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', flex: 1, textAlign: 'center' },
  createButton: {
    position: 'absolute',
    right: 20,
    top: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: { color: '#ffffff', fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 10,
  },
  tab: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20 },
  activeTab: { backgroundColor: '#667eea', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  tabText: { color: '#334155', fontWeight: '600' },
  activeTabText: { color: '#ffffff' },
  scrollView: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  quizTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  quizSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyStateText: { fontSize: 16, color: '#64748b' },
});

export default TeacherQuizzesScreen; 