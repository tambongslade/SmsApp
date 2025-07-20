import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';

import { API_BASE_URL } from '../../constants';
// import MessagingFAB from './MessagingFAB';

interface RecordLatenessScreenProps {
  token: string;
  user: any;
  onNavigateBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

interface Student {
  id: number;
  name: string;
  class: string;
}

interface LateStudent extends Student {
  arrivalTime: string;
}

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: 'John Doe', class: 'Grade 10A' },
  { id: 2, name: 'Jane Smith', class: 'Grade 11B' },
  { id: 3, name: 'Peter Jones', class: 'Grade 9C' },
  { id: 4, name: 'Mary Johnson', class: 'Grade 12A' },
  { id: 5, name: 'David Brown', class: 'Grade 10B' },
];

const RecordLatenessScreen: React.FC<RecordLatenessScreenProps> = ({
  token,
  user,
  onNavigateBack,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [lateStudents, setLateStudents] = useState<LateStudent[]>([]);
  const [notifyParents, setNotifyParents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 [RecordLateness] Searching for students with query:', query);
      
      const response = await fetch(`${API_BASE_URL}/students/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 [RecordLateness] Search response status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('📝 [RecordLateness] Student search API response:', JSON.stringify(apiData, null, 2));
        
        // Handle different possible response formats
        let students = [];
        if (apiData.success && apiData.data && apiData.data.data) {
          // Nested structure: { success: true, data: { data: [...], meta: {...} } }
          students = apiData.data.data;
        } else if (apiData.success && apiData.data) {
          // Direct structure: { success: true, data: [...] }
          students = Array.isArray(apiData.data) ? apiData.data : [];
        } else if (apiData.data && Array.isArray(apiData.data)) {
          // Simple structure: { data: [...] }
          students = apiData.data;
        } else if (Array.isArray(apiData)) {
          // Direct array: [...]
          students = apiData;
        } else {
          console.log('⚠️ [RecordLateness] Unexpected response format:', apiData);
          students = [];
        }

        const formattedResults = Array.isArray(students) ? students.map((student: any) => {
          // Extract class information from nested enrollment structure
          let className = 'N/A';
          if (student.enrollments && student.enrollments.length > 0) {
            const enrollment = student.enrollments[0];
            if (enrollment.subClass) {
              className = enrollment.subClass.name;
              if (enrollment.subClass.class) {
                className = `${enrollment.subClass.class.name} (${enrollment.subClass.name})`;
              }
            }
          }
          
          return {
            id: student.id || student.studentId,
            name: student.name || student.studentName || student.fullName,
            class: className,
          };
        }) : [];
        
        console.log('✅ [RecordLateness] Formatted search results:', formattedResults);
        setSearchResults(formattedResults);
      } else {
        const errorText = await response.text();
        console.error('❌ [RecordLateness] Search failed with status:', response.status, 'Error:', errorText);
        setSearchResults([]);
        
        // Show error to user if it's a 404 or other specific error
        if (response.status === 404) {
          Alert.alert('Search Error', 'Student search endpoint not found. Please contact support.');
        } else if (response.status === 401) {
          Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
        }
      }
    } catch (error) {
      console.error('❌ [RecordLateness] Failed to search students:', error);
      setSearchResults([]);
      Alert.alert('Search Error', 'Unable to search for students. Please check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const handleAddStudent = (student: Student) => {
    if (lateStudents.some(s => s.id === student.id)) {
      Alert.alert('Student Already Added', `${student.name} is already in the late list.`);
      return;
    }
    const now = new Date();
    const arrivalTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setLateStudents(prev => [...prev, { ...student, arrivalTime }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveStudent = (studentId: number) => {
    setLateStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleTimeChange = (studentId: number, time: string) => {
    setLateStudents(prev => 
      prev.map(s => s.id === studentId ? { ...s, arrivalTime: time } : s)
    );
  };

  const handleSubmit = async () => {
    if (lateStudents.length === 0) {
      Alert.alert('No Students Added', 'Please add at least one student to the list.');
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      records: lateStudents.map(s => ({
        studentId: s.id,
        arrivalTime: s.arrivalTime,
        reason: 'Morning Lateness',
        date: new Date().toISOString().split('T')[0], // Add current date
      })),
      notifyParents,
    };

    try {
      console.log('📤 [RecordLateness] Submitting lateness report:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/discipline/lateness/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📊 [RecordLateness] Submission response status:', response.status);

      const responseData = await response.json();
      console.log('📝 [RecordLateness] Lateness submission API response:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit report');
      }
      
      Alert.alert('Report Submitted', 'Lateness report has been successfully submitted.');
      setLateStudents([]);

    } catch (error) {
      console.error('❌ [RecordLateness] Failed to submit lateness report:', error);
      Alert.alert('Submission Failed', 'Could not submit the report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }: { item: LateStudent }) => (
    <View style={styles.lateStudentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentClass}>{item.class}</Text>
      </View>
      <TextInput
        style={styles.timeInput}
        value={item.arrivalTime}
        onChangeText={(time) => handleTimeChange(item.id, time)}
        placeholder="HH:mm"
      />
      <TouchableOpacity onPress={() => handleRemoveStudent(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#c0392b" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Morning Lateness</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search for a Student</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Start typing student name (min 3 chars)..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isSearching ? (
            <ActivityIndicator style={{ marginTop: 10 }} />
          ) : searchResults.length > 0 ? (
            <FlatList
              style={styles.searchResultsContainer}
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddStudent(item)}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultClass}>{item.class}</Text>
                </TouchableOpacity>
              )}
            />
          ) : searchQuery.length > 2 ? (
            <Text style={styles.emptyListText}>No students found for "{searchQuery}"</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Late Students List</Text>
          {lateStudents.length === 0 ? (
            <Text style={styles.emptyListText}>No students added yet. Use the search bar to add students.</Text>
          ) : (
            <FlatList
              data={lateStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStudentItem}
            />
          )}
        </View>
        
        <View style={styles.optionsSection}>
          <Text style={styles.optionsLabel}>Notify Parents via SMS</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#27ae60' }}
            thumbColor={notifyParents ? '#f4f3f4' : '#f4f3f4'}
            onValueChange={setNotifyParents}
            value={notifyParents}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Save Report & Notify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Messaging FAB
      <MessagingFAB
        token={token}
        user={user}
        onNavigate={onNavigate}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#c0392b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 16 },
  backIcon: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    fontSize: 16,
  },
  searchResultsContainer: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginTop: 4,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchResultName: { fontSize: 16, color: '#2c3e50' },
  searchResultClass: { fontSize: 12, color: '#6c757d' },
  searchResultEmpty: {
    textAlign: 'center',
    color: '#6c757d',
    paddingVertical: 20,
  },
  lateStudentCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '500', color: '#2c3e50' },
  studentClass: { fontSize: 12, color: '#6c757d' },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6c757d',
    paddingVertical: 20,
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  optionsLabel: { fontSize: 16, color: '#2c3e50' },
  submitButton: {
    backgroundColor: '#c0392b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e74c3c',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: { height: 80 },
});

export default RecordLatenessScreen; 