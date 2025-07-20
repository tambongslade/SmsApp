import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';

// --- Interfaces ---

interface Student {
  id: number;
  name: string;
  matricule: string;
  photo?: string;
  // Simplified for this screen, more details on a dedicated student profile screen
  averageScore?: number; 
  attendanceRate?: number;
}

interface Subclass {
  id: number;
  name: string;
  className: string;
}

interface Subject {
  id: number;
  name: string;
}

interface TeacherStudentsScreenProps {
  route: any;
  navigation: any;
}

const TeacherStudentsScreen: React.FC<TeacherStudentsScreenProps> = ({
  route,
  navigation,
}) => {
  const { subclass, subject, token, user, selectedRole } = route.params as { subclass: Subclass, subject: Subject, token: string, user: User, selectedRole: any };
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        subClassId: subclass.id.toString(),
        subjectId: subject.id.toString(),
      });

      const url = `https://sms.sniperbuisnesscenter.com/api/v1/teachers/me/students?${queryParams.toString()}`;
      console.log('Fetching students from:', url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setStudents(data.data);
          setFilteredStudents(data.data);
          console.log('✅ Successfully fetched students');
        } else {
          console.error('Failed to parse students from response:', data);
          setStudents(mockStudents);
          setFilteredStudents(mockStudents);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch students, using mock data. Status:', response.status, 'Error:', errorText);
        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
      }
    } catch (error) {
      console.error('An error occurred while fetching students:', error);
      Alert.alert('Error', 'Could not fetch students. Please try again later.');
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [subclass.id, subject.id, token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };
  
  const renderSkeletonLoader = () => (
    [...Array(5)].map((_, i) => (
      <View key={i} style={styles.skeletonCard} />
    ))
  );

  const renderStudentCard = (student: Student) => (
    <TouchableOpacity 
      key={student.id} 
      style={styles.studentCard}
      activeOpacity={0.8}
      // onPress={() => onNavigate('StudentProfile', { studentId: student.id, token })}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: student.photo || `https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}&background=random` }} 
          style={styles.avatar} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMatricule}>{student.matricule}</Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{student.averageScore?.toFixed(1) || '-'}/20</Text>
          <Text style={styles.statLabel}>Avg. Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{student.attendanceRate || '-'}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{subclass.className} - {subclass.name}</Text>
          <Text style={styles.headerSubtitle}>{subject.name} Students</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or matricule..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
      >
        {loading ? (
          renderSkeletonLoader()
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map(renderStudentCard)
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No students found.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data as Fallback ---
const mockStudents: Student[] = [
  { id: 1, name: 'John Doe', matricule: 'S001', photo: 'https://via.placeholder.com/80', averageScore: 15.5, attendanceRate: 92 },
  { id: 2, name: 'Mary Smith', matricule: 'S002', photo: 'https://via.placeholder.com/80', averageScore: 18.2, attendanceRate: 98 },
  { id: 3, name: 'Peter Jones', matricule: 'S003', photo: 'https://via.placeholder.com/80', averageScore: 12.0, attendanceRate: 85 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#667eea',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 2,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#667eea',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skeletonCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    height: 120,
    marginBottom: 16,
  },
  studentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentMatricule: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default TeacherStudentsScreen; 