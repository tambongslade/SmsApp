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

interface SubClass {
  id: number;
  name: string;
  className: string;
  studentCount: number;
}

interface TeacherAttendanceScreenProps {
  route: any;
  navigation: any;
}

const TeacherAttendanceScreen: React.FC<TeacherAttendanceScreenProps> = ({
  route,
  navigation,
}) => {
  const { token, user, selectedRole } = route.params as { token: string, user: User, selectedRole: any };
  const [subClasses, setSubClasses] = useState<SubClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubClasses = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        academicYearId: selectedRole.academicYearId.toString(),
      });
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/teachers/me/subclasses?${queryParams.toString()}`;
      console.log('Fetching subclasses from:', url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSubClasses(data.data);
          console.log('✅ Successfully fetched subclasses');
        } else {
          setSubClasses(mockSubClasses);
        }
      } else {
        setSubClasses(mockSubClasses);
      }
    } catch (error) {
      console.error('Failed to fetch subclasses:', error);
      Alert.alert('Error', 'Could not fetch classes.');
      setSubClasses(mockSubClasses);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedRole]);

  useEffect(() => {
    fetchSubClasses();
  }, [fetchSubClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubClasses();
  };

  const renderSkeletonLoader = () => (
    [...Array(4)].map((_, i) => <View key={i} style={styles.skeletonCard} />)
  );

  const renderClassCard = (subClass: SubClass) => (
    <TouchableOpacity 
      key={subClass.id} 
      style={styles.classCard}
      activeOpacity={0.8}
      onPress={() => onNavigate('TakeAttendance', { subClass, token })}
    >
      <View style={styles.cardIcon}>
        <Text>🏫</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.className}>{subClass.className} - {subClass.name}</Text>
        <Text style={styles.studentCount}>{subClass.studentCount} students</Text>
      </View>
      <View style={styles.cardAction}>
        <Text style={styles.actionText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Take Attendance</Text>
        <Text style={styles.headerSubtitle}>Select a class to begin</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
      >
        {loading ? (
          renderSkeletonLoader()
        ) : subClasses.length > 0 ? (
          subClasses.map(renderClassCard)
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No classes assigned to you.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Mock Data ---
const mockSubClasses: SubClass[] = [
    { id: 1, name: 'A', className: 'Form 5', studentCount: 30 },
    { id: 2, name: 'B', className: 'Form 5', studentCount: 28 },
    { id: 3, name: 'Science', className: 'Form 6', studentCount: 25 },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 4,
  },
  scrollView: { flex: 1, padding: 20 },
  skeletonCard: {
    height: 80,
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    marginBottom: 16,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  cardAction: {
    paddingLeft: 10,
  },
  actionText: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '300',
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

export default TeacherAttendanceScreen; 