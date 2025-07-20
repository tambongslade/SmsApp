import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  FlatList,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_BASE_URL } from '../../constants';

// Interfaces based on API response
interface Term {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

interface ExamSequence {
  id: number;
  sequenceNumber: number;
  status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  termId: number;
}

interface AcademicYear {
  id: number;
  name: string;
  isCurrent: boolean;
  terms: Term[];
  examSequences: ExamSequence[];
}

interface Student {
  id: number;
  name: string;
  matricule: string;
  subClassName: string;
  className: string;
  reportAvailability: {
    available: boolean;
    status: string;
    message: string;
  };
}

interface Subclass {
  id: number;
  name: string;
  className: string;
  studentCount: number;
  reportAvailability: {
    available: boolean;
    status: string;
    message: string;
  };
}

interface GenerationJob {
  id: string;
  name: string;
  type: 'STUDENT' | 'SUBCLASS';
  targetId: number;
  academicYearId: number;
  examSequenceId: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DOWNLOADING';
  message?: string;
  createdAt: string;
  downloadUrl?: string;
  fileUri?: string; // To store local URI for directly generated PDFs
}

type SelectionItem = Student | Subclass;

const VPReportCards: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [selectedExamSequence, setSelectedExamSequence] = useState<ExamSequence | null>(null);
  const [generationType, setGenerationType] = useState<'INDIVIDUAL' | 'SUBCLASS'>('INDIVIDUAL');
  const [studentsWithAvailability, setStudentsWithAvailability] = useState<Student[]>([]);
  const [subclassesWithAvailability, setSubclassesWithAvailability] = useState<Subclass[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedSubclasses, setSelectedSubclasses] = useState<number[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown states
  const [openYearPicker, setOpenYearPicker] = useState(false);
  const [openSequencePicker, setOpenSequencePicker] = useState(false);

  const [yearValue, setYearValue] = useState<number | null>(null);
  const [sequenceValue, setSequenceValue] = useState<number | null>(null);

  const [yearItems, setYearItems] = useState<{ label: string, value: number }[]>([]);
  const [sequenceItems, setSequenceItems] = useState<{ label: string, value: number }[]>([]);

  // Corrected data loading logic
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/academic-years`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to load academic years (${response.status})`);
      }

      const data = await response.json();
      const years = data.data || [];
      setAcademicYears(years);
      setYearItems(years.map((y: AcademicYear) => ({ label: y.name, value: y.id })));

      const currentYear = years.find((year: AcademicYear) => year.isCurrent);
      if (currentYear) {
        setYearValue(currentYear.id);
      } else if (years.length > 0) {
        setYearValue(years[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateJobStatuses, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [loadInitialData]);

  useEffect(() => {
    const selectedYear = academicYears.find(y => y.id === yearValue);
    setSelectedAcademicYear(selectedYear || null);
  }, [yearValue, academicYears]);

  useEffect(() => {
    const selectedSeq = selectedAcademicYear?.examSequences.find(s => s.id === sequenceValue);
    setSelectedExamSequence(selectedSeq || null);
  }, [sequenceValue, selectedAcademicYear]);


  useEffect(() => {
    if (selectedAcademicYear) {
        const sequences = selectedAcademicYear.examSequences.map(seq => {
            const term = selectedAcademicYear.terms.find(t => t.id === seq.termId);
            return {
              ...seq,
              label: `Sequence ${seq.sequenceNumber} - ${term?.name || 'Unknown Term'}`,
              value: seq.id
            };
        });
        setSequenceItems(sequences);
    } else {
        setSequenceItems([]);
    }
    // Reset sequence value when year changes
    setSequenceValue(null);
  }, [selectedAcademicYear]);

  const loadAvailabilityData = async () => {
    if (!selectedAcademicYear || !selectedExamSequence) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      const headers = { Authorization: `Bearer ${token}` };
      const academicYearId = selectedAcademicYear.id;
      const examSequenceId = selectedExamSequence.id;

      if (generationType === 'INDIVIDUAL') {
        const studentsResponse = await fetch(`${API_BASE_URL}/students?academicYearId=${academicYearId}&limit=1000`, { headers });
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students.');
        }
        const studentsData = await studentsResponse.json();
        const students = studentsData.data || [];

        const availabilityPromises = students.map(async (student: any) => {
          const url = `${API_BASE_URL}/report-cards/student/${student.id}/availability?academicYearId=${academicYearId}&examSequenceId=${examSequenceId}`;
          const res = await fetch(url, { headers });
          if (!res.ok) {
            console.error(`Failed to fetch availability for student ${student.id}`, await res.text());
            const currentEnrollment = student.enrollments.find((e: any) => e.academicYearId === academicYearId);
            return {
              id: student.id,
              name: student.name,
              matricule: student.matricule,
              className: currentEnrollment?.subClass?.class?.name || 'N/A',
              subClassName: currentEnrollment?.subClass?.name || 'N/A',
              reportAvailability: { available: false, status: 'FETCH_FAILED', message: `API Error ${res.status}` }
            };
          }
          const availabilityData = await res.json();
          const currentEnrollment = student.enrollments.find((e: any) => e.academicYearId === academicYearId);

          return {
            id: student.id,
            name: student.name,
            matricule: student.matricule,
            className: currentEnrollment?.subClass?.class?.name || 'N/A',
            subClassName: currentEnrollment?.subClass?.name || 'N/A',
            reportAvailability: availabilityData.data || { available: false, status: 'NOT_FOUND', message: 'Availability data missing' }
          };
        });

        const studentsWithAvailabilityData = await Promise.all(availabilityPromises);
        setStudentsWithAvailability(studentsWithAvailabilityData);
      } else { // SUBCLASS
        const subclassesResponse = await fetch(`${API_BASE_URL}/classes/sub-classes?limit=1000`, { headers });
        if (!subclassesResponse.ok) {
          throw new Error('Failed to fetch subclasses.');
        }
        const subclassesData = await subclassesResponse.json();
        const subclasses = subclassesData.data || [];

        const availabilityPromises = subclasses.map(async (subclass: any) => {
          const url = `${API_BASE_URL}/report-cards/subclass/${subclass.id}/availability?academicYearId=${academicYearId}&examSequenceId=${examSequenceId}`;
          const res = await fetch(url, { headers });
          if (!res.ok) {
            console.error(`Failed to fetch availability for subclass ${subclass.id}`, await res.text());
            return {
                id: subclass.id,
                name: subclass.name,
                className: subclass.class.name,
                studentCount: subclass.studentCount,
                reportAvailability: { available: false, status: 'FETCH_FAILED', message: `API Error ${res.status}` }
            };
          }
          const availabilityData = await res.json();
          
          return {
            id: subclass.id,
            name: subclass.name,
            className: subclass.class.name,
            studentCount: subclass.studentCount,
            reportAvailability: availabilityData.data || { available: false, status: 'NOT_FOUND', message: 'Availability data missing' }
          };
        });

        const subclassesWithAvailabilityData = await Promise.all(availabilityPromises);
        setSubclassesWithAvailability(subclassesWithAvailabilityData);
      }
    } catch (err) {
      console.error('Error in loadAvailabilityData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When sequence or type changes, fetch new availability data
    if (selectedAcademicYear && selectedExamSequence) {
      loadAvailabilityData();
    }
  }, [selectedAcademicYear, selectedExamSequence, generationType]);
  
  const examSequencesForSelectedYear = useMemo(() => {
    if (!selectedAcademicYear) return [];
    return selectedAcademicYear.examSequences.map(seq => {
      const term = selectedAcademicYear.terms.find(t => t.id === seq.termId);
      return {
        ...seq,
        name: `Sequence ${seq.sequenceNumber} - ${term?.name || 'Unknown Term'}`,
      };
    });
  }, [selectedAcademicYear]);

  const updateJobStatuses = async () => {
    const processingJobs = generationJobs.filter(job => ['PENDING', 'PROCESSING'].includes(job.status));
    if (processingJobs.length === 0) return;

    try {
        const token = await AsyncStorage.getItem('authToken');
        const promises = processingJobs.map(job => 
            fetch(`${API_BASE_URL}/report-cards/jobs/${job.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
        );

        const results = await Promise.allSettled(promises);
        
        setGenerationJobs(prevJobs => {
            const newJobs = [...prevJobs];
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.data) {
                    const updatedJob = result.value.data;
                    const jobIndex = newJobs.findIndex(j => j.id === updatedJob.id);
                    if (jobIndex !== -1) {
                    newJobs[jobIndex] = { ...newJobs[jobIndex], ...updatedJob };
                    }
                }
            });
            return newJobs;
        });
    } catch(e) {
        console.error("Failed to update job statuses", e);
    }
  };

  const handleGenerateReports = async () => {
    if (!selectedAcademicYear || !selectedExamSequence) {
      Alert.alert('Error', 'Please select academic year and exam sequence.');
      return;
    }

    const targetIds = generationType === 'INDIVIDUAL' ? selectedStudents : selectedSubclasses;
    if (targetIds.length === 0) {
      Alert.alert('Error', 'Please select at least one item to generate reports for.');
      return;
    }

    setGenerating(true);
    setShowSelectionModal(false);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error("Authentication token not found.");

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const typeForUrl = generationType === 'INDIVIDUAL' ? 'student' : 'subclass';
      
      const generationPromises = targetIds.map(async (id) => {
        const url = `${API_BASE_URL}/report-cards/${typeForUrl}/${id}/generate`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            academicYearId: selectedAcademicYear.id,
            examSequenceId: selectedExamSequence.id,
          }),
        });
        
        console.log(`Generation response for ${id}:`, response.status);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Could not read error response.');
          throw new Error(`Failed to generate for ID ${id}. Status: ${response.status}. ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        
        // Handle direct PDF download
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob();
          
          let filename = `report-${typeForUrl}-${id}-${Date.now()}.pdf`;
          const disposition = response.headers.get('content-disposition');
          if (disposition) {
            const filenameMatch = /filename="([^"]+)"/.exec(disposition);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }
          
          const fileUri = FileSystem.cacheDirectory + filename;
          
          // Convert blob to base64 and save
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64data = (reader.result as string).split(',')[1];
                await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
                
                // Create a completed job object pointing to the local file
                const newJob: GenerationJob = {
                  id: `local-${id}-${Date.now()}`,
                  name: `Report: ${filename}`,
                  type: generationType === 'INDIVIDUAL' ? 'STUDENT' : 'SUBCLASS',
                  targetId: id,
                  academicYearId: selectedAcademicYear.id,
                  examSequenceId: selectedExamSequence.id,
                  status: 'COMPLETED',
                  createdAt: new Date().toISOString(),
                  fileUri: fileUri,
                };
                resolve({ data: newJob });

              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
          });
        }
        
        // Handle JSON response for queued jobs
        const responseText = await response.text();
        if (!responseText) {
            // If response is empty, assume it's queued and create a placeholder
            console.log(`Empty 200 response for ${id}, creating pending job.`);
            return { data: {
                id: `pending-${id}-${Date.now()}`,
                name: `Report for ${typeForUrl} ID ${id}`,
                type: generationType === 'INDIVIDUAL' ? 'STUDENT' : 'SUBCLASS',
                targetId: id,
                academicYearId: selectedAcademicYear.id,
                examSequenceId: selectedExamSequence.id,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
            }};
        }

        return JSON.parse(responseText);
      });

      const results = await Promise.allSettled(generationPromises);
      
      const newJobs: GenerationJob[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.data) {
          if (Array.isArray(result.value.data)) {
            newJobs.push(...result.value.data);
          } else {
            newJobs.push(result.value.data);
          }
        } else if (result.status === 'rejected') {
          console.error('A report generation request failed:', result.reason.message);
        }
      });
      
      if (newJobs.length > 0) {
        setGenerationJobs(prev => [...newJobs, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        Alert.alert('Success', `${newJobs.length} report generation(s) have been processed.`);
      } else {
         Alert.alert('Notice', 'No new generation jobs were started.');
      }

    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'An unexpected error occurred during report generation.');
    } finally {
      setGenerating(false);
      setSelectedStudents([]);
      setSelectedSubclasses([]);
    }
  };

  const handleDownloadReport = async (job: GenerationJob) => {
    if (Platform.OS !== 'web' && !(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing is not available on your device.');
      return;
    }

    // Prefer local URI if available
    if (job.fileUri) {
      if (Platform.OS === 'web') {
        // This part is tricky on web as we can't directly use fileUri for download prompt.
        // A potential solution is to convert the file back to a blob URL.
        // For simplicity, we assume web will always use downloadUrl.
        // If local generation on web is a must, this needs more work.
        console.warn("Direct download from local URI is not supported on web. Falling back to downloadUrl if available.");
        if (job.downloadUrl) window.open(job.downloadUrl, '_blank');
        else Alert.alert("Download Error", "No web download link available for this local file.");
        return;
      }
      await Sharing.shareAsync(job.fileUri, { dialogTitle: 'Download Report Card' });
      return;
    }

    // Fallback to download URL
    if (!job.downloadUrl) {
        Alert.alert('Error', 'No download URL or local file available for this report.');
        return;
    }

    if (Platform.OS === 'web') {
      window.open(job.downloadUrl, '_blank');
      return;
    }

    setGenerationJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'DOWNLOADING' } : j));

    try {
      const fileUri = FileSystem.cacheDirectory + `${job.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const { uri } = await FileSystem.downloadAsync(job.downloadUrl, fileUri);
      await Sharing.shareAsync(uri, { dialogTitle: 'Download Report Card' });
    } catch (error) {
      Alert.alert('Error', 'Could not download the file.');
    } finally {
      setGenerationJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'COMPLETED' } : j));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    await updateJobStatuses();
    setRefreshing(false);
  }, [loadInitialData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#34C759';
      case 'PROCESSING': return '#FF9500';
      case 'PENDING': return '#007AFF';
      case 'FAILED': return '#FF3B30';
      case 'NOT_GENERATED': return '#8E8E93';
      case 'DOWNLOADING': return '#5AC8FA';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'checkmark-circle-outline';
      case 'PROCESSING': return 'hourglass-outline';
      case 'PENDING': return 'time-outline';
      case 'FAILED': return 'close-circle-outline';
      case 'NOT_GENERATED': return 'document-text-outline';
      case 'DOWNLOADING': return 'arrow-down-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const filteredStudents = useMemo(() => 
    studentsWithAvailability.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    ), [studentsWithAvailability, searchQuery]);

  const filteredSubclasses = useMemo(() =>
    subclassesWithAvailability.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase())
    ), [subclassesWithAvailability, searchQuery]);

  const renderSelectionModal = () => {
    const isIndividual = generationType === 'INDIVIDUAL';
    const data: SelectionItem[] = isIndividual ? filteredStudents : filteredSubclasses;
    const selectedIds = isIndividual ? selectedStudents : selectedSubclasses;
    const setSelectedIds = isIndividual ? setSelectedStudents : setSelectedSubclasses;

    const toggleSelection = (id: number) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    };

    const toggleSelectAll = () => {
      if (selectedIds.length === data.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(data.map(item => item.id));
      }
    };

    return (
      <Modal
        visible={showSelectionModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowSelectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select {isIndividual ? 'Students' : 'Subclasses'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSelectionModal(false)}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${isIndividual ? 'students...' : 'subclasses...'}`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#AEAEB2"
            />
             {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <Ionicons name="close-circle" size={20} color="#AEAEB2" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.id);
              const isGeneratable = item.reportAvailability.status === 'NOT_GENERATED' || item.reportAvailability.status === 'FAILED';
              
              const title = 'matricule' in item ? item.name : `${item.className} - ${item.name}`;
              const subtitle = 'matricule' in item ? `${item.matricule} • ${item.className} - ${item.subClassName}` : `${item.studentCount} students`;

              return (
                <TouchableOpacity
                  style={[styles.selectionItem, isSelected && styles.selectedItem, !isGeneratable && styles.disabledItem]}
                  onPress={() => isGeneratable && toggleSelection(item.id)}
                  disabled={!isGeneratable}
                >
                  <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={24} color={isSelected ? '#007AFF' : '#C7C7CC'} />
                  <View style={styles.selectionItemInfo}>
                    <Text style={styles.selectionItemTitle}>{title}</Text>
                    <Text style={styles.selectionItemSubtitle}>{subtitle}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.reportAvailability.status) + '20'}]}>
                    <Ionicons
                      name={getStatusIcon(item.reportAvailability.status)}
                      size={14}
                      color={getStatusColor(item.reportAvailability.status)}
                    />
                     <Text style={[styles.statusBadgeText, { color: getStatusColor(item.reportAvailability.status) }]}>
                       {item.reportAvailability.status.replace('_', ' ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }}
            ListHeaderComponent={
              <View style={styles.selectionActions}>
                <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
                  <Text style={styles.selectAllText}>
                    {selectedIds.length === data.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.selectionCountText}>{selectedIds.length} selected</Text>
              </View>
            }
            contentContainerStyle={styles.modalContent}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.generateButton, (generating || selectedIds.length === 0) && styles.disabledButton]}
              onPress={handleGenerateReports}
              disabled={generating || selectedIds.length === 0}
            >
              {generating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="documents-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>
                    Generate {selectedIds.length} Report{selectedIds.length !== 1 && 's'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const renderJobItem = ({ item }: { item: GenerationJob }) => (
    <View style={styles.jobItem}>
      <View style={styles.jobInfo}>
        <View style={[styles.jobIconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={item.type === 'STUDENT' ? 'person-outline' : 'school-outline'} size={24} color={getStatusColor(item.status)} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.jobName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.jobDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.jobActions}>
        <View style={styles.jobStatusContainer}>
            <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
            <Text style={[styles.jobStatusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
        {item.status === 'COMPLETED' && (item.downloadUrl || item.fileUri) && (
            <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownloadReport(item)}>
            <Ionicons name="download-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
        )}
        {item.status === 'DOWNLOADING' && <ActivityIndicator style={{ paddingHorizontal: 12 }} />}
        {item.status === 'FAILED' && (
            <TouchableOpacity style={styles.retryButton} onPress={() => { /* Implement retry logic */ }}>
            <Ionicons name="refresh-outline" size={22} color="#FF9500" />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#C62828" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>1. Generation Settings</Text>
        
        <View style={[styles.settingItem, { zIndex: 3000 }]}>
          <Text style={styles.settingLabel}>Academic Year</Text>
          <DropDownPicker
            open={openYearPicker}
            value={yearValue}
            items={yearItems}
            setOpen={setOpenYearPicker}
            setValue={setYearValue}
            setItems={setYearItems}
            placeholder="Select Academic Year..."
            style={styles.dropdownPicker}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
        
        <View style={[styles.settingItem, { zIndex: 2000 }]}>
          <Text style={styles.settingLabel}>Exam / Sequence</Text>
          <DropDownPicker
            open={openSequencePicker}
            value={sequenceValue}
            items={sequenceItems}
            setOpen={setOpenSequencePicker}
            setValue={setSequenceValue}
            setItems={setSequenceItems}
            placeholder="Select Exam/Sequence..."
            disabled={!selectedAcademicYear}
            style={styles.dropdownPicker}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Generation Type</Text>
          <View style={styles.typeSelection}>
            <TouchableOpacity
              style={[styles.typeButton, generationType === 'INDIVIDUAL' && styles.activeTypeButton]}
              onPress={() => setGenerationType('INDIVIDUAL')}
            >
              <Ionicons name="person-outline" size={18} color={generationType === 'INDIVIDUAL' ? '#FFFFFF' : '#333'} />
              <Text style={[styles.typeButtonText, generationType === 'INDIVIDUAL' && styles.activeTypeButtonText]}>Individual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, generationType === 'SUBCLASS' && styles.activeTypeButton]}
              onPress={() => setGenerationType('SUBCLASS')}
            >
              <Ionicons name="school-outline" size={18} color={generationType === 'SUBCLASS' ? '#FFFFFF' : '#333'} />
              <Text style={[styles.typeButtonText, generationType === 'SUBCLASS' && styles.activeTypeButtonText]}>Subclass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.startSection}>
         <Text style={styles.sectionTitle}>2. Start Generation</Text>
         <TouchableOpacity
          style={[
            styles.generateMainButton,
            (!selectedAcademicYear || !selectedExamSequence) && styles.disabledButton,
          ]}
          onPress={() => setShowSelectionModal(true)}
          disabled={!selectedAcademicYear || !selectedExamSequence}
        >
          <Ionicons name="rocket-outline" size={24} color="#FFFFFF" />
          <Text style={styles.generateMainButtonText}>
            Select {generationType === 'INDIVIDUAL' ? 'Students' : 'Subclasses'} & Generate
          </Text>
        </TouchableOpacity>
        <Text style={styles.generateHint}>Select year, sequence and type to begin.</Text>
      </View>

      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>3. Generation Progress</Text>
      </View>
    </>
  );

  if (loading && !refreshing && !selectedAcademicYear) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Academic Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Cards</Text>
        <Text style={styles.subtitle}>Generate and manage student report cards</Text>
      </View>

      <FlatList
        data={generationJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyJobsContainer}>
            <Ionicons name="file-tray-outline" size={48} color="#BEBEC2" />
            <Text style={styles.emptyJobsText}>No report generation jobs yet.</Text>
            <Text style={styles.emptyJobsSubText}>Your initiated jobs will appear here.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={<RefreshControl tintColor="#007AFF" refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContentContainer}
      />
      
      {renderSelectionModal()}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8E',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    flex: 1,
  },
  settingsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  startSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 4,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 20,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 5,
  },
  typeSelection: {
    flexDirection: 'row',
    backgroundColor: '#EFEFF4',
    borderRadius: 10,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8E',
  },
  activeTypeButtonText: {
    color: '#1D1D1F',
  },
  generateMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  generateMainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateHint: {
    textAlign: 'center',
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 13,
  },
  jobsSection: {
    margin: 16,
  },
  emptyJobsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyJobsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyJobsSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
  },
  jobItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  jobDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  jobActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  jobStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  downloadButton: {
    padding: 8,
  },
  retryButton: {
    padding: 8,
  },
  separator: {
      height: 12,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#EFEFF4',
    borderRadius: 10,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    top: 12,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 28,
    top: 12,
  },
  modalContent: {
    paddingBottom: 100, // Space for the action button
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9FB'
  },
  selectAllButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionCountText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
    gap: 16,
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
  },
  disabledItem: {
    opacity: 0.5,
  },
  selectionItemInfo: {
    flex: 1,
  },
  selectionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase'
  },
  modalActions: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  listContentContainer: {
    paddingBottom: 24,
  },
  jobsSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  // New styles for DropDownPicker
  dropdownPicker: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E5E5EA',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
});

export default VPReportCards; 