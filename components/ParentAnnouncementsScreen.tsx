import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

interface Attachment {
  fileName: string;
  fileUrl: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedAt: string;
  author: string;
  category: 'Academic' | 'Financial' | 'Events' | 'General';
  attachments?: Attachment[];
}

type ParentAnnouncementsScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentAnnouncements'>;

type Category = 'All' | 'Academic' | 'Financial' | 'Events' | 'General';
const categories: Category[] = ['All', 'Academic', 'Financial', 'Events', 'General'];

const ParentAnnouncementsScreen: React.FC<ParentAnnouncementsScreenProps> = ({ navigation, route }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<number>>(new Set());

  const token = route.params?.token || 'mock_token';

  const fetchAnnouncements = async () => {
    try {
      console.log('🔔 Fetching announcements...');
      console.log('Using token:', token);
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/parents/announcements', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Announcements API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('Announcements API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          const announcementsData = Array.isArray(apiData.data) ? apiData.data : apiData.data.announcements;
          if (announcementsData && Array.isArray(announcementsData)) {
            setAnnouncements(announcementsData);
            console.log('✅ Successfully loaded real announcements data');
            return;
          } else {
            console.log('API data is not in expected array format:', apiData.data);
          }
        } else {
          console.log('API returned success=false or missing data:', apiData);
        }
      } else {
        const errorData = await response.text();
        console.log('Announcements API Error:', response.status, errorData);
      }
    } catch (error) {
      console.log('Announcements API call failed:', error);
    }

    console.log('📋 Using mock announcements data as fallback');
    setAnnouncements(mockAnnouncements);
  };

  useEffect(() => {
    fetchAnnouncements().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const toggleExpanded = (announcementId: number) => {
    const newExpanded = new Set(expandedAnnouncements);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedAnnouncements(newExpanded);
  };

  const handleAttachmentPress = async (attachment: Attachment) => {
    try {
      const supported = await Linking.canOpenURL(attachment.fileUrl);
      if (supported) {
        await Linking.openURL(attachment.fileUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open attachment');
    }
  };

  const mockAnnouncements: Announcement[] = [
    {
      id: 1,
      title: 'URGENT: School Closure Notice',
      content: 'Due to heavy rains and flooding in the area, the school will be closed tomorrow (January 21, 2024). All classes, examinations, and school activities are suspended for safety reasons. Normal operations will resume on Monday, January 22, 2024. Parents are advised to keep their children at home and ensure their safety. For any urgent matters, please contact the school administration via WhatsApp at +237 6XX XXX XXX. Stay safe!',
      priority: 'HIGH',
      publishedAt: 'January 20, 2024',
      author: 'Principal',
      category: 'General',
      attachments: [
        { fileName: 'Closure_Notice.pdf', fileUrl: 'https://example.com/closure_notice.pdf' }
      ]
    },
    {
      id: 2,
      title: 'Parent-Teacher Conference 2024',
      content: 'We are pleased to announce our annual parent-teacher conference scheduled for February 5-7, 2024. This is an excellent opportunity for parents to meet with teachers, discuss their children\'s academic progress, and address any concerns. Appointments can be booked online through the school portal starting January 25th. Each session will last 15 minutes. Please bring your child\'s report card and any questions you may have.',
      priority: 'MEDIUM',
      publishedAt: 'January 18, 2024',
      author: 'Academic Office',
      category: 'Events',
      attachments: [
        { fileName: 'Conference_Schedule.pdf', fileUrl: 'https://example.com/conference_schedule.pdf' },
        { fileName: 'Booking_Guide.pdf', fileUrl: 'https://example.com/booking_guide.pdf' }
      ]
    },
    {
      id: 3,
      title: 'Second Term Fee Payment Reminder',
      content: 'This is a friendly reminder that second term fees are due by January 31st, 2024. Please use any of the available payment methods (Mobile Money, Bank Transfer, or Cash at Bursar\'s Office) to settle outstanding balances. Late payment may result in additional charges. For payment difficulties, please contact the Bursar\'s office to discuss payment plans.',
      priority: 'MEDIUM',
      publishedAt: 'January 15, 2024',
      author: 'Bursar',
      category: 'Financial',
    },
    {
      id: 4,
      title: 'Science Fair Winners Announced',
      content: 'Congratulations to all students who participated in our annual science fair! The creativity and innovation displayed were truly impressive. Winners will receive prizes at the next assembly. Special recognition goes to the top three projects in each category.',
      priority: 'LOW',
      publishedAt: 'January 14, 2024',
      author: 'HOD Science',
      category: 'Academic',
    },
  ];

  const filteredAnnouncements = activeCategory === 'All' 
    ? announcements 
    : announcements.filter((a) => a.category === activeCategory);

  const getPriorityColor = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH': return '#ff6b6b';
      case 'MEDIUM': return '#f093fb';
      default: return '#43e97b';
    }
  };

  const getPriorityBackground = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH': return '#ffebee';
      case 'MEDIUM': return '#fff3e0';
      default: return '#f1f8e9';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic': return '📚';
      case 'Financial': return '💰';
      case 'Events': return '📅';
      case 'General': return '📢';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return '#4facfe';
      case 'Financial': return '#f093fb';
      case 'Events': return '#43e97b';
      case 'General': return '#667eea';
      default: return '#94a3b8';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>📢 Announcements</Text>
            <Text style={styles.headerSubtitle}>Stay updated with school news</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[
                styles.filterChip, 
                activeCategory === category && styles.filterChipActive
              ]}
            >
              <Text style={styles.filterIcon}>{getCategoryIcon(category)}</Text>
              <Text style={[
                styles.filterText, 
                activeCategory === category && styles.filterTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {filteredAnnouncements.map((announcement) => {
          const isExpanded = expandedAnnouncements.has(announcement.id);
          
          return (
            <View key={announcement.id} style={styles.announcementCard}>
              {/* Priority Badge */}
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.priority) }]}>
                <Text style={styles.priorityText}>
                  {announcement.priority === 'HIGH' ? '🔴 URGENT' : 
                   announcement.priority === 'MEDIUM' ? '🟡 IMPORTANT' : '🟢 INFO'}
                </Text>
              </View>

              {/* Header */}
              <View style={styles.announcementHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(announcement.category)}15` }]}>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(announcement.category)}</Text>
                  <Text style={[styles.categoryText, { color: getCategoryColor(announcement.category) }]}>
                    {announcement.category}
                  </Text>
                </View>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
              </View>

              {/* Meta Information */}
              <View style={styles.metaContainer}>
                <View style={styles.authorContainer}>
                  <Text style={styles.authorIcon}>👤</Text>
                  <Text style={styles.authorText}>{announcement.author}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(announcement.publishedAt)}</Text>
              </View>

              {/* Content */}
              <Text style={styles.announcementContent} numberOfLines={isExpanded ? undefined : 3}>
                {announcement.content}
              </Text>

              {/* Attachments */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  <Text style={styles.attachmentsTitle}>📎 Attachments</Text>
                  {announcement.attachments.map((attachment, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.attachmentItem}
                      onPress={() => handleAttachmentPress(attachment)}
                    >
                      <Text style={styles.attachmentIcon}>📄</Text>
                      <Text style={styles.attachmentName}>{attachment.fileName}</Text>
                      <Text style={styles.attachmentAction}>↗</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => toggleExpanded(announcement.id)}
                >
                  <Text style={styles.readMoreText}>
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
                
                {announcement.category === 'Events' && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>📅 Book</Text>
                  </TouchableOpacity>
                )}
                
                {announcement.category === 'Financial' && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>💳 Pay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No announcements found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting a different category or check back later
            </Text>
          </View>
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
    backgroundColor: '#f8fafc',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#667eea',
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    marginTop: -20,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  resultsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  resultsCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  announcementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  priorityBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  announcementHeader: {
    marginBottom: 16,
    marginRight: 80,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  authorText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  announcementContent: {
    color: '#1e293b',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  attachmentsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attachmentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  attachmentAction: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  readMoreText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ParentAnnouncementsScreen; 