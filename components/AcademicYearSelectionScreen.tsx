import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { API_BASE_URL } from '../constants';

type AcademicYearSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'AcademicYearSelection'>;

interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  studentCount: number;
  classCount: number;
}

const AcademicYearSelectionScreen: React.FC<AcademicYearSelectionScreenProps> = ({ route, navigation }) => {
  const { user, selectedRole, token } = route.params;
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  // API call to fetch academic years
  const fetchAcademicYears = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from real API
      try {
        const response = await fetch(`${API_BASE_URL}/academic-years/available-for-role?role=${selectedRole.role}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const apiData = await response.json();
          
          if (apiData.success && apiData.data && apiData.data.academicYears) {
            const academicYears = apiData.data.academicYears.map((year: any) => ({
              id: year.id,
              name: year.name,
              startDate: year.startDate,
              endDate: year.endDate,
              isCurrent: year.isCurrent,
              status: year.status,
              studentCount: year.studentCount || 0,
              classCount: year.classCount || 0,
            }));

            setAcademicYears(academicYears);
            
            // Auto-select current academic year
            const currentYear = academicYears.find((year: AcademicYear) => year.isCurrent);
            if (currentYear) {
              setSelectedYearId(currentYear.id);
            }
            return;
          }
        }
      } catch (apiError) {
        console.log('API call failed, using mock data:', apiError);
      }
      
      // Fallback to mock data
      const mockData: AcademicYear[] = [
        {
          id: 1,
          name: '2024-2025',
          startDate: '2024-09-01',
          endDate: '2025-07-31',
          isCurrent: true,
          status: 'ACTIVE',
          studentCount: 1245,
          classCount: 24
        },
        {
          id: 2,
          name: '2023-2024',
          startDate: '2023-09-01',
          endDate: '2024-07-31',
          isCurrent: false,
          status: 'COMPLETED',
          studentCount: 1180,
          classCount: 22
        },
        {
          id: 3,
          name: '2022-2023',
          startDate: '2022-09-01',
          endDate: '2023-07-31',
          isCurrent: false,
          status: 'COMPLETED',
          studentCount: 1095,
          classCount: 20
        }
      ];

      setAcademicYears(mockData);
      
      // Auto-select current academic year
      const currentYear = mockData.find(year => year.isCurrent);
      if (currentYear) {
        setSelectedYearId(currentYear.id);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load academic years. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleYearSelect = async (academicYearId: number) => {
    setSelectedYearId(academicYearId);
    
    try {
      // Try to make API call to select academic year
      try {
        const response = await fetch(`${API_BASE_URL}/auth/select-academic-year`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            academicYearId: academicYearId
          }),
        });

        if (response.ok) {
          const apiData = await response.json();
          
          if (apiData.success && apiData.data) {
            // Store the updated token if provided
            const finalToken = apiData.data.finalToken || token;
            await AsyncStorage.setItem('authToken', finalToken);
            
            // Use the final token and context from API response
            const updatedRole = {
              ...selectedRole,
              academicYearId: apiData.data.context.academicYearId,
              academicYearName: apiData.data.context.academicYearName
            };
            
            navigation.navigate('Dashboard', { 
              user, 
              selectedRole: updatedRole, 
              token: finalToken 
            });
            return;
          }
        }
      } catch (apiError) {
        console.log('API call failed, proceeding with local data:', apiError);
      }
      
      // Fallback to local handling
      const selectedYear = academicYears.find(year => year.id === academicYearId);
      
      const updatedRole = {
        ...selectedRole,
        academicYearId,
        academicYearName: selectedYear?.name || null
      };
      
      navigation.navigate('Dashboard', { 
        user, 
        token,
        selectedRole: updatedRole, 
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to select academic year. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#2ecc71';
      case 'COMPLETED': return '#95a5a6';
      case 'UPCOMING': return '#3498db';
      default: return '#bdc3c7';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Current';
      case 'COMPLETED': return 'Completed';
      case 'UPCOMING': return 'Upcoming';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Academic Years...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Academic Year</Text>
          <Text style={styles.headerSubtitle}>
            Select year for {selectedRole.role.replace(/_/g, ' ')} role
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Choose Academic Year</Text>
        <Text style={styles.subtitle}>
          Select the academic year you want to work with. You can change this later in your dashboard.
        </Text>

        <ScrollView style={styles.yearsList} showsVerticalScrollIndicator={false}>
          {academicYears.map((year) => (
            <TouchableOpacity
              key={year.id}
              style={[
                styles.yearCard,
                selectedYearId === year.id && styles.yearCardSelected,
                year.isCurrent && styles.yearCardCurrent
              ]}
              onPress={() => handleYearSelect(year.id)}
              activeOpacity={0.7}
            >
              <View style={styles.yearContent}>
                <View style={styles.yearHeader}>
                  <View style={styles.yearTitleContainer}>
                    <Text style={[
                      styles.yearName,
                      selectedYearId === year.id && styles.yearNameSelected
                    ]}>
                      {year.name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(year.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(year.status)}</Text>
                    </View>
                  </View>
                  {year.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>RECOMMENDED</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.yearDetails}>
                  <Text style={[
                    styles.yearPeriod,
                    selectedYearId === year.id && styles.yearPeriodSelected
                  ]}>
                    {formatDate(year.startDate)} - {formatDate(year.endDate)}
                  </Text>
                  
                  <View style={styles.yearStats}>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statNumber,
                        selectedYearId === year.id && styles.statNumberSelected
                      ]}>
                        {year.studentCount.toLocaleString()}
                      </Text>
                      <Text style={[
                        styles.statLabel,
                        selectedYearId === year.id && styles.statLabelSelected
                      ]}>
                        Students
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statNumber,
                        selectedYearId === year.id && styles.statNumberSelected
                      ]}>
                        {year.classCount}
                      </Text>
                      <Text style={[
                        styles.statLabel,
                        selectedYearId === year.id && styles.statLabelSelected
                      ]}>
                        Classes
                      </Text>
                    </View>
                  </View>
                </View>
                
                {selectedYearId === year.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIcon}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>🚪 Return to Login</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  yearsList: {
    flex: 1,
  },
  yearCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  yearCardCurrent: {
    borderColor: '#2ecc71',
  },
  yearContent: {
    padding: 20,
    position: 'relative',
  },
  yearHeader: {
    marginBottom: 15,
  },
  yearTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  yearName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 10,
  },
  yearNameSelected: {
    color: '#3498db',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentBadge: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  yearDetails: {
    marginBottom: 10,
  },
  yearPeriod: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  yearPeriodSelected: {
    color: '#3498db',
  },
  yearStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statNumberSelected: {
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  statLabelSelected: {
    color: '#3498db',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  logoutButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AcademicYearSelectionScreen; 