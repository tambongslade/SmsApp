import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// --- Interfaces based on parent.workflow.md ---

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedAt: string;
  author: string;
  category: 'Academic' | 'Financial' | 'Events' | 'General';
}

type ParentAnnouncementsScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentAnnouncements'>;

// --- Mock Data ---

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'URGENT: School Closure Notice',
    content: 'Due to heavy rains, school will be closed tomorrow (January 21). All classes resuming Monday. Stay safe!',
    priority: 'HIGH',
    publishedAt: 'January 20, 2024',
    author: 'Principal',
    category: 'General',
  },
  {
    id: 2,
    title: 'Parent-Teacher Conference',
    content: 'Annual parent-teacher conference scheduled for February 5-7. Book your appointments online.',
    priority: 'MEDIUM',
    publishedAt: 'January 18, 2024',
    author: 'Academic Office',
    category: 'Events',
  },
  {
    id: 3,
    title: 'Fee Payment Reminder',
    content: 'Second term fees are due by January 31st. Please use the available payment methods to settle any outstanding balance.',
    priority: 'MEDIUM',
    publishedAt: 'January 15, 2024',
    author: 'Bursar',
    category: 'Financial',
  },
  {
    id: 4,
    title: 'Science Fair Winners',
    content: 'Congratulations to all students who participated in the annual science fair. The winners are...',
    priority: 'LOW',
    publishedAt: 'January 14, 2024',
    author: 'HOD Science',
    category: 'Academic',
  },
];

type Category = 'All' | 'Academic' | 'Financial' | 'Events' | 'General';
const categories: Category[] = ['All', 'Academic', 'Financial', 'Events', 'General'];

const ParentAnnouncementsScreen: React.FC<ParentAnnouncementsScreenProps> = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredAnnouncements =
    activeCategory === 'All'
      ? mockAnnouncements
      : mockAnnouncements.filter((a) => a.category === activeCategory);

  const getPriorityStyle = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH':
        return styles.announcementHigh;
      case 'MEDIUM':
        return styles.announcementMedium;
      default:
        return styles.announcementLow;
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>School Announcements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Filters */}
      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[styles.tabButton, activeCategory === category && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeCategory === category ? styles.tabTextActive : styles.tabTextInactive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredAnnouncements.map((announcement) => (
          <View key={announcement.id} style={[styles.announcementCard, getPriorityStyle(announcement.priority)]}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementMeta}>
              By {announcement.author} on {announcement.publishedAt}
            </Text>
            <Text style={styles.announcementContent}>{announcement.content}</Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  tabsBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabTextInactive: {
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  announcementCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
  },
  announcementHigh: {
    borderLeftColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  announcementMedium: {
    borderLeftColor: '#facc15',
    backgroundColor: '#fefce8',
  },
  announcementLow: {
    borderLeftColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  announcementMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  announcementContent: {
    color: '#374151',
    fontSize: 15,
  },
  readMoreButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ParentAnnouncementsScreen; 