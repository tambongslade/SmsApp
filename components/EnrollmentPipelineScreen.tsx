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
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../constants';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  name: string;
  matricule: string;
  className: string;
  status: 'NOT_ENROLLED' | 'INTERVIEW_PENDING' | 'INTERVIEW_COMPLETE' | 'ASSIGNED' | 'ENROLLED';
  registrationDate: string;
  interviewDate?: string;
  assignmentDate?: string;
  score?: number;
}

interface PipelineStats {
  notEnrolled: number;
  interviewPending: number;
  interviewComplete: number;
  assigned: number;
  enrolled: number;
}

interface EnrollmentPipelineScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const EnrollmentPipelineScreen: React.FC<EnrollmentPipelineScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  // Add error handling for missing props
  if (!user || !token) {
    console.error('❌ Enrollment Pipeline: Missing required props - user:', !!user, 'token:', !!token);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Missing user or token data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fetchData = useCallback(async () => {
    // Double check token exists before API call
    if (!token) {
      console.error('❌ Enrollment Pipeline: Token is undefined, cannot make API call');
      setStudents(mockStudents);
      setStats(mockStats);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔵 Enrollment Pipeline: Starting API call to fetch pipeline data');
      console.log('🔵 Enrollment Pipeline: API URL:', `${API_BASE_URL}/vice-principal/enrollment-pipeline`);
      console.log('🔵 Enrollment Pipeline: Token:', token ? 'Token present' : 'Token missing');
      
      // Fetch pipeline overview
      const pipelineResponse = await fetch(`${API_BASE_URL}/vice-principal/enrollment-pipeline`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('🔵 Enrollment Pipeline: Response status:', pipelineResponse.status);
      console.log('🔵 Enrollment Pipeline: Response ok:', pipelineResponse.ok);
      
      if (pipelineResponse.ok) {
        const result = await pipelineResponse.json();
        console.log('🔵 Enrollment Pipeline: Response data:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('✅ Enrollment Pipeline: API call successful, using real data');
          setStudents(result.data.students);
          setStats(result.data.stats);
        } else {
          console.log('⚠️ Enrollment Pipeline: API returned success=false, using mock data');
          console.log('⚠️ Enrollment Pipeline: API error message:', result.message || 'No error message');
          setStudents(mockStudents);
          setStats(mockStats);
        }
      } else {
        console.log('❌ Enrollment Pipeline: API call failed with status:', pipelineResponse.status);
        const errorText = await pipelineResponse.text();
        console.log('❌ Enrollment Pipeline: Error response:', errorText);
        setStudents(mockStudents);
        setStats(mockStats);
      }
    } catch (error) {
      console.log('❌ Enrollment Pipeline: API Error:', error);
      console.log('❌ Enrollment Pipeline: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setStudents(mockStudents);
      setStats(mockStats);
    } finally {
      console.log('🔵 Enrollment Pipeline: API call completed, setting loading to false');
      setIsLoading(false);
    }
  }, [token]);

  const mockStats: PipelineStats = {
    notEnrolled: 3,
    interviewPending: 5,
    interviewComplete: 8,
    assigned: 12,
    enrolled: 45
  };

  const mockStudents: Student[] = [
    {
      id: 1,
      name: 'Emma Johnson',
      matricule: 'ST2024001',
      className: 'Form 1',
      status: 'NOT_ENROLLED',
      registrationDate: '2024-03-15'
    },
    {
      id: 2,
      name: 'Michael Brown',
      matricule: 'ST2024002',
      className: 'Form 2',
      status: 'INTERVIEW_PENDING',
      registrationDate: '2024-03-14'
    },
    {
      id: 3,
      name: 'Sarah Davis',
      matricule: 'ST2024003',
      className: 'Form 1',
      status: 'INTERVIEW_COMPLETE',
      registrationDate: '2024-03-13',
      interviewDate: '2024-03-18',
      score: 88
    },
    {
      id: 4,
      name: 'David Wilson',
      matricule: 'ST2024004',
      className: 'Form 2',
      status: 'ASSIGNED',
      registrationDate: '2024-03-12',
      interviewDate: '2024-03-17',
      assignmentDate: '2024-03-19',
      score: 76
    }
  ];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.matricule || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || student.status === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_ENROLLED': return '#95a5a6';
      case 'INTERVIEW_PENDING': return '#f39c12';
      case 'INTERVIEW_COMPLETE': return '#3498db';
      case 'ASSIGNED': return '#27ae60';
      case 'ENROLLED': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_ENROLLED': return '📝';
      case 'INTERVIEW_PENDING': return '⏳';
      case 'INTERVIEW_COMPLETE': return '✅';
      case 'ASSIGNED': return '📚';
      case 'ENROLLED': return '🎓';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOT_ENROLLED': return 'Not Enrolled';
      case 'INTERVIEW_PENDING': return 'Interview Pending';
      case 'INTERVIEW_COMPLETE': return 'Interview Complete';
      case 'ASSIGNED': return 'Assigned';
      case 'ENROLLED': return 'Enrolled';
      default: return 'Unknown';
    }
  };

  const stages = [
    { id: 'ALL', name: 'All Students', count: students.length },
    { id: 'NOT_ENROLLED', name: 'Not Enrolled', count: stats?.notEnrolled || 0 },
    { id: 'INTERVIEW_PENDING', name: 'Interview Pending', count: stats?.interviewPending || 0 },
    { id: 'INTERVIEW_COMPLETE', name: 'Interview Complete', count: stats?.interviewComplete || 0 },
    { id: 'ASSIGNED', name: 'Assigned', count: stats?.assigned || 0 },
    { id: 'ENROLLED', name: 'Enrolled', count: stats?.enrolled || 0 }
  ];

  const advanceStudent = async (studentId: number) => {
    if (!token) {
      console.error('❌ Advance Student: Token is undefined, cannot make API call');
      Alert.alert('Error', 'Authentication token is missing');
      return;
    }

    try {
      console.log('🔵 Advance Student: Starting API call to advance student');
      console.log('🔵 Advance Student: API URL:', `${API_BASE_URL}/vice-principal/advance-student`);
      console.log('🔵 Advance Student: Token:', token ? 'Token present' : 'Token missing');
      console.log('🔵 Advance Student: Student ID:', studentId);
      
      const response = await fetch(`${API_BASE_URL}/vice-principal/advance-student`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      console.log('🔵 Advance Student: Response status:', response.status);
      console.log('🔵 Advance Student: Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Advance Student: API call successful');
        console.log('✅ Advance Student: Response data:', JSON.stringify(result, null, 2));
        Alert.alert('Success', 'Student advanced to next stage');
        fetchData();
      } else {
        console.log('❌ Advance Student: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Advance Student: Error response:', errorText);
        Alert.alert('Error', 'Failed to advance student');
      }
    } catch (error) {
      console.log('❌ Advance Student: API Error:', error);
      console.log('❌ Advance Student: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      Alert.alert('Error', 'Failed to advance student');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e44ad" />
          <Text style={styles.loadingText}>Loading Pipeline...</Text>
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
          <Text style={styles.headerTitle}>Enrollment Pipeline</Text>
          <Text style={styles.headerSubtitle}>Track Student Progress</Text>
        </View>
      </View>

      {/* Pipeline Overview */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pipelineContainer}>
        <View style={styles.pipelineStages}>
          <View style={styles.pipelineStage}>
            <View style={[styles.stageCard, { backgroundColor: '#95a5a6' }]}>
              <Text style={styles.stageIcon}>📝</Text>
              <Text style={styles.stageNumber}>{stats?.notEnrolled || 0}</Text>
              <Text style={styles.stageLabel}>Not Enrolled</Text>
            </View>
          </View>
          <View style={styles.pipelineArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.pipelineStage}>
            <View style={[styles.stageCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.stageIcon}>⏳</Text>
              <Text style={styles.stageNumber}>{stats?.interviewPending || 0}</Text>
              <Text style={styles.stageLabel}>Interview Pending</Text>
            </View>
          </View>
          <View style={styles.pipelineArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.pipelineStage}>
            <View style={[styles.stageCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.stageIcon}>✅</Text>
              <Text style={styles.stageNumber}>{stats?.interviewComplete || 0}</Text>
              <Text style={styles.stageLabel}>Interview Complete</Text>
            </View>
          </View>
          <View style={styles.pipelineArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.pipelineStage}>
            <View style={[styles.stageCard, { backgroundColor: '#27ae60' }]}>
              <Text style={styles.stageIcon}>📚</Text>
              <Text style={styles.stageNumber}>{stats?.assigned || 0}</Text>
              <Text style={styles.stageLabel}>Assigned</Text>
            </View>
          </View>
          <View style={styles.pipelineArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.pipelineStage}>
            <View style={[styles.stageCard, { backgroundColor: '#9b59b6' }]}>
              <Text style={styles.stageIcon}>🎓</Text>
              <Text style={styles.stageNumber}>{stats?.enrolled || 0}</Text>
              <Text style={styles.stageLabel}>Enrolled</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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

      {/* Stage Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stages.map((stage) => (
            <TouchableOpacity
              key={stage.id}
              style={[
                styles.filterTab,
                selectedStage === stage.id && styles.activeFilterTab
              ]}
              onPress={() => setSelectedStage(stage.id)}
            >
              <Text style={[
                styles.filterText,
                selectedStage === stage.id && styles.activeFilterText
              ]}>
                {stage.name} ({stage.count})
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
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentDetails}>
                  {student.matricule} • {student.className}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>{getStatusIcon(student.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(student.status) }]}>
                  {getStatusText(student.status)}
                </Text>
              </View>
            </View>

            <View style={styles.studentTimeline}>
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Registered:</Text>
                <Text style={styles.timelineValue}>{student.registrationDate}</Text>
              </View>
              {student.interviewDate && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Interview:</Text>
                  <Text style={styles.timelineValue}>
                    {student.interviewDate}
                    {student.score && ` (${student.score}/100)`}
                  </Text>
                </View>
              )}
              {student.assignmentDate && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Assigned:</Text>
                  <Text style={styles.timelineValue}>{student.assignmentDate}</Text>
                </View>
              )}
            </View>

            {student.status !== 'ENROLLED' && (
              <View style={styles.studentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: getStatusColor(student.status) }]}
                  onPress={() => advanceStudent(student.id)}
                >
                  <Text style={styles.actionButtonText}>Advance to Next Stage</Text>
                </TouchableOpacity>
              </View>
            )}
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Dashboard')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('StudentInterviews', { user, token })}>
          <Text style={styles.navIcon}>🎤</Text>
          <Text style={styles.navLabel}>Interviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>📋</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Pipeline</Text>
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
  pipelineContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    marginBottom: 16,
  },
  pipelineStages: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pipelineStage: {
    alignItems: 'center',
  },
  stageCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  stageIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  stageNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stageLabel: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,
  },
  pipelineArrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#6c757d',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
    paddingHorizontal: 12,
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
    fontSize: 12,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    fontWeight: 'bold',
  },
  studentTimeline: {
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
});

export default EnrollmentPipelineScreen; 