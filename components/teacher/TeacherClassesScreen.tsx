import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { User, UserRole } from '../LoginScreen';
import { BASE_URL } from '../../constants';

const { width } = Dimensions.get('window');

// --- Interfaces ---

interface Subclass {
  id: number;
  name: string;
  className: string;
  studentCount: number;
}

interface Subject {
  id: number;
  name:string;
  subClasses?: Subclass[]; // Handle potential naming inconsistency from API
  subclasses?: Subclass[];
}

interface SelectedRole {
    role: UserRole;
    academicYearId: number | null;
    academicYearName: string | null;
}

interface SubClassWithSubjects {
  id: number;
  name: string;
  className: string;
  studentCount: number;
  subjects: {
    id: number;
    name: string;
  }[];
}

interface TeacherClassesScreenProps {
  user: User;
  token: string;
  selectedRole: SelectedRole;
  navigation: any;
  route?: any; // Make route optional
}

const TeacherClassesScreen: React.FC<TeacherClassesScreenProps> = ({
  user,
  token,
  selectedRole: directSelectedRole,
  navigation,
  route,
}) => {
  // Consolidate selectedRole from either direct props or route.params
  const selectedRole = directSelectedRole || route?.params?.selectedRole;

  const [subClasses, setSubClasses] = useState<SubClassWithSubjects[]>([]);
  const [expandedSubClassId, setExpandedSubClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalSubjects, setOriginalSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!selectedRole) {
          throw new Error("Could not determine user role and academic year.");
        }

        const academicYearId = selectedRole.academicYearId;
        const queryParams = new URLSearchParams();
        if (academicYearId) {
          queryParams.append('academicYearId', academicYearId.toString());
        }

        const response = await fetch(`${BASE_URL}/api/v1/teachers/me/subjects?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch classes: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data from endpoint /api/v1/teachers/me/subjects:', JSON.stringify(data, null, 2));
        
        if (data.success && Array.isArray(data.data)) {
          const subjectsData: Subject[] = data.data;
          setOriginalSubjects(subjectsData);
          
          const subClassesMap = new Map<number, SubClassWithSubjects>();

          subjectsData.forEach(subject => {
            const subClassList = subject.subClasses || subject.subclasses || [];
            subClassList.forEach(subclass => {
              if (!subClassesMap.has(subclass.id)) {
                subClassesMap.set(subclass.id, {
                  id: subclass.id,
                  name: subclass.name,
                  className: subclass.className,
                  studentCount: subclass.studentCount,
                  subjects: []
                });
              }
              subClassesMap.get(subclass.id)!.subjects.push({
                id: subject.id,
                name: subject.name
              });
            });
          });

          const transformedSubClasses = Array.from(subClassesMap.values());
          setSubClasses(transformedSubClasses);

        } else {
          throw new Error(data.error || 'Invalid data structure received.');
        }
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [token, selectedRole]);

  const renderSubjectItem = (subject: { id: number; name: string; }, subClassInfo: SubClassWithSubjects) => {
    const fullSubject = originalSubjects.find(s => s.id === subject.id);

    return (
        <View key={subject.id} style={styles.subjectItem}>
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectItemIcon}>📘</Text>
                <Text style={styles.subjectName}>{subject.name}</Text>
            </View>
        <View style={styles.actionButtons}>
            <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
                navigation.navigate('TeacherStudents', { subclass: subClassInfo, subject: fullSubject, token, user, selectedRole });
            }}
            >
            <Text style={styles.secondaryButtonText}>Students</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('TeacherMarks', { subclassId: subClassInfo.id, subjectId: subject.id, token, user, selectedRole })}
            >
            <Text style={styles.primaryButtonText}>Marks</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
  };

  const renderSubClassCard = (subClassInfo: SubClassWithSubjects) => {
    const isExpanded = expandedSubClassId === subClassInfo.id;

    return (
      <View key={subClassInfo.id} style={styles.classCard}>
        <TouchableOpacity 
          style={styles.cardHeader}
          activeOpacity={0.8}
          onPress={() => setExpandedSubClassId(isExpanded ? null : subClassInfo.id)}
        >
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🏫</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.className}>{subClassInfo.className} - {subClassInfo.name}</Text>
            <Text style={styles.subjectCount}>{subClassInfo.subjects.length} Subjects • {subClassInfo.studentCount} Students</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subjectsContainer}>
            {subClassInfo.subjects.map(subject => renderSubjectItem(subject, subClassInfo))}
          </View>
        )}
      </View>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading Classes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Subclasses</Text>
          <Text style={styles.headerSubtitle}>Select a subclass to see your subjects</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {subClasses.length > 0 ? (
          <View style={styles.classListSection}>
            {subClasses.map(subClassInfo => renderSubClassCard(subClassInfo))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>You have not been assigned to any classes.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#667eea',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  classListSection: {
    padding: 20,
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
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subjectCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  expandIcon: {
      fontSize: 20,
      color: '#94a3b8',
  },
  subjectsContainer: {
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  subjectItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectItemIcon: {
      fontSize: 16,
      marginRight: 8,
  },
  subjectName: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeacherClassesScreen; 