import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { formatCurrency, formatNumber, safeNumber } from '../../constants';

const { width } = Dimensions.get('window');

interface LatestMark {
  subjectName: string;
  latestMark: number;
  sequence: string;
  date: string;
}

interface ChildSummary {
  id: number;
  name: string;
  className?: string;
  subclassName?: string;
  enrollmentStatus: string;
  photo?: string;
  attendanceRate: number;
  latestMarks: LatestMark[];
  pendingFees: number;
  disciplineIssues: number;
  recentAbsences: number;
}

interface ParentChildrenScreenProps {
  route: any;
  navigation: any;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const ParentChildrenScreen: React.FC<ParentChildrenScreenProps> = ({ 
  route, 
  navigation, 
  onLogout, 
  onNavigate 
}) => {
  const { user, selectedRole, token } = route.params;
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<ChildSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchChildren = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedRole.academicYearId) {
        queryParams.append('academicYearId', selectedRole.academicYearId.toString());
      }
      
      const url = `https://sms.sniperbuisnesscenter.com/api/v1/parents/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success && apiData.data && apiData.data.children) {
          setChildren(apiData.data.children);
          setFilteredChildren(apiData.data.children);
          return;
        }
      }
    } catch (error) {
      console.log('Failed to fetch children:', error);
    }

    // Fallback to mock data
    const mockChildren: ChildSummary[] = [
      {
        id: 1,
        name: 'John Doe',
        className: 'Form 5A',
        subclassName: 'Science Stream',
        enrollmentStatus: 'ASSIGNED_TO_CLASS',
        photo: 'https://via.placeholder.com/80',
        attendanceRate: 92,
        latestMarks: [
          { subjectName: 'Mathematics', latestMark: 16, sequence: 'Sequence 1', date: '2024-01-20' },
          { subjectName: 'Physics', latestMark: 18, sequence: 'Sequence 1', date: '2024-01-18' }
        ],
        pendingFees: 25000,
        disciplineIssues: 0,
        recentAbsences: 2,
      },
      {
        id: 2,
        name: 'Mary Doe',
        className: 'Form 3B',
        subclassName: 'Arts Stream',
        enrollmentStatus: 'NOT_ENROLLED',
        photo: 'https://via.placeholder.com/80',
        attendanceRate: 95,
        latestMarks: [
          { subjectName: 'English', latestMark: 17, sequence: 'Sequence 1', date: '2024-01-19' },
          { subjectName: 'History', latestMark: 15, sequence: 'Sequence 1', date: '2024-01-17' }
        ],
        pendingFees: 25000,
        disciplineIssues: 0,
        recentAbsences: 1,
      },
      {
        id: 3,
        name: 'Jane Smith',
        className: 'Form 1C',
        subclassName: 'General',
        enrollmentStatus: 'PENDING_ASSIGNMENT',
        photo: 'https://via.placeholder.com/80',
        attendanceRate: 98,
        latestMarks: [
          { subjectName: 'Mathematics', latestMark: 19, sequence: 'Sequence 1', date: '2024-01-20' },
          { subjectName: 'English', latestMark: 18, sequence: 'Sequence 1', date: '2024-01-18' }
        ],
        pendingFees: 0,
        disciplineIssues: 0,
        recentAbsences: 0,
      },
    ];
    setChildren(mockChildren);
    setFilteredChildren(mockChildren);
  };

  useEffect(() => {
    fetchChildren().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    filterChildren();
  }, [searchQuery, selectedFilter, children]);

  const filterChildren = () => {
    let filtered = children;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(child =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.subclassName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'enrolled':
          filtered = filtered.filter(child => child.enrollmentStatus === 'ASSIGNED_TO_CLASS');
          break;
        case 'fees':
          filtered = filtered.filter(child => child.pendingFees > 0);
          break;
        case 'attendance':
          filtered = filtered.filter(child => child.attendanceRate < 90);
          break;
        case 'discipline':
          filtered = filtered.filter(child => child.disciplineIssues > 0);
          break;
      }
    }

    setFilteredChildren(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    setRefreshing(false);
  };

  const getLatestAverage = (marks: LatestMark[]): number => {
    if (marks.length === 0) return 0;
    return marks.reduce((sum, mark) => sum + mark.latestMark, 0) / marks.length;
  };

  const filters = [
    { id: 'all', label: 'All', count: children.length },
    { id: 'enrolled', label: 'Enrolled', count: children.filter(c => c.enrollmentStatus === 'ASSIGNED_TO_CLASS').length },
    { id: 'fees', label: 'Pending Fees', count: children.filter(c => c.pendingFees > 0).length },
    { id: 'attendance', label: 'Low Attendance', count: children.filter(c => c.attendanceRate < 90).length },
    { id: 'discipline', label: 'Discipline Issues', count: children.filter(c => c.disciplineIssues > 0).length },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading children...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👨‍👩‍👧‍👦 My Children</Text>
        <Text style={styles.headerSubtitle}>
          {filteredChildren.length} {filteredChildren.length === 1 ? 'child' : 'children'} found
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search children, class, or stream..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.activeFilterTabText,
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                selectedFilter === filter.id && styles.activeFilterBadge,
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  selectedFilter === filter.id && styles.activeFilterBadgeText,
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Children List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredChildren.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyStateText}>No children found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          filteredChildren.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => onNavigate('ChildDetails', { studentId: child.id, token })}
              activeOpacity={0.8}
            >
              <View style={styles.childCardHeader}>
                <View style={styles.childInfo}>
                  <View style={styles.childPhotoContainer}>
                    <Image source={{ uri: child.photo }} style={styles.childPhoto} />
                    <View style={[styles.statusIndicator, { 
                      backgroundColor: child.enrollmentStatus === 'ASSIGNED_TO_CLASS' ? '#43e97b' : '#ff6b6b' 
                    }]} />
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childClass}>{child.className} • {child.subclassName}</Text>
                    <View style={styles.enrollmentBadge}>
                      <Text style={styles.enrollmentText}>
                        {child.enrollmentStatus === 'ASSIGNED_TO_CLASS' ? 'Enrolled' : 'Not Enrolled'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => Alert.alert('More Options', 'Feature coming soon!')}
                >
                  <Text style={styles.moreButtonText}>⋯</Text>
                </TouchableOpacity>
              </View>
              
              {/* Performance Metrics */}
              <View style={styles.performanceContainer}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Attendance</Text>
                  <Text style={[styles.performanceValue, { 
                    color: child.attendanceRate >= 90 ? '#43e97b' : child.attendanceRate >= 75 ? '#f093fb' : '#ff6b6b' 
                  }]}>
                    {child.attendanceRate}%
                  </Text>
                </View>
                
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Average</Text>
                  <Text style={[styles.performanceValue, { color: '#4facfe' }]}>
                    {getLatestAverage(child.latestMarks).toFixed(1)}/20
                  </Text>
                </View>
                
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Pending Fees</Text>
                  <Text style={[styles.performanceValue, { 
                    color: safeNumber(child.pendingFees) > 0 ? '#ff6b6b' : '#43e97b' 
                  }]}>
                    {safeNumber(child.pendingFees) > 0 ? formatNumber(child.pendingFees) : 'Paid'}
                  </Text>
                </View>
              </View>

              {/* Recent Grades */}
              {child.latestMarks.length > 0 && (
                <View style={styles.gradesPreview}>
                  <Text style={styles.gradesTitle}>Recent Grades</Text>
                  <View style={styles.gradesContainer}>
                    {child.latestMarks.slice(0, 4).map((mark, index) => (
                      <View key={index} style={styles.gradeChip}>
                        <Text style={styles.gradeSubject}>{mark.subjectName}</Text>
                        <Text style={[styles.gradeValue, {
                          color: mark.latestMark >= 15 ? '#43e97b' : mark.latestMark >= 10 ? '#f093fb' : '#ff6b6b'
                        }]}>
                          {mark.latestMark}/20
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.primaryAction}
                  onPress={() => onNavigate('ChildDetails', { studentId: child.id, token })}
                >
                  <Text style={styles.primaryActionText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryAction}
                  onPress={() => onNavigate('ParentMessages', { token })}
                >
                  <Text style={styles.secondaryActionText}>📧 Message</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: -20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  clearIcon: {
    fontSize: 16,
    color: '#94a3b8',
    padding: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeFilterTab: {
    backgroundColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 8,
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  activeFilterBadgeText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  childCard: {
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
  childCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childPhotoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  childPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  childClass: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  enrollmentBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  enrollmentText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  moreButtonText: {
    fontSize: 18,
    color: '#64748b',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradesPreview: {
    marginBottom: 20,
  },
  gradesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  gradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gradeSubject: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ParentChildrenScreen; 