import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  studentId: number;
  studentName: string;
  studentMatricule: string;
  className: string;
  interviewStatus: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'OVERDUE';
  registrationDate: string;
  scheduledDate?: string;
  completedDate?: string;
  score?: number;
  comments?: string;
}

interface StudentInterviewsScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const StudentInterviewsScreen: React.FC<StudentInterviewsScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewScore, setInterviewScore] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Add error handling for missing props
  if (!user || !token) {
    console.error('❌ Student Interviews: Missing required props - user:', !!user, 'token:', !!token);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Missing user or token data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fetchStudents = useCallback(async () => {
    // Double check token exists before API call
    if (!token) {
      console.error('❌ Student Interviews: Token is undefined, cannot make API call');
      setStudents(mockStudents);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔵 Student Interviews: Starting API call to fetch students');
      console.log('🔵 Student Interviews: API URL:', `${API_BASE_URL}/vice-principal/interviews`);
      console.log('🔵 Student Interviews: Token:', token ? 'Token present' : 'Token missing');
      
      const response = await fetch(`${API_BASE_URL}/vice-principal/interviews`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('🔵 Student Interviews: Response status:', response.status);
      console.log('🔵 Student Interviews: Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔵 Student Interviews: Response data:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('✅ Student Interviews: API call successful, using real data');
          setStudents(result.data);
        } else {
          console.log('⚠️ Student Interviews: API returned success=false, using mock data');
          console.log('⚠️ Student Interviews: API error message:', result.message || 'No error message');
          setStudents(mockStudents);
        }
      } else {
        console.log('❌ Student Interviews: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Student Interviews: Error response:', errorText);
        setStudents(mockStudents);
      }
    } catch (error) {
      console.log('❌ Student Interviews: API Error:', error);
      console.log('❌ Student Interviews: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setStudents(mockStudents);
    } finally {
      console.log('🔵 Student Interviews: API call completed, setting loading to false');
      setIsLoading(false);
    }
  }, [token]);

  const mockStudents: Student[] = [
    {
      id: 1,
      studentId: 1,
      studentName: 'John Doe',
      studentMatricule: 'ST2024001',
      className: 'Form 1',
      interviewStatus: 'PENDING',
      registrationDate: '2024-03-15'
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Jane Smith',
      studentMatricule: 'ST2024002',
      className: 'Form 2',
      interviewStatus: 'SCHEDULED',
      scheduledDate: '2024-03-20',
      registrationDate: '2024-03-14'
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Mike Johnson',
      studentMatricule: 'ST2024003',
      className: 'Form 1',
      interviewStatus: 'COMPLETED',
      completedDate: '2024-03-18',
      score: 85,
      comments: 'Good communication skills',
      registrationDate: '2024-03-13'
    },
    {
      id: 4,
      studentId: 4,
      studentName: 'Sarah Wilson',
      studentMatricule: 'ST2024004',
      className: 'Form 2',
      interviewStatus: 'OVERDUE',
      scheduledDate: '2024-03-17',
      registrationDate: '2024-03-12'
    }
  ];

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.studentMatricule || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'ALL' || student.interviewStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const scheduleInterview = async (studentId: number) => {
    if (!token) {
      console.error('❌ Schedule Interview: Token is undefined, cannot make API call');
      Alert.alert('Error', 'Authentication token is missing');
      return;
    }

    try {
      console.log('🔵 Schedule Interview: Starting API call to schedule interview');
      console.log('🔵 Schedule Interview: API URL:', `${API_BASE_URL}/vice-principal/schedule-interview`);
      console.log('🔵 Schedule Interview: Token:', token ? 'Token present' : 'Token missing');
      console.log('🔵 Schedule Interview: Student ID:', studentId);
      console.log('🔵 Schedule Interview: Scheduled Date:', new Date().toISOString().split('T')[0]);

      const response = await fetch(`${API_BASE_URL}/vice-principal/schedule-interview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          scheduledDate: new Date().toISOString().split('T')[0],
        }),
      });

      console.log('🔵 Schedule Interview: Response status:', response.status);
      console.log('🔵 Schedule Interview: Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Schedule Interview: API call successful, using real data');
        console.log('✅ Schedule Interview: Response data:', JSON.stringify(result, null, 2));
        Alert.alert('Success', 'Interview scheduled successfully');
        fetchStudents();
      } else {
        console.log('❌ Schedule Interview: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Schedule Interview: Error response:', errorText);
        Alert.alert('Error', 'Failed to schedule interview');
      }
    } catch (error) {
      console.log('❌ Schedule Interview: API Error:', error);
      console.log('❌ Schedule Interview: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      Alert.alert('Error', 'Failed to schedule interview');
    }
  };

  const conductInterview = (student: Student) => {
    setSelectedStudent(student);
    setInterviewScore('');
    setInterviewNotes('');
    setShowModal(true);
  };

  const submitInterview = async () => {
    if (!selectedStudent) return;

    if (!token) {
      console.error('❌ Conduct Interview: Token is undefined, cannot make API call');
      Alert.alert('Error', 'Authentication token is missing');
      return;
    }

    const score = parseInt(interviewScore);
    if (isNaN(score) || score < 0 || score > 100) {
      Alert.alert('Error', 'Please enter a valid score (0-100)');
      return;
    }

    try {
      console.log('🔵 Conduct Interview: Starting API call to submit interview');
      console.log('🔵 Conduct Interview: API URL:', `${API_BASE_URL}/vice-principal/conduct-interview`);
      console.log('🔵 Conduct Interview: Token:', token ? 'Token present' : 'Token missing');
      console.log('🔵 Conduct Interview: Student ID:', selectedStudent.studentId);
      console.log('🔵 Conduct Interview: Score:', score);
      console.log('🔵 Conduct Interview: Notes:', interviewNotes);

      const response = await fetch(`${API_BASE_URL}/vice-principal/conduct-interview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.studentId,
          score: score,
          comments: interviewNotes,
        }),
      });

      console.log('🔵 Conduct Interview: Response status:', response.status);
      console.log('🔵 Conduct Interview: Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Conduct Interview: API call successful, using real data');
        console.log('✅ Conduct Interview: Response data:', JSON.stringify(result, null, 2));
        Alert.alert('Success', 'Interview completed successfully');
        setShowModal(false);
        fetchStudents();
      } else {
        console.log('❌ Conduct Interview: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Conduct Interview: Error response:', errorText);
        Alert.alert('Error', 'Failed to submit interview');
      }
    } catch (error) {
      console.log('❌ Conduct Interview: API Error:', error);
      console.log('❌ Conduct Interview: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      Alert.alert('Error', 'Failed to submit interview');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'SCHEDULED': return '#3498db';
      case 'COMPLETED': return '#27ae60';
      case 'OVERDUE': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'SCHEDULED': return '📅';
      case 'COMPLETED': return '✅';
      case 'OVERDUE': return '🚨';
      default: return '❓';
    }
  };

  const getActionButton = (student: Student) => {
    switch (student.interviewStatus) {
      case 'PENDING':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3498db' }]}
            onPress={() => scheduleInterview(student.studentId)}
          >
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>
        );
      case 'SCHEDULED':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
            onPress={() => conductInterview(student)}
          >
            <Text style={styles.actionButtonText}>Conduct</Text>
          </TouchableOpacity>
        );
      case 'OVERDUE':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
            onPress={() => conductInterview(student)}
          >
            <Text style={styles.actionButtonText}>Urgent</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading Interviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Student Interviews</Text>
          <Text style={styles.headerSubtitle}>
            {students.length} total students • {students.filter(s => s.interviewStatus === 'PENDING').length} pending
          </Text>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
            <Text style={styles.statNumber}>{students.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
            <Text style={styles.statNumber}>{students.filter(s => s.interviewStatus === 'PENDING').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
            <Text style={styles.statNumber}>{students.filter(s => s.interviewStatus === 'COMPLETED').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
            <Text style={styles.statNumber}>
              {students.filter(s => s.interviewStatus === 'COMPLETED').length > 0 
                ? Math.round(students.filter(s => s.interviewStatus === 'COMPLETED' && s.score).reduce((avg, s) => avg + (s.score || 0), 0) / students.filter(s => s.interviewStatus === 'COMPLETED' && s.score).length)
                : 0}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6c757d"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'PENDING', 'COMPLETED'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                filter === filterType && styles.activeFilterTab
              ]}
              onPress={() => setFilter(filterType as any)}
            >
              <Text style={[
                styles.filterText,
                filter === filterType && styles.activeFilterText
              ]}>
                {filterType} 
                {filterType === 'PENDING' && ` (${students.filter(s => s.interviewStatus === 'PENDING').length})`}
                {filterType === 'COMPLETED' && ` (${students.filter(s => s.interviewStatus === 'COMPLETED').length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Students List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredStudents.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.studentName}</Text>
                <Text style={styles.studentDetails}>
                  {student.studentMatricule} • {student.className}
                </Text>
                <Text style={styles.registrationDate}>
                  Registered: {formatDate(student.registrationDate)}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.interviewStatus) }]}>
                  <Text style={styles.statusIcon}>{getStatusIcon(student.interviewStatus)}</Text>
                  <Text style={styles.statusText}>{student.interviewStatus}</Text>
                </View>
              </View>
            </View>
            
            {student.scheduledDate && (
              <View style={styles.studentMeta}>
                <Text style={styles.metaLabel}>Scheduled: {formatDate(student.scheduledDate)}</Text>
              </View>
            )}
            
            {student.completedDate && (
              <View style={styles.studentMeta}>
                <View style={styles.completedInfo}>
                  <Text style={styles.metaLabel}>Completed: {formatDate(student.completedDate)}</Text>
                  {student.score && (
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreText, { color: getScoreColor(student.score) }]}>
                        {student.score}/100
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {student.comments && (
              <View style={styles.commentsContainer}>
                <Text style={styles.commentsTitle}>Interview Notes:</Text>
                <Text style={styles.commentsText}>{student.comments}</Text>
              </View>
            )}
            
            <View style={styles.studentActions}>
              {getActionButton(student)}
            </View>
          </View>
        ))}
        
        {filteredStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No students found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filter</Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Interview Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conduct Interview</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudent?.studentName} • {selectedStudent?.studentMatricule}
            </Text>
            
            <View style={styles.modalForm}>
              <Text style={styles.formLabel}>Score (0-100)</Text>
              <TextInput
                style={styles.formInput}
                value={interviewScore}
                onChangeText={setInterviewScore}
                placeholder="Enter score..."
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>Notes/Comments</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={interviewNotes}
                onChangeText={setInterviewNotes}
                placeholder="Enter interview notes and comments..."
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitInterview}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Dashboard', { user, selectedRole: { role: 'VICE_PRINCIPAL', academicYearId: null, academicYearName: null }, token })}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🎤</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Interviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('StudentAssignments', { user, token })}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Assignments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('ClassManagement', { user, token })}>
          <Text style={styles.navIcon}>🏫</Text>
          <Text style={styles.navLabel}>Classes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#8e44ad',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTab: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  studentDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  registrationDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  studentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  scoreContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  commentsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width - 32,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  modalForm: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#27ae60',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 80,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#8e44ad',
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default StudentInterviewsScreen; 