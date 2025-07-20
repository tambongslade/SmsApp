import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';
import { BASE_URL } from '../../constants';


const { width } = Dimensions.get('window');

// --- Interfaces based on API Documentation ---

interface Subclass {
  id: number;
  name: string;
  className: string;
  studentCount: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  category: string;
  coefficient: number;
  subclasses: Subclass[];
}

interface SelectedRole {
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
}

interface TeacherSubjectsScreenProps {
  user: User;
  selectedRole: SelectedRole;
  token: string;
  navigation: any;
}

const TeacherSubjectsScreen: React.FC<TeacherSubjectsScreenProps> = ({
  user,
  selectedRole,
  token,
  navigation,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedRole?.academicYearId) {
        queryParams.append('academicYearId', selectedRole.academicYearId.toString());
      }
      
      const url = `${BASE_URL}/api/v1/teachers/me/subjects?${queryParams.toString()}`;
      console.log('Fetching subjects from:', url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const sanitizedSubjects = data.data.map((subject: Subject) => ({
            ...subject,
            subclasses: subject.subclasses || [],
          }));
          setSubjects(sanitizedSubjects);
          console.log('✅ Successfully fetched teacher subjects');
        } else {
          console.error('Failed to parse subjects from response:', data);
          setSubjects(mockSubjects); // Fallback to mock
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch subjects, using mock data. Status:', response.status, 'Error:', errorText);
        setSubjects(mockSubjects); // Fallback to mock
      }
    } catch (error) {
      console.error('An error occurred while fetching subjects:', error);
      Alert.alert('Error', 'Could not fetch subjects. Please try again later.');
      setSubjects(mockSubjects); // Fallback to mock
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedRole]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };
  
  const getTotalStudents = (subclasses: Subclass[]) => {
    return subclasses.reduce((sum, s) => sum + s.studentCount, 0);
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  const renderSubjectCard = (subject: Subject) => (
    <TouchableOpacity 
      key={subject.id} 
      style={styles.subjectCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('TeacherClasses', { subject, token, user, selectedRole })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subjectCode}>{subject.code} • {subject.category}</Text>
        </View>
        <View style={styles.coefficientBadge}>
          <Text style={styles.coefficientText}>x{subject.coefficient}</Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subject.subclasses.length}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getTotalStudents(subject.subclasses)}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Avg. Score</Text>
        </View>
      </View>

      <View style={styles.subclassesContainer}>
        <Text style={styles.subclassesTitle}>Classes Taught:</Text>
        <View style={styles.subclassChips}>
          {subject.subclasses.slice(0, 3).map((subclass) => (
            <View key={subclass.id} style={styles.subclassChip}>
              <Text style={styles.subclassChipText}>{subclass.className} - {subclass.name}</Text>
            </View>
          ))}
          {subject.subclasses.length > 3 && (
            <View style={styles.subclassChipMore}>
              <Text style={styles.subclassChipMoreText}>+{subject.subclasses.length - 3} more</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.viewDetailsButton}
        onPress={() => navigation.navigate('TeacherClasses', { subject, token, user, selectedRole })}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Subjects</Text>
        <Text style={styles.headerSubtitle}>
          {selectedRole.academicYearName || 'Current Academic Year'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
      >
        {loading ? (
          renderSkeletonLoader()
        ) : (
          subjects.map(renderSubjectCard)
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data as Fallback ---
const mockSubjects: Subject[] = [
  // ... (existing mock data can be placed here if needed for offline/dev)
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
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
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  skeletonContainer: {
    paddingTop: 20,
  },
  skeletonCard: {
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    height: 200,
    marginBottom: 16,
  },
  subjectCard: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 14,
    color: '#64748b',
  },
  coefficientBadge: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coefficientText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  subclassesContainer: {
    marginBottom: 20,
  },
  subclassesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  subclassChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subclassChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subclassChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  subclassChipMore: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subclassChipMoreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  viewDetailsButton: {
    backgroundColor: '#667eea15',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeacherSubjectsScreen; 