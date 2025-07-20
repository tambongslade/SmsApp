import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';

interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  studentCount?: number;
  personnelCount?: number;
  classCount?: number;
  createdAt: string;
}

interface AcademicYearsData {
  academicYears: AcademicYear[];
  summary: {
    totalYears: number;
    currentYear: string;
    activeStudents: number;
    archivedYears: number;
  };
}

interface AcademicYearsProps {
  token: string;
  onNavigateBack: () => void;
}

const AcademicYearsScreen: React.FC<AcademicYearsProps> = ({ token, onNavigateBack }) => {
  const [academicYearsData, setAcademicYearsData] = useState<AcademicYearsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<number | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  // Mock data for fallback
  const mockAcademicYearsData: AcademicYearsData = {
    academicYears: [
      {
        id: 1,
        name: "2024-2025",
        startDate: "2024-09-01",
        endDate: "2025-07-31",
        isCurrent: true,
        status: "ACTIVE",
        studentCount: 1245,
        personnelCount: 52,
        classCount: 24,
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        name: "2023-2024",
        startDate: "2023-09-01",
        endDate: "2024-07-31",
        isCurrent: false,
        status: "COMPLETED",
        studentCount: 1180,
        personnelCount: 48,
        classCount: 22,
        createdAt: "2023-01-01T00:00:00Z"
      },
      {
        id: 3,
        name: "2022-2023",
        startDate: "2022-09-01",
        endDate: "2023-07-31",
        isCurrent: false,
        status: "ARCHIVED",
        studentCount: 1120,
        personnelCount: 45,
        classCount: 20,
        createdAt: "2022-01-01T00:00:00Z"
      }
    ],
    summary: {
      totalYears: 3,
      currentYear: "2024-2025",
      activeStudents: 1245,
      archivedYears: 1
    }
  };

  // Fetch academic years from API
  const fetchAcademicYears = async () => {
    try {
      console.log('📅 Fetching academic years...');
      console.log('Using token:', token);
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/academic-years', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Academic Years API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('Academic Years API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          // Handle case where API returns just an array of academic years
          if (Array.isArray(apiData.data)) {
            const formattedData: AcademicYearsData = {
              academicYears: apiData.data,
              summary: {
                totalYears: apiData.data.length,
                currentYear: apiData.data.find((year: AcademicYear) => year.isCurrent)?.name || 'N/A',
                activeStudents: apiData.data.reduce((total: number, year: AcademicYear) => total + (year.studentCount || 0), 0),
                archivedYears: apiData.data.filter((year: AcademicYear) => year.status === 'ARCHIVED').length
              }
            };
            setAcademicYearsData(formattedData);
          } else {
            // API returns the expected structure with summary
            setAcademicYearsData(apiData.data);
          }
          console.log('✅ Successfully loaded real academic years data');
          return;
        } else {
          console.log('API returned success=false or missing data:', apiData);
        }
      } else {
        const errorData = await response.text();
        console.log('Academic Years API Error:', response.status, errorData);
      }
    } catch (error) {
      console.log('Academic Years API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock academic years data as fallback');
    setAcademicYearsData(mockAcademicYearsData);
  };

  useEffect(() => {
    fetchAcademicYears().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAcademicYears();
    setRefreshing(false);
  };

  // Create academic year
  const handleCreateYear = async () => {
    if (!createForm.name || !createForm.startDate || !createForm.endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setProcessingAction(-1); // Special ID for create action
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/academic-years', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      console.log('Create Academic Year Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Create Academic Year Response:', result);
        
        if (result.success) {
          Alert.alert('Success', 'Academic year created successfully');
          setShowCreateModal(false);
          setCreateForm({ name: '', startDate: '', endDate: '', isCurrent: false, description: '' });
          handleRefresh();
          return;
        }
      }
      
      throw new Error('Failed to create academic year');
    } catch (error) {
      Alert.alert('Error', 'Failed to create academic year. Please try again.');
      console.log('Create academic year error:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  // Set current academic year
  const handleSetCurrent = async (yearId: number, yearName: string) => {
    Alert.alert(
      'Set Current Academic Year',
      `Are you sure you want to set "${yearName}" as the current academic year? This will affect all system operations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set Current', 
          onPress: async () => {
            try {
              setProcessingAction(yearId);
              
              const response = await fetch(`https://sms.sniperbuisnesscenter.com/api/v1/academic-years/${yearId}/set-current`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log('Set Current Year Response Status:', response.status);

              if (response.ok) {
                const result = await response.json();
                console.log('Set Current Year Response:', result);
                
                if (result.success) {
                  Alert.alert('Success', `"${yearName}" is now the current academic year`);
                  handleRefresh();
                  return;
                }
              }
              
              throw new Error('Failed to set current academic year');
            } catch (error) {
              Alert.alert('Error', 'Failed to set current academic year. Please try again.');
              console.log('Set current year error:', error);
            } finally {
              setProcessingAction(null);
            }
          }
        },
      ]
    );
  };

  // Delete academic year
  const handleDeleteYear = async (yearId: number, yearName: string) => {
    Alert.alert(
      'Delete Academic Year',
      `Are you sure you want to delete "${yearName}"? This action cannot be undone and will remove all associated data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingAction(yearId);
              
              const response = await fetch(`https://sms.sniperbuisnesscenter.com/api/v1/academic-years/${yearId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log('Delete Academic Year Response Status:', response.status);

              if (response.ok) {
                const result = await response.json();
                console.log('Delete Academic Year Response:', result);
                
                if (result.success) {
                  Alert.alert('Success', 'Academic year deleted successfully');
                  handleRefresh();
                  return;
                }
              }
              
              throw new Error('Failed to delete academic year');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete academic year. Please try again.');
              console.log('Delete academic year error:', error);
            } finally {
              setProcessingAction(null);
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#2ecc71';
      case 'COMPLETED': return '#3498db';
      case 'ARCHIVED': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status: string, isCurrent: boolean) => {
    if (isCurrent) return '🟢';
    switch (status) {
      case 'ACTIVE': return '🟢';
      case 'COMPLETED': return '⚪';
      case 'ARCHIVED': return '⚫';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading Academic Years...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!academicYearsData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load academic years data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAcademicYears}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Years</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{academicYearsData?.summary?.totalYears || 0}</Text>
            <Text style={styles.summaryLabel}>Total Years</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{academicYearsData?.summary?.activeStudents || 0}</Text>
            <Text style={styles.summaryLabel}>Active Students</Text>
          </View>
        </View>
        <Text style={styles.currentYearText}>Current Year: {academicYearsData?.summary?.currentYear || 'N/A'}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Academic Years List */}
        {academicYearsData?.academicYears && academicYearsData.academicYears.length > 0 ? (
          academicYearsData.academicYears.map((year) => (
          <View key={year.id} style={styles.yearCard}>
            <View style={styles.yearHeader}>
              <View style={styles.yearTitleRow}>
                <Text style={styles.yearIcon}>{getStatusIcon(year.status, year.isCurrent)}</Text>
                <View style={styles.yearInfo}>
                  <Text style={styles.yearName}>{year.name}</Text>
                  {year.isCurrent && <Text style={styles.currentBadge}>CURRENT</Text>}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(year.status) }]}>
                  <Text style={styles.statusText}>{year.status}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.yearDetails}>
              <Text style={styles.yearDates}>
                📅 {formatDate(year.startDate)} - {formatDate(year.endDate)}
              </Text>
              
              {year.studentCount !== undefined && (
                <View style={styles.yearStats}>
                  <Text style={styles.statText}>👥 Students: {year.studentCount}</Text>
                  <Text style={styles.statText}>👨‍🏫 Personnel: {year.personnelCount}</Text>
                  <Text style={styles.statText}>🏫 Classes: {year.classCount}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.yearActions}>
              {!year.isCurrent && year.status !== 'ARCHIVED' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={() => handleSetCurrent(year.id, year.name)}
                  disabled={processingAction === year.id}
                >
                  {processingAction === year.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Set Current</Text>
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📊 Reports</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⚙️ Settings</Text>
              </TouchableOpacity>
              
              {!year.isCurrent && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteYear(year.id, year.name)}
                  disabled={processingAction === year.id}
                >
                  {processingAction === year.id ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.yearCreated}>Created: {formatDate(year.createdAt)}</Text>
          </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No academic years found</Text>
            <Text style={styles.emptyStateSubtext}>Create your first academic year to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Academic Year Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Academic Year</Text>
            
            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="Academic Year Name (e.g., 2025-2026) *"
                value={createForm.name}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, name: text }))}
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Start Date (YYYY-MM-DD) *"
                value={createForm.startDate}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, startDate: text }))}
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="End Date (YYYY-MM-DD) *"
                value={createForm.endDate}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, endDate: text }))}
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Description (optional)"
                value={createForm.description}
                onChangeText={(text) => setCreateForm(prev => ({ ...prev, description: text }))}
                multiline
              />
              
              {/* Set as Current */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setCreateForm(prev => ({ ...prev, isCurrent: !prev.isCurrent }))}
              >
                <View style={[styles.checkbox, createForm.isCurrent && styles.checkboxChecked]}>
                  {createForm.isCurrent && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as current academic year</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCreateModal(false)}
                disabled={processingAction === -1}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleCreateYear}
                disabled={processingAction === -1}
              >
                {processingAction === -1 ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Create Year</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  currentYearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  yearCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearHeader: {
    marginBottom: 10,
  },
  yearTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  yearInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 10,
  },
  currentBadge: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  yearDetails: {
    marginBottom: 15,
  },
  yearDates: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  yearStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  yearActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 5,
    minWidth: '30%',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2ecc71',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '500',
  },
  yearCreated: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 300,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default AcademicYearsScreen; 