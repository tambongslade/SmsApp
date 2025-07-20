import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { User } from '../LoginScreen';
import { API_BASE_URL } from '../../constants';

// --- Interfaces (Simplified for Mobile View) ---
interface Student {
  id: number;
  name: string;
  class: string;
  avatar: string;
  status?: 'ENROLLED' | 'ASSIGNED_TO_CLASS' | 'NOT_ENROLLED' | 'SUSPENDED' | 'TRANSFERRED' | 'GRADUATED';
}

interface StudentMetrics {
  total: number;
  attendance: number;
  disciplineCases: number;
}

// --- Props ---
interface StudentAffairsProps {
  user: User;
  token: string;
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
  academicYearId?: number | null;
}

// --- Main Component ---
const StudentAffairsScreen: React.FC<StudentAffairsProps> = ({ onBack, onNavigate, token, academicYearId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    if (!token || !academicYearId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const metricsPromise = fetch(`${API_BASE_URL}/principal/dashboard?academicYearId=${academicYearId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const studentsPromise = fetch(`${API_BASE_URL}/students?academicYearId=${academicYearId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const [metricsRes, studentsRes] = await Promise.all([metricsPromise, studentsPromise]);
      const metricsData = await metricsRes.json();
      const studentsData = await studentsRes.json();

      console.log('Principal Dashboard API Response (for Metrics):', metricsData);
      console.log('Students API Response:', studentsData);

      if (metricsData.success && metricsData.data) {
        const { schoolAnalytics } = metricsData.data;
        setMetrics({
          total: schoolAnalytics.totalStudents,
          attendance: schoolAnalytics.averageAttendanceRate,
          disciplineCases: schoolAnalytics.disciplineIssuesThisMonth,
        });
      }

      if (studentsData.success && studentsData.data) {
        const transformedStudents = studentsData.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          class: s.enrollments?.[0]?.subClass?.name || 'N/A',
          avatar: s.photo || `https://i.pravatar.cc/150?u=${s.id}`,
          status: s.status,
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error("Failed to fetch student affairs data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, academicYearId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text>Loading Student Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <KeyMetricsCard metrics={metrics} />
        <QuickActions onNavigate={onNavigate} />
        <StudentListCard students={filteredStudents} onSearch={setSearchQuery} onNavigate={onNavigate} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-components ---

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Student Affairs</Text>
    <View style={{ width: 40 }} />
  </View>
);

const KeyMetricsCard: React.FC<{ metrics: StudentMetrics | null }> = ({ metrics }) => (
  <View style={styles.card}>
    <MetricBox value={metrics?.total} label="Total Students" icon="👥" />
    <MetricBox value={`${metrics?.attendance}%`} label="Attendance" icon="✅" />
    <MetricBox value={metrics?.disciplineCases} label="Discipline Cases" icon="⚠️" />
  </View>
);

const MetricBox: React.FC<{ value?: number | string; label: string; icon: string }> = ({ value = '-', label, icon }) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </View>
);

const QuickActions: React.FC<{ onNavigate: (screen: string) => void }> = ({ onNavigate }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Quick Actions</Text>
    <View style={styles.actionsGrid}>
      <ActionButton icon="📜" label="Enrollment" onPress={() => onNavigate('EnrollmentScreen')} />
      <ActionButton icon="🎓" label="Academics" onPress={() => onNavigate('AcademicAnalytics')} />
      <ActionButton icon="⚖️" label="Discipline" onPress={() => onNavigate('DisciplineManagement')} />
    </View>
  </View>
);

const ActionButton: React.FC<{ icon: string; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const StudentListCard: React.FC<{
  students: Student[];
  onSearch: (query: string) => void;
  onNavigate: (screen: string, params?: any) => void;
}> = ({ students, onSearch, onNavigate }) => (
  <View style={[styles.card, { flex: 1 }]}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search students..."
      onChangeText={onSearch}
    />
    {students.length > 0 ? (
      students.map(student => (
        <StudentListItem key={student.id} student={student} onNavigate={onNavigate} />
      ))
    ) : (
      <Text style={styles.noStudentsText}>No students found for the selected academic year.</Text>
    )}
  </View>
);

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ENROLLED':
    case 'ASSIGNED_TO_CLASS':
      return { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' }; // Green
    case 'NOT_ENROLLED':
      return { backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffeeba' }; // Yellow
    case 'SUSPENDED':
    case 'TRANSFERRED':
    case 'GRADUATED':
      return { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' }; // Red
    default:
      return { backgroundColor: '#e2e3e5', color: '#383d41', borderColor: '#d6d8db' }; // Gray
  }
};

const StudentListItem: React.FC<{ student: Student; onNavigate: (screen: string, params?: any) => void }> = ({ student, onNavigate }) => {
  const displayStatus = student.status || 'UNKNOWN';
  const statusStyle = getStatusStyle(displayStatus);
  
  return (
    <TouchableOpacity style={styles.studentItem} onPress={() => onNavigate('StudentDetails', { studentId: student.id })}>
      <Image source={{ uri: student.avatar }} style={styles.avatar} />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentClass}>{student.class}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {displayStatus.replace(/_/g, ' ')}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollViewContent: { padding: 16 },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: '#0056b3' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },

  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  searchInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  noStudentsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#666',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
});

export default StudentAffairsScreen; 