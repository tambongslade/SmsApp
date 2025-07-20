import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';
import { Picker } from '@react-native-picker/picker';

interface User {
  id: number;
  name: string;
  matricule: string;
}

interface Subclass {
  id: number;
  name: string;
  studentCount: number;
  classMaster?: {
    id: number;
    name: string;
    matricule: string;
    email: string;
  };
}

interface Class {
  id: number;
  name: string;
  level: number;
  studentCount: number;
  academicYearId: number;
  subClasses: Subclass[];
}

interface ModalState {
  type: 'CREATE_CLASS' | 'ADD_SUBCLASS' | 'ASSIGN_MASTER' | null;
  data: Class | Subclass | null;
}

const VPClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null, data: null });
  const [newClassName, setNewClassName] = useState('');
  const [newSubclassName, setNewSubclassName] = useState('');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) {
      return classes;
    }
    return classes.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/classes?` + new URLSearchParams({
        legacy: 'true',
        page: '1',
        limit: '100', // Increased limit
        sortBy: 'name',
        sortOrder: 'asc',
      }), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load classes');
      }

      const data = await response.json();
      console.log('API Response - loadClasses:', JSON.stringify(data, null, 2));
      setClasses(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users?role=TEACHER&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load teachers');
      const data = await response.json();
      console.log('API Response - loadTeachers:', JSON.stringify(data, null, 2));
      setTeachers(data.data || []);
    } catch (e) {
      console.error("Failed to load teachers", e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    await loadTeachers();
    setRefreshing(false);
  };

  const handleClassExpand = (classId: number) => {
    setExpandedClasses(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Validation Error', 'Class name cannot be empty.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      const responseData = await response.json();
      console.log('API Response - handleCreateClass:', JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        const err = responseData;
        throw new Error(err.error || 'Failed to create class');
      }
      setNewClassName('');
      setModalState({ type: null, data: null });
      await loadClasses();
      Alert.alert('Success', 'Class created successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const handleAddSubclass = async () => {
    const classData = modalState.data as Class;
    if (!newSubclassName.trim() || !classData) {
      Alert.alert('Validation Error', 'Subclass name cannot be empty.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/classes/${classData.id}/sub-classes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubclassName }),
      });
      const responseData = await response.json();
      console.log('API Response - handleAddSubclass:', JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        const err = responseData;
        throw new Error(err.error || 'Failed to add subclass');
      }
      setNewSubclassName('');
      setModalState({ type: null, data: null });
      await loadClasses();
      Alert.alert('Success', 'Subclass added successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const handleAssignClassMaster = async () => {
    const subclassData = modalState.data as Subclass;
    if (!selectedTeacherId || !subclassData) {
      Alert.alert('Validation Error', 'Please select a teacher.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/classes/sub-classes/${subclassData.id}/class-master`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedTeacherId }),
      });
      const responseData = await response.json();
      console.log('API Response - handleAssignClassMaster:', JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        const err = responseData;
        throw new Error(err.error || 'Failed to assign class master');
      }
      setSelectedTeacherId(null);
      setModalState({ type: null, data: null });
      await loadClasses();
      Alert.alert('Success', 'Class master assigned successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const openModal = (type: ModalState['type'], data: ModalState['data']) => {
    setModalState({ type, data });
  };

  const renderModal = () => {
    if (!modalState.type) return null;

    const renderContent = () => {
      switch (modalState.type) {
        case 'CREATE_CLASS':
          return (
            <>
              <Text style={styles.modalTitle}>Create New Class</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Class Name (e.g., Form 1)"
                value={newClassName}
                onChangeText={setNewClassName}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateClass}>
                <Text style={styles.modalButtonText}>Create Class</Text>
              </TouchableOpacity>
            </>
          );
        case 'ADD_SUBCLASS':
          const classData = modalState.data as Class;
          return (
            <>
              <Text style={styles.modalTitle}>Add Subclass to {classData.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Subclass Name (e.g., A, B, C)"
                value={newSubclassName}
                onChangeText={setNewSubclassName}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleAddSubclass}>
                <Text style={styles.modalButtonText}>Add Subclass</Text>
              </TouchableOpacity>
            </>
          );
        case 'ASSIGN_MASTER':
          const subclassData = modalState.data as Subclass;
          return (
            <>
              <Text style={styles.modalTitle}>Assign Master to {subclassData.name}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTeacherId}
                  onValueChange={(itemValue) => setSelectedTeacherId(itemValue)}
                >
                  <Picker.Item label="Select a Teacher..." value={null} />
                  {teachers.map(teacher => (
                    <Picker.Item key={teacher.id} label={`${teacher.name} (${teacher.matricule})`} value={teacher.id} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.modalButton} onPress={handleAssignClassMaster} disabled={!selectedTeacherId}>
                <Text style={styles.modalButtonText}>Assign Master</Text>
              </TouchableOpacity>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalState.type !== null}
        onRequestClose={() => setModalState({ type: null, data: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {renderContent()}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalState({ type: null, data: null })}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const getCapacityStatus = (studentCount: number, maxCapacity: number = 45) => {
    const utilization = maxCapacity > 0 ? (studentCount / maxCapacity) * 100 : 0;
    
    if (utilization >= 95) return { status: 'FULL', color: '#FF3B30', icon: 'battery-full' as const };
    if (utilization >= 75) return { status: 'HIGH', color: '#FF9500', icon: 'battery-full' as const };
    if (utilization >= 40) return { status: 'MEDIUM', color: '#34C759', icon: 'battery-half' as const };
    return { status: 'LOW', color: '#007AFF', icon: 'battery-dead-outline' as const };
  };

  const renderSubclassCard = (subclass: Subclass) => {
    const capacityInfo = getCapacityStatus(subclass.studentCount);
    
    return (
      <View key={subclass.id} style={styles.subclassCard}>
        <View style={styles.subclassHeader}>
          <Ionicons name="person-circle-outline" size={40} color="#555" />
          <View style={styles.subclassInfo}>
            <Text style={styles.subclassName}>{subclass.name}</Text>
            <View style={styles.subclassMeta}>
              <Ionicons name="people-outline" size={14} color="#8E8E93" />
              <Text style={styles.subclassStats}>{subclass.studentCount} students</Text>
            </View>
          </View>
          <View style={[styles.capacityIndicator, { backgroundColor: capacityInfo.color }]}>
            <Ionicons name={capacityInfo.icon} size={14} color="#FFFFFF" />
            <Text style={styles.capacityText}>{capacityInfo.status}</Text>
          </View>
        </View>

        <View style={styles.classMasterSection}>
          {subclass.classMaster ? (
            <>
              <Text style={styles.classMasterLabel}>Class Master:</Text>
              <Text style={styles.classMasterName}>{subclass.classMaster.name}</Text>
            </>
          ) : (
            <Text style={styles.noClassMaster}>No class master assigned</Text>
          )}
        </View>

        <View style={styles.subclassActionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openModal('ASSIGN_MASTER', subclass)}
          >
            <Ionicons name="person-add-outline" size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>
              {subclass.classMaster ? 'Change Master' : 'Assign Master'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderClassCard = ({ item }: { item: Class }) => {
    const classItem = item;
    const isExpanded = expandedClasses.includes(classItem.id);
    const totalCapacity = classItem.subClasses.length * 45; // Assuming 45 students per subclass
    const utilizationRate = totalCapacity > 0 ? (classItem.studentCount / totalCapacity) * 100 : 0;

    return (
      <View key={classItem.id} style={styles.classCard}>
        <TouchableOpacity
          style={styles.classHeader}
          onPress={() => handleClassExpand(classItem.id)}
        >
          <Ionicons name="library-outline" size={28} color="#007AFF" />
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classItem.name}</Text>
            <Text style={styles.classStats}>
              {classItem.studentCount} students • {classItem.subClasses.length} subclasses • {utilizationRate.toFixed(0)}% capacity
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={24}
            color="#8E8E93"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subclassesContainer}>
            {classItem.subClasses.length > 0
              ? classItem.subClasses.map(renderSubclassCard)
              : <Text style={styles.noSubclassesText}>No subclasses found.</Text>
            }
            <TouchableOpacity style={styles.addSubclassButton} onPress={() => openModal('ADD_SUBCLASS', classItem)}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addSubclassButtonText}>Add New Subclass</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Management</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredClasses}
        renderItem={renderClassCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={60} color="#CED4DA" />
            <Text style={styles.emptyText}>No classes found.</Text>
            <Text style={styles.emptySubText}>Create a new class to get started.</Text>
          </View>
        }
      />
{/*       
      <TouchableOpacity style={styles.fab} onPress={() => openModal('CREATE_CLASS', null)}>
        <Ionicons name="add-outline" size={32} color="#FFFFFF" />
      </TouchableOpacity>
       */}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingLeft: 40,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#F8D7DA',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#721C24',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
  },
  classStats: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  subclassesContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  subclassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  subclassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subclassInfo: {
    flex: 1,
  },
  subclassName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  subclassMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  subclassStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  classMasterSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  classMasterLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  classMasterName: {
    fontSize: 14,
    color: '#343A40',
    fontWeight: '600',
  },
  noClassMaster: {
    fontSize: 14,
    color: '#ADB5BD',
    fontStyle: 'italic',
  },
  capacityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  capacityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subclassActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  noSubclassesText: {
    textAlign: 'center',
    color: '#8E8E93',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  addSubclassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#E7F5FF',
  },
  addSubclassButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
});

export default VPClasses; 