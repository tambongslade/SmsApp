import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useGuidanceCounselor } from '../GuidanceCounselorContext';

interface GuidanceCounselorStudentsScreenProps {
  user: any;
  token: string;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const GuidanceCounselorStudentsScreen: React.FC<GuidanceCounselorStudentsScreenProps> = ({
  user,
  token,
  onNavigateBack,
  onNavigate,
}) => {
  const {
    students,
    isLoading,
    error,
    fetchStudents,
    fetchStudentDetails,
  } = useGuidanceCounselor();

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ACADEMIC' | 'DISCIPLINE' | 'BOTH'>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Get academic year from user or default
  const academicYearId = user?.selectedRole?.academicYearId || 1;

  useEffect(() => {
    // Load students when component mounts
    loadStudents();
  }, [token, academicYearId]);

  const loadStudents = async () => {
    try {
      await fetchStudents(token, academicYearId);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const getStudentsNeedingAttention = () => {
    return students.filter(student => {
      const hasAcademicConcerns = student.academicInfo?.teacherConcerns > 0 || 
                                  student.academicInfo?.recentDecline < -2;
      const hasDisciplineConcerns = student.disciplineHistory?.totalIssues > 0;
      
      switch (filterType) {
        case 'ACADEMIC':
          return hasAcademicConcerns;
        case 'DISCIPLINE':
          return hasDisciplineConcerns;
        case 'BOTH':
          return hasAcademicConcerns && hasDisciplineConcerns;
        default:
          return hasAcademicConcerns || hasDisciplineConcerns;
      }
    });
  };

  const getConcernLevel = (student: any) => {
    const academicConcerns = student.academicInfo?.teacherConcerns || 0;
    const disciplineIssues = student.disciplineHistory?.totalIssues || 0;
    const attendanceRate = student.academicInfo?.attendanceRate || 100;
    
    if (disciplineIssues >= 3 || attendanceRate < 70 || academicConcerns >= 3) {
      return 'HIGH';
    } else if (disciplineIssues >= 1 || attendanceRate < 85 || academicConcerns >= 1) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  const getConcernColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const handleStudentPress = async (student: any) => {
    try {
      const detailedStudent = await fetchStudentDetails(token, student.id);
      setSelectedStudent(detailedStudent || student);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setSelectedStudent(student);
      setShowDetailsModal(true);
    }
  };

  const filteredStudents = getStudentsNeedingAttention();
  const allStudentsCount = students.length;
  const concernsCount = filteredStudents.length;

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Students Needing Attention</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>API Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStudents}>
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
        <Text style={styles.title}>Students Needing Attention</Text>
      </View>

      {/* API Limitation Notice */}
      <View style={styles.apiNotice}>
        <Text style={styles.apiNoticeText}>
          📊 Using general student API - Limited counseling-specific data available
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{allStudentsCount}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
            {concernsCount}
          </Text>
          <Text style={styles.statLabel}>Need Attention</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>
            {filteredStudents.filter(s => getConcernLevel(s) === 'HIGH').length}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'ACADEMIC', 'DISCIPLINE', 'BOTH'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterType === filter && styles.activeFilterChip,
              ]}
              onPress={() => setFilterType(filter as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === filter && styles.activeFilterChipText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Students List */}
      <ScrollView
        style={styles.studentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👨‍🎓</Text>
            <Text style={styles.emptyStateTitle}>No Students Found</Text>
            <Text style={styles.emptyStateText}>
              {concernsCount === 0 
                ? 'No students currently need counseling attention'
                : 'No students match the current filter criteria'
              }
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const concernLevel = getConcernLevel(student);
            const concernColor = getConcernColor(concernLevel);
            
            return (
              <TouchableOpacity
                key={student.id}
                style={[styles.studentCard, { borderLeftColor: concernColor }]}
                onPress={() => handleStudentPress(student)}
              >
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentClass}>
                      {student.class} • {student.matricule}
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: concernColor }]}>
                    <Text style={styles.priorityText}>{concernLevel}</Text>
                  </View>
                </View>

                <View style={styles.concernsContainer}>
                  {student.academicInfo?.teacherConcerns > 0 && (
                    <View style={styles.concernItem}>
                      <Text style={styles.concernIcon}>📚</Text>
                      <Text style={styles.concernText}>
                        {student.academicInfo.teacherConcerns} teacher concerns
                      </Text>
                    </View>
                  )}
                  
                  {student.disciplineHistory?.totalIssues > 0 && (
                    <View style={styles.concernItem}>
                      <Text style={styles.concernIcon}>⚠️</Text>
                      <Text style={styles.concernText}>
                        {student.disciplineHistory.totalIssues} discipline issues
                      </Text>
                    </View>
                  )}
                  
                  {student.academicInfo?.attendanceRate < 85 && (
                    <View style={styles.concernItem}>
                      <Text style={styles.concernIcon}>📅</Text>
                      <Text style={styles.concernText}>
                        {student.academicInfo.attendanceRate}% attendance
                      </Text>
                    </View>
                  )}
                  
                  {student.academicInfo?.recentDecline < -2 && (
                    <View style={styles.concernItem}>
                      <Text style={styles.concernIcon}>📉</Text>
                      <Text style={styles.concernText}>
                        Academic decline: {student.academicInfo.recentDecline} pts
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.studentActions}>
                  <Text style={styles.viewDetailsText}>Tap to view details →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Student Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <Text style={styles.modalTitle}>{selectedStudent.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedStudent.class} • {selectedStudent.matricule}
                </Text>
                
                {selectedStudent.parentContact && (
                  <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Parent Contact</Text>
                    <Text style={styles.contactText}>
                      {selectedStudent.parentContact.name}
                    </Text>
                    <Text style={styles.contactText}>
                      {selectedStudent.parentContact.phone}
                    </Text>
                    {selectedStudent.parentContact.email && (
                      <Text style={styles.contactText}>
                        {selectedStudent.parentContact.email}
                      </Text>
                    )}
                  </View>
                )}

                {selectedStudent.academicInfo && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Academic Information</Text>
                    <Text style={styles.detailText}>
                      Current Average: {selectedStudent.academicInfo.currentAverage}/20
                    </Text>
                    <Text style={styles.detailText}>
                      Attendance Rate: {selectedStudent.academicInfo.attendanceRate}%
                    </Text>
                    {selectedStudent.academicInfo.recentDecline && (
                      <Text style={styles.detailText}>
                        Recent Change: {selectedStudent.academicInfo.recentDecline} points
                      </Text>
                    )}
                  </View>
                )}

                {selectedStudent.disciplineHistory && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Discipline History</Text>
                    <Text style={styles.detailText}>
                      Total Issues: {selectedStudent.disciplineHistory.totalIssues}
                    </Text>
                    {selectedStudent.disciplineHistory.recentIssues?.slice(0, 2).map((issue: any, index: number) => (
                      <View key={index} style={styles.issueItem}>
                        <Text style={styles.issueDate}>{issue.date}</Text>
                        <Text style={styles.issueDescription}>{issue.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Contact Parent', 'Open communication with parent...')}
                  >
                    <Text style={styles.actionButtonText}>📞 Contact Parent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Schedule Session', 'Schedule counseling session...')}
                  >
                    <Text style={styles.actionButtonText}>📅 Schedule Session</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDetailsModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#9b59b6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#34495e',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  studentCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  concernsContainer: {
    marginBottom: 12,
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  concernIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  concernText: {
    fontSize: 12,
    color: '#e74c3c',
    flex: 1,
  },
  studentActions: {
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#9b59b6',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  contactSection: {
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  issueItem: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  issueDate: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  issueDescription: {
    fontSize: 12,
    color: '#34495e',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
});

export default GuidanceCounselorStudentsScreen; 