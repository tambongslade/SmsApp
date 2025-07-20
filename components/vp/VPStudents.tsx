import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants';
import FallbackImage from '../FallbackImage';

// Types based on API documentation
interface Student {
  id: number;
  name: string;
  matricule: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  photo?: string;
  enrollmentStatus: 'NOT_ENROLLED' | 'ENROLLED' | 'ASSIGNED_TO_CLASS' | 'PENDING_INTERVIEW';
  classInfo?: {
    className: string;
    subclassName?: string;
  };
  parents?: Array<{
    id: number;
    parent: { name: string; phone: string; email?: string; };
  }>;
  interview?: {
    id: number;
    score: number;
    status: string;
    date: string;
  };
}

interface Class {
  id: number;
  name: string;
}

interface Subclass {
  id: number;
  name: string;
  classId: number;
  studentCount: number;
  currentStudents?: number;
  academicYearId?: number;
  class: {
    id: number;
    name: string;
  };
  classMaster?: {
    id: number;
    name: string;
    matricule: string;
    email: string;
  };
}

interface VpDashboardStats {
  totalStudents: number;
  studentsAssigned: number;
  pendingInterviews: number;
  completedInterviews: number;
  awaitingAssignment: number;
  recentDisciplineIssues: number;
  classesWithPendingReports: number;
  teacherAbsences: number;
}

interface FilterState {
  search: string;
  enrollmentStatus: 'ALL' | Student['enrollmentStatus'];
  classId: number | 'unassigned' | null;
  subClassId: number | null;
}

interface ModalState {
  type: 'VIEW' | 'ASSIGN' | 'INTERVIEW' | null;
  data: Student | null;
}

interface DropdownState {
  status: boolean;
  class: boolean;
  subclass: boolean;
}

const enrollmentStatusOptions = [
  { label: 'All Statuses', value: 'ALL', icon: 'apps-outline' },
  { label: 'Enrolled', value: 'ENROLLED', icon: 'checkmark-circle-outline' },
  { label: 'Not Enrolled', value: 'NOT_ENROLLED', icon: 'close-circle-outline' },
  { label: 'Assigned to Class', value: 'ASSIGNED_TO_CLASS', icon: 'school-outline' },
  { label: 'Pending Interview', value: 'PENDING_INTERVIEW', icon: 'time-outline' },
];

const VPStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subclasses, setSubclasses] = useState<Subclass[]>([]);
  const [stats, setStats] = useState<VpDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    enrollmentStatus: 'ALL',
    classId: null,
    subClassId: null,
  });
  const [modalState, setModalState] = useState<ModalState>({ type: null, data: null });
  const [assignSubclassId, setAssignSubclassId] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<DropdownState>({
    status: false,
    class: false,
    subclass: false,
  });
  const [searchFocused, setSearchFocused] = useState(false);
  
  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/vice-principal/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data.data);
    } catch (e) {
      console.error('Failed to fetch VP dashboard stats:', e);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        sortBy: 'name',
        sortOrder: 'asc',
      });
      if (filters.search) params.append('name', filters.search);
      if (filters.classId === 'unassigned') {
         params.append('enrollmentStatus', 'ENROLLED');
      } else {
        if (filters.enrollmentStatus !== 'ALL') {
          params.append('enrollmentStatus', filters.enrollmentStatus);
        }
        if (filters.classId) {
          params.append('classId', String(filters.classId));
        }
        if (filters.subClassId) {
          params.append('subClassId', String(filters.subClassId));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/students?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch students');
      
      const data = await response.json();
      setStudents(data.data?.students || data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const fetchSelectData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const [classRes, subClassRes] = await Promise.all([
        fetch(`${API_BASE_URL}/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/classes/sub-classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const classData = await classRes.json();
      const subClassData = await subClassRes.json();
      setClasses(classData.data?.classes || classData.data || []);
      const sortedSubclasses = (subClassData.data?.subClasses || subClassData.data || []).sort((a: Subclass, b: Subclass) => {
          const classNameA = a.class?.name || '';
          const classNameB = b.class?.name || '';
          if (classNameA < classNameB) return -1;
          if (classNameA > classNameB) return 1;
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
      });
      setSubclasses(sortedSubclasses);
    } catch (e) {
      console.error("Failed to load class/subclass data", e);
    }
  }, []);
  
  useEffect(() => {
    fetchDashboardStats();
    fetchStudents();
    fetchSelectData();
  }, [fetchDashboardStats, fetchStudents, fetchSelectData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchDashboardStats(), fetchStudents(), fetchSelectData()]).finally(() => setRefreshing(false));
  }, [fetchDashboardStats, fetchStudents, fetchSelectData]);

  const handleAssignStudent = async () => {
    if (!modalState.data || !assignSubclassId) {
      Alert.alert('Error', 'Please select a subclass.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/enrollment/assign-subclass`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: modalState.data.id, subClassId: assignSubclassId })
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to assign student');
      }
      Alert.alert('Success', 'Student assigned successfully.');
      setModalState({ type: null, data: null });
      setAssignSubclassId(null);
      onRefresh();
    } catch(e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      enrollmentStatus: 'ALL',
      classId: null,
      subClassId: null,
    });
    setDropdownVisible({ status: false, class: false, subclass: false });
  };

  const closeAllDropdowns = () => {
    setDropdownVisible({ status: false, class: false, subclass: false });
  };

  const toggleDropdown = (type: keyof DropdownState) => {
    setDropdownVisible(prev => ({
      status: type === 'status' ? !prev.status : false,
      class: type === 'class' ? !prev.class : false,
      subclass: type === 'subclass' ? !prev.subclass : false,
    }));
  };

  const filteredSubclasses = useMemo(() => {
    if (!filters.classId || filters.classId === 'unassigned') return [];
    return subclasses.filter(sc => sc.classId === filters.classId);
  }, [filters.classId, subclasses]);

  const getStatusStyle = (status: Student['enrollmentStatus']) => {
    switch (status) {
      case 'ASSIGNED_TO_CLASS':
        return { backgroundColor: '#D4EDDA', color: '#155724' };
      case 'ENROLLED':
        return { backgroundColor: '#CDEEFF', color: '#004085' };
      case 'PENDING_INTERVIEW':
        return { backgroundColor: '#FFF3CD', color: '#856404' };
      case 'NOT_ENROLLED':
        return { backgroundColor: '#F8D7DA', color: '#721C24' };
      default:
        return { backgroundColor: '#E9ECEF', color: '#495057' };
    }
  };

  const renderStudentCard = ({ item }: { item: Student }) => {
    const statusStyle = getStatusStyle(item.enrollmentStatus);
    return (
        <TouchableOpacity style={styles.studentCard} onPress={() => setModalState({ type: 'VIEW', data: item })}>
            <FallbackImage
                source={item.photo ? { uri: item.photo } : require('../../assets/icon.png')}
                fallbackSource={require('../../assets/icon.png')}
                style={styles.avatar}
            />
            <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentMatricule}>{item.matricule}</Text>
                <Text style={styles.studentClass}>
                    {item.classInfo?.className || 'No Class'}
                    {item.classInfo?.subclassName ? ` - ${item.classInfo.subclassName}` : ''}
                </Text>
                 <View style={[styles.statusBadge, {backgroundColor: statusStyle.backgroundColor}]}>
                    <Text style={[styles.statusText, {color: statusStyle.color}]}>
                        {(item.enrollmentStatus || 'N/A').replace(/_/g, ' ')}
                    </Text>
                </View>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setModalState({ type: 'ASSIGN', data: item })}>
                    <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
                </TouchableOpacity>
                 <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Interview", "Interview functionality to be implemented.")}>
                    <Ionicons name="calendar-outline" size={20} color="#FF9500" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
  };
  
  const renderModalContent = () => {
    if (!modalState.data) return null;
    const student = modalState.data;

    switch (modalState.type) {
      case 'VIEW':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
                <FallbackImage
                    source={student.photo ? { uri: student.photo } : require('../../assets/adaptive-icon.png')}
                    fallbackSource={require('../../assets/adaptive-icon.png')}
                    style={styles.modalAvatar}
                />
                <Text style={styles.modalTitle}>{student.name}</Text>
                <Text style={styles.modalSubtitle}>{student.matricule}</Text>
            </View>

            <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#6C757D" />
                    <Text style={styles.infoText}>{new Date(student.dateOfBirth).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name={student.gender === 'MALE' ? 'male-outline' : 'female-outline'} size={20} color="#6C757D" />
                    <Text style={styles.infoText}>{student.gender}</Text>
                </View>
                 <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={20} color="#6C757D" />
                    <Text style={styles.infoText}>
                        {student.classInfo?.className}{student.classInfo?.subclassName ? ` - ${student.classInfo.subclassName}` : ' - Not Assigned'}
                    </Text>
                </View>
            </View>

            {student.parents && student.parents.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Parent/Guardian Information</Text>
                {student.parents.map(p => (
                  <View key={p.id} style={styles.parentCard}>
                    <Text style={styles.parentName}>{p.parent.name}</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={20} color="#6C757D" />
                      <Text style={styles.infoText}>{p.parent.phone}</Text>
                    </View>
                    {p.parent.email && (
                      <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color="#6C757D" />
                        <Text style={styles.infoText}>{p.parent.email}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {student.interview && (
                <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Interview Details</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="star-outline" size={20} color="#6C757D" />
                        <Text style={styles.infoText}>Score: {student.interview.score}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#6C757D" />
                        <Text style={styles.infoText}>Status: {student.interview.status}</Text>
                    </View>
                </View>
            )}
          </ScrollView>
        );
      case 'ASSIGN':
        return (
          <>
            <Text style={styles.modalTitle}>Assign {student.name}</Text>
            <Text style={styles.modalSubtitle}>Current Class: {student.classInfo?.className || 'Unassigned'}</Text>
            <View style={styles.assignContainer}>
              <Text style={styles.assignLabel}>Select Subclass:</Text>
              <FlatList
                data={subclasses.filter(sc => {
                  const studentClass = classes.find(c => c.name === student.classInfo?.className);
                  return sc.classId === studentClass?.id;
                })}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.assignOption,
                      assignSubclassId === item.id && styles.assignOptionSelected
                    ]}
                    onPress={() => setAssignSubclassId(item.id)}
                  >
                    <Text style={[
                      styles.assignOptionText,
                      assignSubclassId === item.id && styles.assignOptionTextSelected
                    ]}>
                      {item.name} ({item.currentStudents || item.studentCount} students)
                    </Text>
                    {assignSubclassId === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.assignList}
              />
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleAssignStudent}>
              <Text style={styles.modalButtonText}>Confirm Assignment</Text>
            </TouchableOpacity>
          </>
        );
      default: return null;
    }
  };

  const renderStatCard = (title: string, value: number | string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={28} color="#007AFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderCustomDropdown = (
    type: keyof DropdownState,
    placeholder: string,
    selectedValue: any,
    options: Array<{ label: string; value: any; icon?: string }>,
    onSelect: (value: any) => void
  ) => {
    const isVisible = dropdownVisible[type];
    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownButton, isVisible && styles.dropdownButtonActive]}
          onPress={() => toggleDropdown(type)}
        >
          <View style={styles.dropdownButtonContent}>
            {selectedOption?.icon && (
              <Ionicons name={selectedOption.icon as any} size={16} color="#6C757D" style={styles.dropdownIcon} />
            )}
            <Text style={[styles.dropdownButtonText, selectedValue && styles.dropdownButtonTextSelected]}>
              {selectedOption?.label || placeholder}
            </Text>
          </View>
          <Ionicons 
            name={isVisible ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#6C757D" 
          />
        </TouchableOpacity>
        
        {isVisible && (
          <View style={styles.dropdownList}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    closeAllDropdowns();
                  }}
                >
                  {item.icon && (
                    <Ionicons name={item.icon as any} size={16} color="#6C757D" style={styles.dropdownIcon} />
                  )}
                  <Text style={[
                    styles.dropdownItemText,
                    selectedValue === item.value && styles.dropdownItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={16} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  };

  // Prepare dropdown options
  const classOptions = [
    { label: 'All Classes', value: null, icon: 'apps-outline' },
    { label: 'Unassigned Students', value: 'unassigned', icon: 'alert-circle-outline' },
    ...classes.map(c => ({ label: c.name, value: c.id, icon: 'school-outline' }))
  ];

  const subclassOptions = [
    { label: 'All Subclasses', value: null, icon: 'apps-outline' },
    ...filteredSubclasses.map(sc => ({ 
      label: `${sc.name} (${sc.currentStudents || sc.studentCount})`, 
      value: sc.id, 
      icon: 'people-outline' 
    }))
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Student Management</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="reload-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} tintColor={"#007AFF"}/>}
        ListHeaderComponent={
          <>
            {/* Dashboard Stats */}
            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  {renderStatCard('Total Students', stats.totalStudents, 'people-outline')}
                  {renderStatCard('Assigned', stats.studentsAssigned, 'person-add-outline')}
                </View>
                <View style={styles.statRow}>
                  {renderStatCard('Pending Interviews', stats.pendingInterviews, 'time-outline')}
                  {renderStatCard('Awaiting Assignment', stats.awaitingAssignment, 'hourglass-outline')}
                </View>
              </View>
            )}

            {/* Modern Filter Section */}
            <View style={styles.modernFiltersContainer}>
              {/* Search Bar */}
              <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
                <Ionicons name="search-outline" size={20} color={searchFocused ? "#007AFF" : "#6C757D"} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search students by name or matricule..."
                  value={filters.search}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholderTextColor="#9CA3AF"
                />
                {filters.search.length > 0 && (
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, search: '' }))}>
                    <Ionicons name="close-circle" size={20} color="#6C757D" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Dropdowns */}
              <View style={styles.filtersRow}>
                {renderCustomDropdown(
                  'status',
                  'Enrollment Status',
                  filters.enrollmentStatus,
                  enrollmentStatusOptions,
                  (value) => setFilters(prev => ({ 
                    ...prev, 
                    enrollmentStatus: value, 
                    classId: null, 
                    subClassId: null 
                  }))
                )}
                
                {renderCustomDropdown(
                  'class',
                  'Select Class',
                  filters.classId,
                  classOptions,
                  (value) => setFilters(prev => ({ 
                    ...prev, 
                    classId: value, 
                    subClassId: null 
                  }))
                )}
              </View>

              {/* Subclass Dropdown (only show if class is selected) */}
              {filters.classId && filters.classId !== 'unassigned' && filteredSubclasses.length > 0 && (
                <View style={styles.subclassRow}>
                  {renderCustomDropdown(
                    'subclass',
                    'Select Subclass',
                    filters.subClassId,
                    subclassOptions,
                    (value) => setFilters(prev => ({ ...prev, subClassId: value }))
                  )}
                </View>
              )}

              {/* Active Filters & Clear Button */}
              <View style={styles.filterSummaryRow}>
                <Text style={styles.resultCount}>
                  {students.length} student{students.length !== 1 ? 's' : ''} found
                </Text>
                {(filters.search || filters.enrollmentStatus !== 'ALL' || filters.classId || filters.subClassId) && (
                  <TouchableOpacity onPress={handleClearFilters} style={styles.clearAllButton}>
                    <Ionicons name="close-outline" size={16} color="#007AFF" />
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
        renderItem={renderStudentCard}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <>
                        <Ionicons name="sad-outline" size={64} color="#CED4DA" />
                        <Text style={styles.emptyText}>No students found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your filters or search term.</Text>
                    </>
                )}
            </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        onScrollBeginDrag={closeAllDropdowns}
      />

      {/* Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalState.type !== null}
        onRequestClose={() => setModalState({ type: null, data: null })}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={() => setModalState({ type: null, data: null })}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {renderModalContent()}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalState({ type: null, data: null })}>
              <Ionicons name="close-circle" size={32} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Backdrop for dropdowns */}
      {(dropdownVisible.status || dropdownVisible.class || dropdownVisible.subclass) && (
        <TouchableOpacity 
          style={styles.dropdownBackdrop} 
          activeOpacity={1} 
          onPress={closeAllDropdowns}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    statsContainer: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginVertical: 6,
    },
    statTitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    
    // Modern Filter Styles
    modernFiltersContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    searchContainerFocused: {
        borderColor: '#007AFF',
        backgroundColor: '#FFFFFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        marginLeft: 12,
        marginRight: 8,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    subclassRow: {
        marginBottom: 12,
    },
    dropdownContainer: {
        flex: 1,
        position: 'relative',
        zIndex: 1000,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#FFFFFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    dropdownButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownIcon: {
        marginRight: 8,
    },
    dropdownButtonText: {
        fontSize: 15,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    dropdownButtonTextSelected: {
        color: '#111827',
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        zIndex: 1000,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownScrollView: {
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemSelected: {
        backgroundColor: '#EBF8FF',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#374151',
        flex: 1,
        fontWeight: '500',
    },
    dropdownItemTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    dropdownBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 999,
    },
    filterSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    resultCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EBF8FF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    clearAllText: {
        color: '#007AFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    
    // Student Card Styles
    studentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
        borderWidth: 3,
        borderColor: '#E5E7EB'
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    studentMatricule: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    studentClass: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 8,
        fontStyle: 'italic'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    actionsContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    actionButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '92%',
        maxHeight: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#007AFF'
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    modalSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 16,
        fontWeight: '500',
    },
    parentCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    parentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    assignContainer: {
        marginVertical: 20,
    },
    assignLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    assignList: {
        maxHeight: 200,
    },
    assignOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    assignOptionSelected: {
        backgroundColor: '#EBF8FF',
        borderColor: '#007AFF',
    },
    assignOptionText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
        flex: 1,
    },
    assignOptionTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default VPStudents; 